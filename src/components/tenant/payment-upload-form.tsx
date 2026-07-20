"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { submitPayment, parsePaymentFromText } from "@/lib/actions/payments";
import { ParsedPayment, parsePaymentMessage } from "@/lib/parsers/payment-parser";
import { extractTextFromImage } from "@/lib/parsers/ocr-parser";

interface PaymentUploadFormProps {
  properties: Array<{
    id: number;
    name: string;
    rentLedger: string;
    monthlyRent: string | null;
  }>;
  defaultTenantId?: number;
}

export function PaymentUploadForm({ properties, defaultTenantId }: PaymentUploadFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [activeTab, setActiveTab] = useState("image");

  // Form state - auto-select if only one property
  const [selectedProperty, setSelectedProperty] = useState(properties.length === 1 ? properties[0].id.toString() : "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionId, setTransactionId] = useState("");
  const [bank, setBank] = useState("");
  const [upiId, setUpiId] = useState("");
  const [rawMessage, setRawMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Parsed data
  const [parsedData, setParsedData] = useState<ParsedPayment | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Run OCR on client side
    setIsParsing(true);
    try {
      const { text, confidence: ocrConfidence } = await extractTextFromImage(file);
      
      if (!text || text.trim().length === 0) {
        toast.error("No text could be extracted from the image. Please try text input instead.");
        setIsParsing(false);
        return;
      }

      // Try to parse the extracted text
      const parsed = parsePaymentMessage(text);
      
      if (parsed) {
        // Successful parse - auto-fill form
        setParsedData(parsed);
        setConfidence(parsed.confidence);
        setAmount(parsed.amount.toString());
        setDate(parsed.date.toISOString().split('T')[0]);
        setBank(parsed.bank || "");
        if (parsed.upiId) setUpiId(parsed.upiId);
        if (parsed.transactionId) setTransactionId(parsed.transactionId);
        setWarnings([]);
        toast.success("Payment details extracted successfully!");
      } else {
        // OCR extracted text but pattern matching failed — populate text tab with the raw text
        setRawMessage(text);
        setActiveTab("text");
        setWarnings([]);
        toast.info("Text extracted from image — review and click 'Parse Message' to fill the form.");
      }
    } catch (error) {
      toast.error("Failed to process image. Please use text input instead.");
      console.error(error);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleTextParse = useCallback(async () => {
    if (!rawMessage.trim()) {
      toast.error("Please enter a payment message");
      return;
    }

    setIsParsing(true);
    try {
      const result = await parsePaymentFromText(rawMessage);

      if (result.success && result.parsed) {
        setParsedData(result.parsed);
        setConfidence(result.parsed.confidence);

        // Auto-fill form
        setAmount(result.parsed.amount.toString());
        setDate(result.parsed.date.toISOString().split('T')[0]);
        setBank(result.parsed.bank || "");
        if (result.parsed.upiId) setUpiId(result.parsed.upiId);
        if (result.parsed.transactionId) setTransactionId(result.parsed.transactionId);

        // Show warnings
        if (result.validation.warnings.length > 0) {
          setWarnings(result.validation.warnings);
          toast.warning("Please review the warnings below");
        } else {
          setWarnings([]);
          toast.success("Payment details extracted successfully!");
        }
      } else {
        toast.error(result.error || "Failed to parse message");
        setWarnings([]);
      }
    } catch (error) {
      toast.error("Failed to parse message");
      console.error(error);
    } finally {
      setIsParsing(false);
    }
  }, [rawMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProperty) {
      toast.error("Please select a property");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("tenantId", defaultTenantId?.toString() || "");
      formData.append("propertyId", selectedProperty);
      formData.append("amount", amount);
      formData.append("date", date);
      if (transactionId) formData.append("transactionId", transactionId);
      if (bank) formData.append("bank", bank);
      if (upiId) formData.append("upiId", upiId);
      if (rawMessage) formData.append("rawMessage", rawMessage);
      if (parsedData) formData.append("parsedData", JSON.stringify(parsedData));
      if (confidence) formData.append("confidenceScore", confidence.toString());

      const result = await submitPayment(formData);

      if (result.success) {
        toast.success(result.message || "Payment submitted successfully!");
        router.push("/tenant");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to submit payment");
      }
    } catch (error) {
      toast.error("Failed to submit payment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Input */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property selection */}
              <div className="space-y-2">
                <Label htmlFor="property">Property *</Label>
                {properties.length === 1 ? (
                  <div className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    <p className="font-medium">{properties[0].name}</p>
                    {properties[0].monthlyRent && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Monthly rent: ₹{properties[0].monthlyRent}
                      </p>
                    )}
                    <input type="hidden" name="propertyId" value={properties[0].id.toString()} />
                  </div>
                ) : (
                  <select
                    id="property"
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select property</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id.toString()}>
                        {property.name} {property.monthlyRent ? `(₹${property.monthlyRent}/month)` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Payment Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              {/* Transaction ID */}
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID (optional)</Label>
                <Input
                  id="transactionId"
                  placeholder="e.g., UPI123456789"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              {/* Bank */}
              <div className="space-y-2">
                <Label htmlFor="bank">Bank / Payment Method (optional)</Label>
                <Input
                  id="bank"
                  placeholder="e.g., HDFC Bank, Google Pay"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                />
              </div>

              {/* UPI ID */}
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID (optional)</Label>
                <Input
                  id="upiId"
                  placeholder="e.g., nitinsharma@okicici"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Upload/Parse */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Proof</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="image">Screenshot</TabsTrigger>
                  <TabsTrigger value="text">Message</TabsTrigger>
                </TabsList>

                <TabsContent value="image" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload Payment Screenshot</Label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={isParsing}
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload screenshot
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG up to 10MB
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                    {isParsing && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Parsing image...
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">Paste Payment Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Paste your bank SMS or WhatsApp payment confirmation..."
                      value={rawMessage}
                      onChange={(e) => setRawMessage(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      onClick={handleTextParse}
                      disabled={isParsing || !rawMessage.trim()}
                      className="w-full"
                    >
                      {isParsing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Parsing...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Parse Message
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Warnings</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {warnings.map((warning, i) => (
                      <li key={i} className="text-sm text-yellow-700 dark:text-yellow-300">{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Confidence score */}
          {confidence !== null && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Parsing Confidence</span>
                  <span className={`text-sm font-semibold ${
                    confidence >= 90 ? "text-green-600" :
                    confidence >= 70 ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {confidence}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      confidence >= 90 ? "bg-green-600" :
                      confidence >= 70 ? "bg-yellow-600" :
                      "bg-red-600"
                    }`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isSubmitting || !selectedProperty || !amount}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit Payment
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your payment will be reviewed within 24 hours
          </p>
        </div>
      </div>
    </form>
  );
}