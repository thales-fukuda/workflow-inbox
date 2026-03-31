import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

const SYSTEM_PROMPT = `You are an invoice data extraction agent. Your job is to analyze invoice images or documents and extract structured data.

You MUST respond with ONLY a valid JSON object (no markdown, no explanation, no code blocks) with this exact structure:
{
  "supplier": "Company name from the invoice",
  "invoiceNumber": "Invoice number/ID",
  "date": "YYYY-MM-DD format",
  "total": 0.00,
  "currency": "BRL or USD",
  "lineItems": [
    {
      "name": "Product name",
      "sku": "SKU code if visible, or null if not found",
      "quantity": 1,
      "unitPrice": 0.00,
      "isNewSku": false
    }
  ]
}

Rules:
- Extract ALL line items from the invoice
- If SKU is not visible, set "sku" to null and "isNewSku" to true
- If currency is not clear, assume BRL
- For dates, convert to YYYY-MM-DD format
- For totals, use numeric values without currency symbols
- If something is not clear, make your best guess based on context`;

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
              text: `Analyze this XML invoice (NFe/NFSe)${fileName ? ` (${fileName})` : ""} and extract the data. The XML content is:\n\n${xmlContent}\n\nRespond with ONLY a JSON object, no other text.`,
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
              text: `Analyze this invoice${fileName ? ` (${fileName})` : ""} and extract the data. Respond with ONLY a JSON object, no other text.`,
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
              text: `Analyze this invoice${fileName ? ` (${fileName})` : ""} and extract the data. Respond with ONLY a JSON object, no other text.`,
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
      modelId: "us.anthropic.claude-3-5-haiku-20241022-v1:0",
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
    const validatedData = {
      supplier: extractedData.supplier || "Unknown Supplier",
      invoiceNumber: extractedData.invoiceNumber || `INV-${Date.now()}`,
      date: extractedData.date || new Date().toISOString().split("T")[0],
      total: Number(extractedData.total) || 0,
      currency: extractedData.currency || "BRL",
      lineItems: (extractedData.lineItems || []).map((item, index) => ({
        name: item.name || `Item ${index + 1}`,
        sku: item.sku || null,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        isNewSku: item.sku === null || item.isNewSku === true,
      })),
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
