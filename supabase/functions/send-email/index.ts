import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Attachment {
  name: string;
  contentType: string;
  contentBytes: string; // base64
}

interface SendEmailBody {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
  attachments?: Attachment[];
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token;
  }

  const tenantId = Deno.env.get("MS_TENANT_ID");
  const clientId = Deno.env.get("MS_CLIENT_ID");
  const clientSecret = Deno.env.get("MS_CLIENT_SECRET");

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Missing MS_TENANT_ID, MS_CLIENT_ID, or MS_CLIENT_SECRET");
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Token request failed [${res.status}]: ${JSON.stringify(data)}`);
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.token;
}

function toRecipients(value?: string | string[]) {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr.map((address) => ({ emailAddress: { address } }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as SendEmailBody;
    const { to, subject, html, cc, bcc, replyTo, attachments } = body;

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const sender = Deno.env.get("MS_SENDER");
    if (!sender) {
      throw new Error("MS_SENDER is not configured");
    }

    const token = await getAccessToken();

    const message: Record<string, unknown> = {
      subject,
      body: { contentType: "HTML", content: html },
      toRecipients: toRecipients(to),
    };
    if (cc) message.ccRecipients = toRecipients(cc);
    if (bcc) message.bccRecipients = toRecipients(bcc);
    if (replyTo) message.replyTo = toRecipients(replyTo);

    if (attachments && attachments.length > 0) {
      message.attachments = attachments.map((a) => ({
        "@odata.type": "#microsoft.graph.fileAttachment",
        name: a.name,
        contentType: a.contentType,
        contentBytes: a.contentBytes,
      }));
    }

    const graphUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`;
    const res = await fetch(graphUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, saveToSentItems: true }),
    });

    if (!res.ok) {
      let errBody: unknown;
      try {
        errBody = await res.json();
      } catch {
        errBody = await res.text();
      }
      console.error("Graph API error:", res.status, errBody);
      return new Response(
        JSON.stringify({
          error: "Graph API error",
          status: res.status,
          details: errBody,
        }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("send-email error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
