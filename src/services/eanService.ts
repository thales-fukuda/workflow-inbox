import type { EanSuggestion } from '../types';

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v2';

interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  brands?: string;
  categories?: string;
  image_url?: string;
  image_small_url?: string;
}

interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
}

interface OpenFoodFactsSearchResponse {
  count: number;
  products: OpenFoodFactsProduct[];
}

// Validate EAN-13 check digit
export const validateEan13 = (ean: string): boolean => {
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
export const validateEan8 = (ean: string): boolean => {
  if (!/^\d{8}$/.test(ean)) return false;

  const digits = ean.split('').map(Number);
  const checkDigit = digits[7];
  const sum = digits.slice(0, 7).reduce((acc, digit, index) => {
    return acc + digit * (index % 2 === 0 ? 3 : 1);
  }, 0);

  const calculatedCheck = (10 - (sum % 10)) % 10;
  return checkDigit === calculatedCheck;
};

// Validate any EAN/GTIN
export const validateEan = (ean: string): boolean => {
  const cleaned = ean.replace(/\D/g, '');
  if (cleaned.length === 13) return validateEan13(cleaned);
  if (cleaned.length === 8) return validateEan8(cleaned);
  if (cleaned.length === 12) {
    // UPC-A, pad to EAN-13
    return validateEan13('0' + cleaned);
  }
  return false;
};

// Format EAN (add leading zeros if needed)
export const formatEan = (ean: string): string => {
  const cleaned = ean.replace(/\D/g, '');
  if (cleaned.length === 12) return '0' + cleaned;
  return cleaned;
};

// Lookup product by EAN in Open Food Facts
export const lookupEan = async (ean: string): Promise<EanSuggestion | null> => {
  try {
    const formattedEan = formatEan(ean);
    const response = await fetch(
      `${OPEN_FOOD_FACTS_API}/product/${formattedEan}.json`,
      {
        headers: {
          'User-Agent': 'WorkflowInbox/1.0',
        },
      }
    );

    if (!response.ok) return null;

    const data: OpenFoodFactsResponse = await response.json();

    if (data.status !== 1 || !data.product) return null;

    return {
      ean: data.product.code,
      productName: data.product.product_name || 'Unknown Product',
      brand: data.product.brands,
      confidence: 100,
      source: 'Open Food Facts',
      imageUrl: data.product.image_small_url || data.product.image_url,
    };
  } catch (error) {
    console.error('Error looking up EAN:', error);
    return null;
  }
};

// Search products by name in Open Food Facts
export const searchProducts = async (
  query: string,
  limit: number = 10
): Promise<EanSuggestion[]> => {
  try {
    const response = await fetch(
      `${OPEN_FOOD_FACTS_API}/search?search_terms=${encodeURIComponent(query)}&page_size=${limit}&json=1`,
      {
        headers: {
          'User-Agent': 'WorkflowInbox/1.0',
        },
      }
    );

    if (!response.ok) return [];

    const data: OpenFoodFactsSearchResponse = await response.json();

    return data.products
      .filter(p => p.code && p.product_name)
      .map(p => ({
        ean: p.code,
        productName: p.product_name || 'Unknown',
        brand: p.brands,
        confidence: 80, // Lower confidence for search results
        source: 'Open Food Facts',
        imageUrl: p.image_small_url || p.image_url,
      }));
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Calculate similarity between two strings (for matching)
export const stringSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;

  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  const commonWords = words1.filter(w => words2.includes(w));
  const similarity = (commonWords.length * 2) / (words1.length + words2.length);

  return Math.round(similarity * 100);
};

// Extract potential EAN from text (13 or 8 digit numbers)
export const extractEanFromText = (text: string): string | null => {
  // Look for 13-digit numbers (EAN-13)
  const ean13Match = text.match(/\b\d{13}\b/);
  if (ean13Match && validateEan13(ean13Match[0])) {
    return ean13Match[0];
  }

  // Look for 8-digit numbers (EAN-8)
  const ean8Match = text.match(/\b\d{8}\b/);
  if (ean8Match && validateEan8(ean8Match[0])) {
    return ean8Match[0];
  }

  return null;
};
