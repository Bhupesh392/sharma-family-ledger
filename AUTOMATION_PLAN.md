# Sharma Estates — Rent Entry Automation Plan
## WhatsApp & Image Parser for Automated Rent Logging

---

## 🎯 Vision

Enable tenants to submit rent payments by simply forwarding their payment confirmation (WhatsApp message or screenshot), and have the system automatically:
1. Parse the payment details
2. Match it to the correct property/tenant
3. Create the rent entry in the ledger
4. Send confirmation to the tenant

**Zero manual data entry for family members.**

---

## 📱 Input Formats Supported

### Format 1: Bank SMS / WhatsApp Message
```
Dear Customer, Acct XX255 is credited with Rs 9236.00 on 10-Jun-26 
from DEEPAK SINGH. UPI:616105507950-ICICI Bank.
```

**Common patterns:**
- SBI: "Your A/c XX1234 is credited with Rs. 5,000.00 on 01-Jul-26 by UPI/1234567890/CHETAN SHARMA"
- HDFC: "INR 12,000.00 credited to A/c XX5678 on 15-Jul-26 by NEFT from RAJESH KUMAR"
- ICICI: "Your A/c XX9012 has been credited with INR 8,500.00 on 20-Jul-26 via UPI (Ref: 9876543210)"
- PhonePe/GPay: "You received ₹15,000 from AMIT SHARMA on 05-Jul-26"

### Format 2: Payment Screenshot (Google Pay, PhonePe, Paytm)
**Example provided:**
- Amount: ₹17,600
- Date: 3 Jul 2026, 8:17 am
- To: NITIN SHARMA
- From: CHETAN SHARMA (HDFC Bank)
- UPI Transaction ID: 125682794790
- Bank: HDFC Bank 1117

**Visual elements to extract:**
- Amount (large font, prominent)
- Date/Time
- Payee (To:)
- Payer (From:)
- Transaction ID
- Bank details
- UPI ID
- App branding (GPay, PhonePe, Paytm)

---

## 🏗️ Architecture

### Option A: WhatsApp Business API (Recommended)
**Flow:**
```
Tenant → WhatsApp Message (text/image) → WhatsApp Business API → 
Webhook → Parser → Validation → Auto-create rent entry → 
Confirmation to tenant
```

**Pros:**
- Native WhatsApp integration
- No app download needed
- High tenant adoption
- Supports both text and images

**Cons:**
- Requires WhatsApp Business API approval
- Costs: ~₹0.50-1.00 per message (after free tier)

### Option B: Tenant Portal Upload (Simpler)
**Flow:**
```
Tenant → Tenant Portal → Upload image/forward message → 
Client-side OCR/parsing → Preview → Submit → 
Server validation → Auto-create rent entry
```

**Pros:**
- No external API dependencies
- Lower cost
- Faster to implement
- Works with any messaging app

**Cons:**
- Requires tenant to visit portal
- Less seamless

### Option C: Hybrid (Best of Both)
**Primary:** Tenant portal upload
**Future:** WhatsApp integration for power users

---

## 🔧 Technical Implementation

### Phase 1: Core Parsing Engine (Week 1-2)

#### 1.1 Text Message Parser

**Library:** `regex` + custom patterns for Indian banks

**Supported patterns:**
```typescript
// SBI
const sbiPattern = /Your A\/c [\w]+ is credited with Rs\.? ([\d,]+\.\d{2}) on ([\d-]+ [A-Za-z]+-\d{2}) by ([\w\/]+) from ([A-Z\s]+)/i;

// Generic UPI
const upiPattern = /(?:credited|received|paid).*?(?:Rs\.?|INR|₹)\s*([\d,]+\.\d{2}).*?(?:on|date[:\s]+)([\d-]+ [A-Za-z]+-\d{2}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}).*?(?:from|by)\s+([A-Z\s]+)/i;

// Google Pay / PhonePe
const gpayPattern = /You (?:received|sent) ₹?([\d,]+).*?(?:from|to)\s+([A-Z\s]+).*?(?:on|date[:\s]+)([\d-]+ [A-Za-z]+-\d{2}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i;
```

