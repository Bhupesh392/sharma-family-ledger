"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { approvePaymentSubmission, rejectPaymentSubmission } from "@/lib/actions/payments";
import { CheckCircle, XCircle } from "lucide-react";

interface Payment {
  id: number;
  amount: string;
  date: string;
  transactionId: string | null;
  bank: string | null;
  upiId: string | null;
  confidenceScore: number | null;
  status: string;
  tenant: {
    name: string;
    phone: string | null;
  };
  property: {
    name: string;
  };
}

interface PaymentReviewListProps {
  payments: Payment[];
}

export function PaymentReviewList({ payments }: PaymentReviewListProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleApprove = async (submissionId: number) => {
    setProcessingId(submissionId);
    try {
      const result = await approvePaymentSubmission(submissionId);
      if (result.success) {
        toast.success("Payment approved and rent entry created");
      } else {
        toast.error(result.error || "Failed to approve payment");
      }
    } catch (error) {
      toast.error("Failed to approve payment");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (submissionId: number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    setProcessingId(submissionId);
    try {
      const result = await rejectPaymentSubmission(submissionId, reason);
      if (result.success) {
        toast.success("Payment rejected");
      } else {
        toast.error(result.error || "Failed to reject payment");
      }
    } catch (error) {
      toast.error("Failed to reject payment");
    } finally {
      setProcessingId(null);
    }
  };

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No pending payments to review</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  {payment.tenant.name} - {payment.property.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {payment.tenant.phone}
                </p>
              </div>
              <Badge variant={payment.confidenceScore && payment.confidenceScore >= 90 ? "success" : "pending"}>
                {payment.confidenceScore ?? 0}% confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-lg font-semibold">₹{payment.amount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{payment.date}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bank</p>
                <p className="text-sm font-medium">{payment.bank ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transaction ID</p>
                <p className="text-sm font-medium font-mono">{payment.transactionId || "N/A"}</p>
              </div>
            </div>

            {payment.upiId && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground">UPI ID</p>
                <p className="text-sm font-medium font-mono">{payment.upiId}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => handleApprove(payment.id)}
                disabled={processingId === payment.id}
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                onClick={() => handleReject(payment.id)}
                disabled={processingId === payment.id}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}