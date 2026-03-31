import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

const SYSTEM_PROMPT = `You are an invoice data extraction agent. Your job is to analyze invoice images or documents and extract structured data.

You MUST respond with ONLY a valid JSON object (no markdown, no explanation, no code blocks) with this exact structure:
{
  "supplier": "Company name from the invoice",
  "supplierCode": "Supplier CNPJ or ID if visible, or null",
  "invoiceNumber": "Invoice number/ID",
  "date": "YYYY-MM-DD format",
  "total": 0.00,
  "currency": "BRL or USD",
  "lineItems": [
    {
      "name": "Product name/description",
      "supplierCode": "Supplier's internal product code (cProd in NFe), or null",
      "ean": "EAN/GTIN barcode (13 or 8 digits) if visible (cEAN in NFe), or null",
      "quantity": 1,
      "unitPrice": 0.00
    }
  ]
}

IMPORTANT RULES:
- Extract ALL line items from the invoice
- For Brazilian NFe XML: look for <cEAN> or <cEANTrib> tags for EAN codes
- For Brazilian NFe XML: look for <cProd> for supplier's product code
- If EAN shows "SEM GTIN" or similar, set ean to null
- Only include valid EAN codes (8 or 13 digits)
- For dates, convert to YYYY-MM-DD format
- For totals, use numeric values without currency symbols
- If currency is not clear, assume BRL
- If something is not clear, make your best guess based on context`;

const generateId = () => Math.random().toString(36).substring(2, 9);

// Validate EAN-13 check digit
const validateEan13 = (ean) => {
  if (!/^\d{13}$/.test(ean)) return false;
  const digits = ean.split('').map(Number);
  const checkDigit = digits[12];
  const sum = digits.slice(0, 12).reduce((acc, digit, index) => {
    return acc + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);
  const calculatedCheck = (10 - (sum % 10)) % 10;
  return checkDigit === calculatedCheck;
};

// Validate EAN-8 check digit
const validateEan8 = (ean) => {
  if (!/^\d{8}$/.test(ean)) return false;
  const digits = ean.split('').map(Number);
  const checkDigit = digits[7];
  const sum = digits.slice(0, 7).reduce((acc, digit, index) => {
    return acc + digit * (index % 2 === 0 ? 3 : 1);
  }, 0);
  const calculatedCheck = (10 - (sum % 10)) % 10;
  return checkDigit === calculatedCheck;
};

// Validate any EAN
const validateEan = (ean) => {
  if (!ean) return false;
  const cleaned = ean.replace(/\D/g, '');
  if (cleaned.length === 13) return validateEan13(cleaned);
  if (cleaned.length === 8) return validateEan8(cleaned);
  return false;
};

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle CORS preflight
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { fileBase64, contentType, fileName } = body;

    if (!fileBase64 || !contentType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing fileBase64 or contentType" }),
      };
    }

    // Determine if this is XML content
    const isXml = contentType === "application/xml" ||
                  contentType === "text/xml" ||
                  (fileName && fileName.toLowerCase().endsWith(".xml"));

    // Build the message for Claude
    let messages;

    if (isXml) {
      // For XML, decode base64 and send as text
      const xmlContent = Buffer.from(fileBase64, "base64").toString("utf-8");
      messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this XML invoice (NFe/NFSe)${fileName ? ` (${fileName})` : ""} and extract the data. Pay special attention to <cEAN>, <cEANTrib>, and <cProd> fields for product identification. The XML content is:\n\n${xmlContent}\n\nRespond with ONLY a JSON object, no other text.`,
            },
          ],
        },
      ];
    } else if (contentType === "application/pdf") {
      messages = [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: fileBase64,
              },
            },
            {
              type: "text",
              text: `Analyze this invoice${fileName ? ` (${fileName})` : ""} and extract the data. Look for any EAN/GTIN barcodes (13 or 8 digit numbers). Respond with ONLY a JSON object, no other text.`,
            },
          ],
        },
      ];
    } else if (contentType.startsWith("image/")) {
      messages = [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: contentType,
                data: fileBase64,
              },
            },
            {
              type: "text",
              text: `Analyze this invoice${fileName ? ` (${fileName})` : ""} and extract the data. Look for any EAN/GTIN barcodes (13 or 8 digit numbers). Respond with ONLY a JSON object, no other text.`,
            },
          ],
        },
      ];
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Unsupported file type. Use PDF, XML, or images." }),
      };
    }

    const command = new InvokeModelCommand({
      modelId: "us.anthropic.claude-haiku-4-5-20251001-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Extract the text content from Claude's response
    const textContent = responseBody.content?.find(c => c.type === "text")?.text || "";

    // Parse the JSON from the response
    let extractedData;
    try {
      // Try to find JSON in the response (in case there's extra text)
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse response:", textContent);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Failed to parse extracted data",
          rawResponse: textContent
        }),
      };
    }

    // Validate and ensure all required fields exist
    const lineItems = (extractedData.lineItems || []).map((item, index) => {
      // Clean and validate EAN
      let ean = item.ean || null;
      if (ean) {
        ean = ean.replace(/\D/g, '');
        if (!validateEan(ean)) {
          ean = null;
        }
      }

      // Determine EAN status
      let eanStatus = 'unknown';
      let eanSource = null;
      if (ean) {
        eanStatus = 'resolved';
        eanSource = 'extracted';
      }

      return {
        id: generateId(),
        name: item.name || `Item ${index + 1}`,
        supplierCode: item.supplierCode || item.sku || null,
        ean: ean,
        eanStatus,
        eanSource,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        isEdited: false,
        isNewProduct: ean === null,
      };
    });

    const hasUnresolvedEans = lineItems.some(item => item.eanStatus === 'unknown');

    const validatedData = {
      supplier: extractedData.supplier || "Unknown Supplier",
      supplierCode: extractedData.supplierCode || null,
      invoiceNumber: extractedData.invoiceNumber || `INV-${Date.now()}`,
      date: extractedData.date || new Date().toISOString().split("T")[0],
      total: Number(extractedData.total) || 0,
      currency: extractedData.currency || "BRL",
      lineItems,
      hasUnresolvedEans,
      isEdited: false,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(validatedData),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