**Extraction logic:**
```typescript
interface ParsedPayment {
  amount: number;
  date: Date;
  payer: string;
  payee?: string;
  transactionId?: string;
  bank?: string;
  upiId?: string;
  rawMessage: string;
}

function parsePaymentMessage(message: string): ParsedPayment | null {
  // Try patterns in order of specificity
  const patterns = [
    { regex: sbiPattern, parser: parseSBI },
    { regex: hdfcPattern, parser: parseHDFC },
    { regex: upiPattern, parser: parseUPI },
    { regex: gpayPattern, parser: parseGPay },
  ];
  
  for (const { regex, parser } of patterns) {
    const match = message.match(regex);
    if (match) {
      return parser(match);
    }
  }
  
  return null;
}
```

#### 1.2 Image/OCR Parser

**Library:** Tesseract.js (client-side) or Google Cloud Vision API

**Approach:**
1. **Pre-processing:**
   - Resize image (min width: 800px)
   - Convert to grayscale
   - Increase contrast
   - Deskew if needed

2. **OCR Extraction:**
   ```typescript
   import Tesseract from 'tesseract.js';
   
   async function extractTextFromImage(imageFile: File): Promise<string> {
     const result = await Tesseract.recognize(
       imageFile,
       'eng',
       {
         logger: m => console.log(m),
         tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz₹.,:/-() '
       }
     );
     return result.data.text;
   }
   ```

3. **Post-processing:**
   - Clean up OCR errors (e.g., "Rs" → "Rs", "l" → "1")
   - Extract structured data using same regex patterns as text parser
   - Confidence scoring (if confidence < 80%, flag for manual review)

**Alternative: Google Cloud Vision API**
```typescript
import { ImageAnnotatorClient } from '@google-cloud/vision';

const client = new ImageAnnotatorClient();

async function extractPaymentDetails(imageBuffer: Buffer) {
  const [result] = await client.textDetection(imageBuffer);
  const text = result.fullTextAnnotation?.text || '';
  return parsePaymentMessage(text);
}
```

**Cost comparison:**
- Tesseract.js: Free, client-side, slower, less accurate
- Google Vision: $1.50 per 1,000 images, faster, 95%+ accuracy

---

### Phase 2: Matching & Validation (Week 2-3)

#### 2.1 Tenant/Property Matching

**Challenge:** Payment message doesn't explicitly say "E-392 Ground Floor"

**Solution:**
1. **UPI ID Mapping:**
   ```sql
   CREATE TABLE upi_mappings (
     id SERIAL PRIMARY KEY,
     upi_id VARCHAR(100) UNIQUE NOT NULL,
     property_id INTEGER REFERENCES properties(id),
     tenant_id INTEGER REFERENCES tenants(id),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```
   
   Example entries:
   - `itis.nitinsharma@okicici` → E-392 Ground Floor (Nitin Sharma)
   - `chetansharma140986@okhdfcbank` → Chitrakoot Shop (Chetan Sharma)

2. **Phone Number Matching:**
   - Match payer phone number from message to tenant's phone number
   - Fallback: Match by name (fuzzy matching)

3. **Amount + Date Combination:**
   - If no UPI/phone match, check if amount + date matches an expected rent payment
   - Example: If E-392 Ground Floor rent is ₹9,236 and payment of ₹9,236 on 10-Jun-26 exists → auto-match

