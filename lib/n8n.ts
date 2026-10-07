/**
 * BIAS RISTEK - n8n Workflow Automation Engine Egress
 * Handles outbound webhook events triggered by student registrations, payments, and LMS activity.
 * Conforms to PRD Phase #1 & Phase #2 specifications.
 */

export type N8nEvent =
  | "REGISTRATION_CREATED"
  | "PAYMENT_VERIFIED"
  | "PAYMENT_EXPIRED"
  | "STUDENT_ENROLLED"
  | "TUTOR_ASSIGNED"
  | "MENTORSHIP_PROPOSED"
  | "MENTORSHIP_CONFIRMED"
  | "MENTORSHIP_DECLINED";

export interface N8nWebhookPayload {
  event: N8nEvent;
  timestamp: string;
  source: string;
  data: Record<string, any>;
}

/**
 * Dispatches an outbound event to the n8n webhook orchestrator
 */
export async function triggerN8nWebhook(
  event: N8nEvent,
  data: Record<string, any>
): Promise<{ success: boolean; simulated?: boolean; message?: string }> {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  const n8nWebhookSecret = process.env.N8N_WEBHOOK_SECRET || "bias-ristek-n8n-secret";

  const payload: N8nWebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    source: "bias-ristek-app",
    data,
  };

  // If no n8n webhook URL is configured, log as SIMULATED (safe fallback)
  if (!n8nWebhookUrl) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[n8n EGRESS SIMULATED] Event: ${event} | Invoice: ${data.invoiceNumber || data.id || "N/A"}`);
    }
    return { success: true, simulated: true, message: "n8n Webhook URL not set; simulated successfully." };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": n8nWebhookSecret,
        "User-Agent": "BIAS-Ristek-Automation/1.0",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[n8n EGRESS WARNING] n8n returned HTTP ${response.status} for event ${event}`);
      return { success: false, message: `n8n HTTP ${response.status}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error(`[n8n EGRESS ERROR] Failed to dispatch event ${event}:`, err?.message || err);
    // Return gracefully so user flow is never disrupted by an external workflow engine
    return { success: false, message: err?.message || "n8n dispatch failed" };
  }
}
