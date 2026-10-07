import { NextRequest, NextResponse } from "next/server";
import {
  verifyMidtransSignature,
  processPaymentSettlement,
  processPaymentFailure,
  isMidtransProduction,
  type MidtransNotificationPayload,
} from "@/lib/payment-gateway";

export const dynamic = "force-dynamic";

/**
 * Diagnostic Health Check for Gateway Webhook
 * GET /api/webhooks/payment
 */
export async function GET() {
  return NextResponse.json({
    status: "active",
    gateway: "MIDTRANS_PAYMENT_GATEWAY",
    environment: isMidtransProduction() ? "production" : "sandbox",
    algorithm: "HMAC-SHA512",
    webhookTarget: "/api/webhooks/payment",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Webhook Ingress Receiver
 * POST /api/webhooks/payment
 * Handles real-time notifications from Midtrans / Payment Gateway.
 */
export async function POST(req: NextRequest) {
  try {
    const body: MidtransNotificationPayload = await req.json();

    if (!body || !body.order_id) {
      return NextResponse.json(
        { error: "Invalid payload: missing order_id" },
        { status: 400 }
      );
    }

    // 1. Verify Cryptographic Signature (HMAC-SHA512)
    const isSignatureValid = verifyMidtransSignature(body);

    if (!isSignatureValid) {
      console.warn(`[PAYMENT WEBHOOK] Signature verification failed for order: ${body.order_id}`);
      return NextResponse.json(
        { error: "Unauthorized: Invalid cryptographic signature" },
        { status: 401 }
      );
    }

    const { order_id, transaction_status, fraud_status, payment_type, gross_amount } = body;

    console.log(
      `[PAYMENT WEBHOOK] Processing notification: Order=${order_id} | Status=${transaction_status} | Type=${payment_type}`
    );

    // 2. Handle Settlement / Paid Transaction
    // Midtrans marks payment as complete via 'settlement' or 'capture' (card) with 'accept'
    const isSettled =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    if (isSettled) {
      const settlementResult = await processPaymentSettlement(order_id, {
        paymentType: payment_type || "qris",
        transactionTime: body.settlement_time || body.transaction_time,
        gatewayRef: body.transaction_id || "Midtrans",
        grossAmount: gross_amount ? parseFloat(gross_amount) : undefined,
      });

      if (!settlementResult.success) {
        return NextResponse.json(
          { status: "error", message: settlementResult.message, order_id },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: "OK",
        action: settlementResult.alreadyVerified ? "ALREADY_VERIFIED" : "SETTLED",
        message: settlementResult.message,
        order_id,
        processedAt: new Date().toISOString(),
      });
    }

    // 3. Handle Expired Transaction
    if (transaction_status === "expire") {
      await processPaymentFailure(order_id, "EXPIRED", "Batas waktu pembayaran habis (Expired)");
      return NextResponse.json({
        status: "OK",
        action: "EXPIRED",
        order_id,
      });
    }

    // 4. Handle Cancelled or Denied Transaction
    if (transaction_status === "cancel" || transaction_status === "deny") {
      await processPaymentFailure(
        order_id,
        "CANCELLED",
        `Transaksi dibatalkan atau ditolak (${transaction_status})`
      );
      return NextResponse.json({
        status: "OK",
        action: "CANCELLED",
        order_id,
      });
    }

    // 5. Handle Pending / Other Status
    return NextResponse.json({
      status: "OK",
      action: "ACKNOWLEDGED",
      transaction_status,
      order_id,
    });
  } catch (err: any) {
    console.error("[PAYMENT WEBHOOK ERROR] Uncaught exception:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