**Matching algorithm:**
```typescript
async function matchPaymentToProperty(parsed: ParsedPayment): Promise<PropertyMatch | null> {
  // 1. Try UPI ID
  const upiMatch = await db.query.upiMappings.findFirst({
    where: eq(upiMappings.upiId, parsed.upiId)
  });
  if (upiMatch) return { property: upiMatch.property, tenant: upiMatch.tenant, confidence: 100 };
  
  // 2. Try phone number
  const phoneMatch = await db.query.tenants.findFirst({
    where: eq(tenants.phone, extractPhoneFromMessage(parsed.rawMessage))
  });
  if (phoneMatch) return { property: phoneMatch.currentProperty, tenant: phoneMatch, confidence: 90 };
  
  // 3. Try name matching
  const nameMatch = await fuzzyMatchTenantName(parsed.payer);
  if (nameMatch) return { property: nameMatch.currentProperty, tenant: nameMatch, confidence: 70 };
  
  // 4. Try amount + date
  const amountMatch = await findExpectedRentPayment(parsed.amount, parsed.date);
  if (amountMatch) return { property: amountMatch.property, tenant: amountMatch.tenant, confidence: 60 };
  
  return null; // Needs manual review
}
```

#### 2.2 Validation Rules

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validatePayment(parsed: ParsedPayment, match: PropertyMatch): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if rent amount matches expected rent
  const expectedRent = match.property.monthlyRent;
  if (expectedRent && parsed.amount !== Number(expectedRent)) {
    warnings.push(`Amount ₹${parsed.amount} doesn't match expected rent ₹${expectedRent}`);
  }
  
  // Check for duplicate transaction
  const existing = await db.query.e392Rent.findFirst({
    where: and(
      eq(e392Rent.propertyId, match.property.id),
      eq(e392Rent.month, startOfMonth(parsed.date)),
      eq(e392Rent.rent, parsed.amount)
    )
  });
  if (existing) {
    errors.push('Duplicate payment detected');
  }
  
  // Check if date is in the future
  if (parsed.date > new Date()) {
    warnings.push('Payment date is in the future');
  }
  
  // Check if date is too old (> 3 months)
  const threeMonthsAgo = subMonths(new Date(), 3);
  if (parsed.date < threeMonthsAgo) {
    warnings.push('Payment is older than 3 months');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

---

### Phase 3: User Interface (Week 3-4)

#### 3.1 Tenant Portal: "Submit Rent Payment" Page

**Location:** `/tenant/submit-payment`

**UI Flow:**
```
┌─────────────────────────────────────┐
│  Submit Rent Payment                │
├─────────────────────────────────────┤
│                                     │
│  [Upload Screenshot] or             │
│  [Paste WhatsApp Message]           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📎 Drop image here or      │   │
│  │     click to browse         │   │
│  └─────────────────────────────┘   │
│                                     │
│  OR                                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Paste payment message...   │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Parse Payment]                    │
│                                     │
├─────────────────────────────────────┤
│  Detected Details (Editable)        │
│                                     │
│  Amount: [₹17,600]                  │
│  Date:   [03-Jul-2026]              │
│  Property: [E-392 Ground Floor ▼]   │
│  Tenant:  [Chetan Sharma]           │
│  Transaction ID: [125682794790]     │
│  Bank: [HDFC Bank 1117]             │
│                                     │
│  [Submit Payment]                   │
└─────────────────────────────────────┘
```

**Component structure:**
```tsx
// src/app/tenant/submit-payment/page.tsx
export default function SubmitPaymentPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Submit Rent Payment"
        description="Upload a payment screenshot or paste your payment confirmation message."
      />
      
      <PaymentUploadForm />
    </div>
  );
}

// src/components/tenant/payment-upload-form.tsx
export function PaymentUploadForm() {
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [parsedData, setParsedData] = useState<ParsedPayment | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  
  const handleImageUpload = async (file: File) => {
    setIsParsing(true);
    try {
      const text = await extractTextFromImage(file);
      const parsed = parsePaymentMessage(text);
      setParsedData(parsed);
    } finally {
      setIsParsing(false);
    }
  };
  
  const handleMessagePaste = async () => {
    setIsParsing(true);
    try {
      const parsed = parsePaymentMessage(message);
      setParsedData(parsed);
    } finally {
      setIsParsing(false);
    }
  };
  
  return (
    <>
      {/* Upload area */}
      <Tabs defaultValue="image">
        <TabsList>
          <TabsTrigger value="image">Upload Screenshot</TabsTrigger>
          <TabsTrigger value="text">Paste Message</TabsTrigger>
        </TabsList>
        
        <TabsContent value="image">
          <FileUpload onFileSelect={handleImageUpload} />
        </TabsContent>
        
        <TabsContent value="text">
          <Textarea
            placeholder="Paste your payment confirmation message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={handleMessagePaste} disabled={!message}>
            Parse Message
          </Button>
        </TabsContent>
      </Tabs>
      
      {/* Parsed data preview */}
      {parsedData && (
        <PaymentDetailsForm
          data={parsedData}
          onSubmit={async (data) => {
            await submitPayment(data);
            toast.success('Payment submitted successfully!');
          }}
        />
      )}
    </>
  );
}
```

#### 3.2 Admin Review Queue

**Location:** `/admin/payment-review`

**Purpose:** Review low-confidence matches before auto-approval

**UI:**
```
┌─────────────────────────────────────┐
│  Pending Payment Reviews (3)        │
├─────────────────────────────────────┤
│                                     │
│  [1] Chetan Sharma - ₹17,600       │
│      Date: 03-Jul-2026              │
│      Confidence: 75%                │
│      [Approve] [Reject] [Edit]      │
│                                     │
│  [2] Deepak Singh - ₹9,236          │
│      Date: 10-Jun-2026              │
│      Confidence: 90%                │
│      [Approve] [Reject] [Edit]      │
│                                     │
│  [3] Unknown - ₹5,000               │
│      Date: 15-Jul-2026              │
│      Confidence: 40%                │
│      [Approve] [Reject] [Edit]      │
└─────────────────────────────────────┘
```

**Auto-approval rules:**
- Confidence ≥ 90%: Auto-approve
- Confidence 70-89%: Flag for review
- Confidence < 70%: Require manual review

---

### Phase 4: Advanced Features (Week 5-6)

#### 4.1 WhatsApp Bot (Optional)

**Using WhatsApp Business API:**

```typescript
// src/app/api/webhooks/whatsapp/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  
  // Handle incoming message
  if (body.type === 'message') {
    const message = body.message;
    const phone = body.from;
    
    // Find tenant by phone
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.phone, phone)
    });
    
    if (!tenant) {
      await sendWhatsAppMessage(phone, 'You are not registered as a tenant.');
      return;
    }
    
    // Parse message or image
    let parsed: ParsedPayment;
    if (message.type === 'text') {
      parsed = parsePaymentMessage(message.text);
    } else if (message.type === 'image') {
      const imageBuffer = await downloadImage(message.image.url);
      const text = await extractTextFromImage(imageBuffer);
      parsed = parsePaymentMessage(text);
    }
    
    if (!parsed) {
      await sendWhatsAppMessage(phone, 'Could not parse payment details. Please try again or contact admin.');
      return;
    }
    
    // Match to property
    const match = await matchPaymentToProperty(parsed);
    
    if (!match) {
      await sendWhatsAppMessage(phone, 'Could not match payment to a property. Admin will review manually.');
      await notifyAdminForReview(parsed);
      return;
    }
    
    // Create rent entry
    const rentEntry = await createRentEntry({
      propertyId: match.property.id,
      tenantId: match.tenant.id,
      month: startOfMonth(parsed.date),
      rent: parsed.amount,
      paidTo: match.property.ownerName,
      mode: 'UPI',
      notes: `Auto-parsed from WhatsApp. TXN: ${parsed.transactionId}`,
      createdById: SYSTEM_USER_ID
    });
    
    // Send confirmation
    await sendWhatsAppMessage(phone, 
      `✅ Payment recorded!\n\n` +
      `Property: ${match.property.name}\n` +
      `Amount: ₹${parsed.amount}\n` +
      `Date: ${formatDate(parsed.date)}\n` +
      `Transaction ID: ${parsed.transactionId}\n\n` +
      `Thank you!`
    );
  }
  
  return Response.json({ status: 'ok' });
}
```

#### 4.2 Smart Suggestions

**Features:**
- **Auto-complete:** As tenant types message, suggest "This looks like a payment from SBI"
- **Duplicate detection:** "This payment looks similar to one submitted on 10-Jun-26"
- **Amount validation:** "Expected rent is ₹9,236, but you entered ₹8,000. Is this correct?"

---

## 🗄️ Database Schema Changes

### New Tables

```sql
-- UPI ID mappings
CREATE TABLE upi_mappings (
  id SERIAL PRIMARY KEY,
  upi_id VARCHAR(100) UNIQUE NOT NULL,
  property_id INTEGER REFERENCES properties(id),
  tenant_id INTEGER REFERENCES tenants(id),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment submissions (for tracking)
CREATE TABLE payment_submissions (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  property_id INTEGER REFERENCES properties(id),
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL,
  transaction_id VARCHAR(100),
  bank VARCHAR(100),
  upi_id VARCHAR(100),
  raw_message TEXT,
  image_url TEXT,
  parsed_data JSONB,
  confidence_score INTEGER,
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  rent_entry_id INTEGER, -- Link to created rent entry
  created_at TIMESTAMP DEFAULT NOW()
);

-- Parsing logs (for improving accuracy)
CREATE TABLE parsing_logs (
  id SERIAL PRIMARY KEY,
  raw_input TEXT NOT NULL,
  parsed_result JSONB,
  success BOOLEAN,
  error_message TEXT,
  parser_version VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Schema Updates

```sql
-- Add payment method to rent tables
ALTER TABLE e392_rent ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Cash';
ALTER TABLE e392_rent ADD COLUMN transaction_id VARCHAR(100);
ALTER TABLE e392_rent ADD COLUMN upi_id VARCHAR(100);
ALTER TABLE e392_rent ADD COLUMN auto_parsed BOOLEAN DEFAULT FALSE;

ALTER TABLE chitrakoot_rent ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Cash';
ALTER TABLE chitrakoot_rent ADD COLUMN transaction_id VARCHAR(100);
ALTER TABLE chitrakoot_rent ADD COLUMN upi_id VARCHAR(100);
ALTER TABLE chitrakoot_rent ADD COLUMN auto_parsed BOOLEAN DEFAULT FALSE;
```

---

## 🔐 Security & Privacy

### Data Protection
1. **Image storage:** Encrypt images at rest (AES-256)
2. **PII redaction:** Don't store full bank account numbers (mask: XX255)
3. **Access control:** Only tenant + admins can view their submissions
4. **Audit trail:** Log all payment submissions and approvals

### Fraud Prevention
1. **Duplicate detection:** Prevent same transaction ID from being submitted twice
2. **Amount validation:** Flag payments that don't match expected rent
3. **Date validation:** Reject future dates or dates > 3 months old
4. **Rate limiting:** Max 5 submissions per hour per tenant
5. **Admin review:** Low-confidence matches require manual approval

---

## 📊 Success Metrics

### Adoption
- % of rent payments submitted via automation (target: 80% in 3 months)
- Average time to submit payment (target: < 30 seconds)
- Tenant satisfaction score (target: 4.5/5)

### Accuracy
- Parsing success rate (target: > 90%)
- False positive rate (target: < 5%)
- Manual review rate (target: < 10%)

### Efficiency
- Time saved per payment (target: 5 minutes → 30 seconds)
- Reduction in data entry errors (target: 90%)
- Admin time spent on rent collection (target: -70%)

---

## 🚀 Implementation Roadmap

### Week 1-2: Core Parser
- [ ] Build text message parser (support top 5 Indian banks)
- [ ] Build image OCR parser (Tesseract.js)
- [ ] Create parsing utilities in `src/lib/parsers/`
- [ ] Write unit tests for 20+ sample messages

### Week 3: Matching & Validation
- [ ] Build UPI ID mapping table
- [ ] Implement tenant/property matching logic
- [ ] Add validation rules
- [ ] Create admin review queue

### Week 4: UI Development
- [ ] Build tenant payment submission page
- [ ] Build admin review dashboard
- [ ] Add success/error notifications
- [ ] Mobile-responsive design

### Week 5-6: Testing & Polish
- [ ] End-to-end testing with real payment messages
- [ ] Improve parsing accuracy based on edge cases
- [ ] Add onboarding guide for tenants
- [ ] Deploy to production

### Week 7+: Advanced Features
- [ ] WhatsApp Business API integration
- [ ] Smart suggestions & auto-complete
- [ ] Bulk import historical payments
- [ ] Analytics dashboard (parsing success rate, etc.)

---

## 💰 Cost Estimate

### Development
- **Phase 1-4 (Core features):** 40-60 hours
- **WhatsApp integration:** +20 hours
- **Testing & polish:** +10 hours
- **Total:** 70-90 hours

### Infrastructure
- **Tesseract.js:** Free (client-side)
- **Google Cloud Vision (optional):** $1.50 per 1,000 images
- **WhatsApp Business API:** ₹0.50-1.00 per message (after 1,000 free/month)
- **Storage:** ~₹100/month for images (S3/Cloudflare R2)

### ROI
- **Time saved:** 5 min × 20 payments/month = 100 min/month = 20 hours/year
- **Error reduction:** 90% fewer corrections = ~10 hours/year
- **Total savings:** ~30 hours/year = ₹30,000-50,000/year (at ₹1,000/hour)
- **Break-even:** < 2 months

---

## 🎯 Quick Start (MVP)

### Minimum Viable Product (2 weeks)

**Features:**
1. Tenant portal: Upload payment screenshot
2. OCR parsing (Tesseract.js)
3. Basic validation (amount, date, duplicate check)
4. Admin review queue
5. Auto-create rent entry on approval

**Excluded (for later):**
- WhatsApp integration
- Advanced matching algorithms
- Smart suggestions
- Analytics

**Success criteria:**
- 80% parsing accuracy
- < 5 minute admin review time per payment
- 10+ test payments processed successfully

---

## 📝 Example Implementation

### Parser Utility

```typescript
// src/lib/parsers/payment-parser.ts

export interface ParsedPayment {
  amount: number;
  date: Date;
  payer: string;
  payee?: string;
  transactionId?: string;
  bank?: string;
  upiId?: string;
  confidence: number;
}

const BANK_PATTERNS = {
  SBI: /Your A\/c [\w]+ is credited with Rs\.? ([\d,]+\.\d{2}) on ([\d-]+ [A-Za-z]+-\d{2}) by ([\w\/]+) from ([A-Z\s]+)/i,
  HDFC: /INR ([\d,]+\.\d{2}) credited to A\/c [\w]+ on ([\d-]+ [A-Za-z]+-\d{2}) by ([A-Z\s]+)/i,
  ICICI: /Your A\/c [\w]+ has been credited with INR ([\d,]+\.\d{2}) on ([\d-]+ [A-Za-z]+-\d{2}) via UPI \(Ref: ([\w]+)\)/i,
  GENERIC_UPI: /(?:credited|received|paid).*?(?:Rs\.?|INR|₹)\s*([\d,]+\.\d{2}).*?(?:on|date[:\s]+)([\d-]+ [A-Za-z]+-\d{2}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}).*?(?:from|by)\s+([A-Z\s]+)/i,
  GPAY: /You (?:received|sent) ₹?([\d,]+).*?(?:from|to)\s+([A-Z\s]+).*?(?:on|date[:\s]+)([\d-]+ [A-Za-z]+-\d{2}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
};

export function parsePaymentMessage(message: string): ParsedPayment | null {
  for (const [bank, pattern] of Object.entries(BANK_PATTERNS)) {
    const match = message.match(pattern);
    if (match) {
      return {
        amount: parseFloat(match[1].replace(/,/g, '')),
        date: parseDate(match[2]),
        payer: match[3].trim(),
        bank: bank === 'GENERIC_UPI' ? 'UPI' : bank,
        confidence: 90,
        rawMessage: message
      };
    }
  }
  
  return null;
}

function parseDate(dateStr: string): Date {
  // Handle formats: "10-Jun-26", "10/07/2026", "Jul 10, 2026"
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    // Try DD-MMM-YY format
    const parts = dateStr.match(/(\d{1,2})[-\/]([A-Za-z]+)[-\/](\d{2,4})/);
    if (parts) {
      const [, day, month, year] = parts;
      return new Date(`${month} ${day}, ${year}`);
    }
  }
  return parsed;
}
```

### OCR Utility

```typescript
// src/lib/parsers/ocr-parser.ts

