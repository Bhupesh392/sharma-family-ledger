/**
 * OCR Parser for Payment Screenshots
 * Uses Tesseract.js to extract text from payment screenshots
 * (Google Pay, PhonePe, Paytm, bank apps)
 * 
 * Note: OCR is optional - text message parsing is the primary method
 */

export interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * Extract text from payment screenshot using OCR
 * This is an optional feature - falls back gracefully if OCR is not available
 */
export async function extractTextFromImage(file: File): Promise<OCRResult> {
  try {
    // Dynamic import to avoid SSR issues
    if (typeof window === 'undefined') {
      throw new Error('OCR is only available in the browser');
    }

    const Tesseract = await import('tesseract.js');
    
    const result = await Tesseract.default.recognize(
      file,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      }
    );

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('OCR is not available. Please use text input instead.');
  }
}

/**
 * Parse payment screenshot (image file)
 */
export async function parsePaymentImage(file: File): Promise<{
  parsed: ReturnType<typeof import('./payment-parser').parsePaymentMessage>;
  ocrConfidence: number;
}> {
  try {
    // Step 1: Extract text from image
    const { text, confidence } = await extractTextFromImage(file);
    
    console.log('OCR extracted text:', text);
    console.log('OCR confidence:', confidence);

    // Step 2: Parse the extracted text
    const { parsePaymentMessage } = await import('./payment-parser');
    const parsed = parsePaymentMessage(text);

    return {
      parsed,
      ocrConfidence: confidence,
    };
  } catch (error) {
    console.error('Image parsing failed:', error);
    throw new Error('Failed to parse image. Please use text input instead.');
  }
}

/**
 * Validate OCR result quality
 */
export function validateOCRResult(result: OCRResult): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check confidence threshold
  if (result.confidence < 60) {
    warnings.push('Image quality is low. Text may not be accurately extracted.');
  }

  // Check if text is too short
  if (result.text.length < 20) {
    warnings.push('Very little text detected. Please ensure the screenshot is clear.');
  }

  // Check for common payment keywords
  const hasPaymentKeywords = 
    result.text.includes('₹') ||
    result.text.includes('Rs') ||
    result.text.includes('INR') ||
    result.text.includes('credited') ||
    result.text.includes('paid') ||
    result.text.includes('received');

  if (!hasPaymentKeywords) {
    warnings.push('No payment-related keywords found. Please verify this is a payment screenshot.');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}