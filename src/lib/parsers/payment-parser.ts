/**
 * Payment Message Parser
 * Parses bank SMS, WhatsApp messages, and payment screenshots
 * to extract: amount, date, payer, transaction ID, bank details
 */

export interface ParsedPayment {
  amount: number;
  date: Date;
  payer: string;
  payee?: string;
  transactionId?: string;
  bank?: string;
  upiId?: string;
  confidence: number;
  rawMessage: string;
}

// Bank-specific regex patterns for Indian banks
const DATE_DD_MMM_YY = /\d{1,2}-[A-Za-z]{3}-\d{2,4}/; // 10-Jun-26 or 10-Jun-2026
const BANK_PATTERNS = {
  SBI: {
    pattern: /(?:Dear Customer,?\s+)?(?:Your A\/c|Acct)\s+[\w]+\s+is credited with Rs\.?\s*([\d,]+\.\d{2})\s+on\s+(\d{1,2}-[A-Za-z]{3}-\d{2,4})\s+(?:by\s+([\w\/]+)\s+)?from\s+([A-Z][A-Z\s]+?)(?:\s*[.,]|$)/i,
    parser: (match: RegExpMatchArray, rawMessage: string): ParsedPayment => {
      const upiId = extractUpiId(rawMessage);
      return {
        amount: parseFloat(match[1].replace(/,/g, '')),
        date: parseDate(match[2]),
        payer: match[4].trim(),
        upiId: upiId || match[3]?.trim() || undefined,
        bank: 'SBI',
        confidence: 95,
        rawMessage,
      };
    }
  },
  HDFC: {
    pattern: /INR ([\d,]+\.\d{2}) credited to A\/c [\w]+ on (\d{1,2}-[A-Za-z]{3}-\d{2,4}) by ([A-Z\s]+)/i,
    parser: (match: RegExpMatchArray, rawMessage: string): ParsedPayment => ({
      amount: parseFloat(match[1].replace(/,/g, '')),
      date: parseDate(match[2]),
      payer: match[3].trim(),
      bank: 'HDFC',
      confidence: 90,
      rawMessage,
    })
  },
  ICICI: {
    pattern: /(?:Your A\/c|Acct)\s+[\w]+\s+(?:has been\s+)?credited with (?:INR|Rs\.?)\s*([\d,]+\.\d{2})\s+on\s+(\d{1,2}-[A-Za-z]{3}-\d{2,4})\s+from\s+([A-Z][A-Z\s]+)\.?\s+UPI:([\w-]+)/i,
    parser: (match: RegExpMatchArray, rawMessage: string): ParsedPayment => {
      return {
        amount: parseFloat(match[1].replace(/,/g, '')),
        date: parseDate(match[2]),
        payer: match[3].trim(),
        transactionId: match[4].trim(),
        upiId: match[4].trim(),
        bank: 'ICICI',
        confidence: 95,
        rawMessage,
      };
    }
  },
  GENERIC_UPI: {
    pattern: /(?:credited|received|paid).*?(?:Rs\.?|INR|₹)\s*([\d,]+\.\d{2}).*?(?:on|date[:\s]+)(\d{1,2}-[A-Za-z]{3}-\d{2,4}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}).*?(?:from|by)\s+([A-Z\s]+)/i,
    parser: (match: RegExpMatchArray, rawMessage: string): ParsedPayment => ({
      amount: parseFloat(match[1].replace(/,/g, '')),
      date: parseDate(match[2]),
      payer: match[3].trim(),
      bank: 'UPI',
      confidence: 75,
      rawMessage,
    })
  },
  GPAY: {
    pattern: /You (?:received|sent) ₹?([\d,]+).*?(?:from|to)\s+([A-Z\s]+).*?(?:on|date[:\s]+)(\d{1,2}-[A-Za-z]{3}-\d{2,4}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    parser: (match: RegExpMatchArray, rawMessage: string): ParsedPayment => ({
      amount: parseFloat(match[1].replace(/,/g, '')),
      date: parseDate(match[2]),
      payer: match[3].trim(),
      bank: 'Google Pay',
      confidence: 85,
      rawMessage,
    })
  },
  PHONEPE: {
    pattern: /(?:Paid|Received) ₹?([\d,]+).*?(?:to|from)\s+([A-Z\s]+).*?(?:on|at)\s+(\d{1,2}-[A-Za-z]{3}-\d{2,4}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    parser: (match: RegExpMatchArray, rawMessage: string): ParsedPayment => ({
      amount: parseFloat(match[1].replace(/,/g, '')),
      date: parseDate(match[2]),
      payer: match[3].trim(),
      bank: 'PhonePe',
      confidence: 85,
      rawMessage,
    })
  },
  PAYTM: {
    pattern: /₹\s*([\d,]+\.\d{2}).*?(?:sent to|received from)\s+([A-Z\s]+).*?(?:on|date[:\s]+)(\d{1,2}-[A-Za-z]{3}-\d{2,4}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    parser: (match: RegExpMatchArray, rawMessage: string): ParsedPayment => ({
      amount: parseFloat(match[1].replace(/,/g, '')),
      date: parseDate(match[2]),
      payer: match[3].trim(),
      bank: 'Paytm',
      confidence: 85,
      rawMessage,
    })
  },
  GPAY_SCREENSHOT: {
    // Google Pay confirmation screen (OCR'd from screenshot)
    // e.g. "To Nitin Sharma\n3 Jul 2026, 8:17am\nUPI transaction ID\n125682794790\nTo: NITIN SHARMA\nGoogle Pay - itis.nitinsharma@okicici\nFrom: CHETAN SHARMA (HDFC Bank)"
    pattern: /To:?\s+([A-Z][A-Za-z\s]+)[\s\S]*?(\d{1,2}\s+[A-Za-z]{3}\s+\d{2,4})[\s\S]*?From:\s+([A-Z][A-Za-z\s]+)[\s\S]*?(?:HDFC|ICICI|SBI|Axis|Yes|Kotak)\s*(?:Bank)?/i,
    parser: (match: RegExpMatchArray, rawMessage: string): ParsedPayment => {
      const upiId = extractUpiId(rawMessage);
      const txnId = extractTransactionId(rawMessage);
      // Try to find amount in the text
      const amountMatch = rawMessage.match(/(?:₹|Rs\.?|INR)\s*([\d,]+\.?\d{0,2})/i);
      return {
        amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0,
        date: parseDate(match[2].trim()),
        payer: match[3].trim(),
        payee: match[1].trim(),
        upiId: upiId || undefined,
        transactionId: txnId || undefined,
        bank: 'Google Pay',
        confidence: amountMatch ? 80 : 60,
        rawMessage,
      };
    }
  }
};

/**
 * Parse a payment message (SMS, WhatsApp text, etc.)
 */
export function parsePaymentMessage(message: string): ParsedPayment | null {
  if (!message || message.trim().length === 0) {
    return null;
  }

  const trimmedMessage = message.trim();

  // Try each bank pattern
  for (const [bankName, { pattern, parser }] of Object.entries(BANK_PATTERNS)) {
    const match = trimmedMessage.match(pattern);
    if (match) {
      return parser(match, trimmedMessage);
    }
  }

  // No pattern matched
  return null;
}

/**
 * Parse date from various formats
 * Supports: "10-Jun-26", "10/07/2026", "Jul 10, 2026", "2026-07-10"
 */
function parseDate(dateStr: string): Date {
  // Clean up the date string
  const cleaned = dateStr.trim();
  
  // Try standard Date parsing first
  const standardParse = new Date(cleaned);
  if (!isNaN(standardParse.getTime())) {
    return standardParse;
  }

  // Try DD-MMM-YY format (e.g., "10-Jun-26")
  const ddmmyyMatch = cleaned.match(/(\d{1,2})[-\/]([A-Za-z]{3})[-\/](\d{2,4})/);
  if (ddmmyyMatch) {
    const [, day, month, year] = ddmmyyMatch;
    const fullYear = year.length === 2 ? `20${year}` : year;
    const parsed = new Date(`${month} ${day}, ${fullYear}`);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Try MMM-DD-YYYY format (e.g., "Jul 10, 2026")
  const mmmddMatch = cleaned.match(/([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})/);
  if (mmmddMatch) {
    const [, month, day, year] = mmmddMatch;
    const parsed = new Date(`${month} ${day}, ${year}`);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Fallback: return current date and log error
  console.error(`Could not parse date: ${dateStr}`);
  return new Date();
}

/**
 * Extract UPI ID from message
 */
export function extractUpiId(message: string): string | null {
  const upiPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+)/i;
  const match = message.match(upiPattern);
  return match ? match[1] : null;
}

/**
 * Extract phone number from message
 */
export function extractPhoneNumber(message: string): string | null {
  const phonePattern = /(\+?91)?[-\s]?([6-9]\d{9})/;
  const match = message.match(phonePattern);
  return match ? match[2] : null;
}

/**
 * Extract transaction ID from message
 */
export function extractTransactionId(message: string): string | null {
  const txnPatterns = [
    /(?:UPI transaction ID|Transaction ID|Txn ID)[:\s]+([A-Z0-9]+)/i,
    /Google transaction ID[\s\S]*?([A-Za-z0-9]{8,})/i,
    /(?:Ref|Reference)[:\s]+(\d+)/i,
    /(?:UPI|TXN|Transaction)[:\s]+(\d{6,})/i,
  ];

  for (const pattern of txnPatterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Calculate confidence score for parsed payment
 */
export function calculateConfidence(parsed: ParsedPayment): number {
  let confidence = 50; // Base confidence

  // Boost for having transaction ID
  if (parsed.transactionId) confidence += 10;
  
  // Boost for having UPI ID
  if (parsed.upiId) confidence += 10;
  
  // Boost for having bank name
  if (parsed.bank && parsed.bank !== 'UPI') confidence += 10;
  
  // Boost for reasonable amount (> 100, < 100000)
  if (parsed.amount > 100 && parsed.amount < 100000) confidence += 10;
  
  // Boost for recent date (within last 30 days)
  const daysDiff = (new Date().getTime() - parsed.date.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff >= 0 && daysDiff <= 30) confidence += 10;

  return Math.min(confidence, 100);
}

/**
 * Validate parsed payment
 */
export function validateParsedPayment(parsed: ParsedPayment): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate amount
  if (!parsed.amount || parsed.amount <= 0) {
    errors.push('Invalid amount');
  } else if (parsed.amount > 100000) {
    warnings.push('Amount seems unusually high');
  }

  // Validate date
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  if (parsed.date > now) {
    warnings.push('Payment date is in the future');
  } else if (parsed.date < threeMonthsAgo) {
    warnings.push('Payment is older than 3 months');
  }

  // Validate payer name
  if (!parsed.payer || parsed.payer.length < 2) {
    errors.push('Payer name not found');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}