import Tesseract from 'tesseract.js';

export async function extractTextFromImage(file: File): Promise<string> {
  const result = await Tesseract.recognize(
    file,
    'eng',
    {
      logger: m => console.log(`OCR Progress: ${m.status}`),
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz₹.,:/-() '
    }
  );
  
  return result.data.text;
}

export async function parsePaymentImage(file: File): Promise<ParsedPayment | null> {
  const text = await extractTextFromImage(file);
  return parsePaymentMessage(text);
}
```

---

## 🎓 Tenant Onboarding

### Guide for Tenants

**"How to Submit Rent Payment"**

1. **After paying rent**, take a screenshot of the payment confirmation
   - Google Pay, PhonePe, Paytm, or bank app
   
2. **Go to** `https://sharma-estates.vercel.app/tenant/submit-payment`

3. **Upload your screenshot** or paste the payment message

4. **Review the details** (we'll auto-fill amount, date, etc.)

5. **Click Submit**

6. **Get confirmation** — We'll notify you once it's recorded

**Tips:**
- Make sure the screenshot is clear and readable
- Include the transaction ID if visible
- Submit within 24 hours of payment for fastest processing

---

## 🔄 Feedback Loop

### Improving Parser Accuracy

```typescript
// Track parsing success/failure
async function logParsingAttempt(input: string, result: ParsedPayment | null, success: boolean) {
  await db.insert(parsingLogs).values({
    rawInput: input,
    parsedResult: result,
    success,
    parserVersion: '1.0.0'
  });
}

// Monthly review
async function reviewParsingAccuracy() {
  const logs = await db.query.parsingLogs.findMany({
    where: gte(parsingLogs.createdAt, subMonths(new Date(), 1))
  });
  
  const successRate = logs.filter(l => l.success).length / logs.length;
  console.log(`Parsing success rate: ${successRate * 100}%`);
  
  // Identify common failures
  const failures = logs.filter(l => !l.success);
  const failurePatterns = analyzeFailures(failures);
  
  // Update patterns based on failures
  for (const pattern of failurePatterns) {
    addNewPattern(pattern);
  }
}
```

---

## 📞 Support & Escalation

### Tenant Support
- **Auto-reply:** "We received your payment. It will be reviewed within 24 hours."
- **Help center:** FAQ page with screenshots
- **Contact:** WhatsApp support number for issues

### Admin Alerts
- **Low confidence:** Notify admin via email/Slack
- **Duplicate detection:** Alert admin immediately
- **Parser failures:** Daily summary of failed parsings

---

## 🎉 Benefits

### For Tenants
- ✅ No more manual rent receipts
- ✅ Instant confirmation
- ✅ Payment history at fingertips
- ✅ No need to visit office

### For Family Members
- ✅ Zero data entry
- ✅ No more lost receipts
- ✅ Auto-reconciliation
- ✅ Real-time visibility

### For the Business
- ✅ 90% reduction in manual work
- ✅ 99% data accuracy
- ✅ Better tenant experience
- ✅ Scalable to 100+ properties

---

*Document Version: 1.0*
*Last Updated: July 2026*