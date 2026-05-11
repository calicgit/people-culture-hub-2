import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Token request failed [${response.status}]: ${JSON.stringify(data)}`);
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  };

  return cachedToken.token;
}

function toRecipients(value: string | string[]) {
  const arr = Array.isArray(value) ? value : [value];
  return arr.map((address) => ({ emailAddress: { address } }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, phone, company, membershipTier, referrals, howHeard, paidBy } =
      await req.json();

    const tierLabels: Record<string, string> = {
      student: "Student (30€/god)",
      basic: "Basic (120€/god)",
      advanced: "Advanced (170€/god)",
    };

    const sender = Deno.env.get("MS_SENDER");

    if (!sender) {
      throw new Error("MS_SENDER is not configured");
    }

    const htmlBody = `
      <h2>Nova prijava za članstvo - People & Culture HUB</h2>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Ime i prezime</td><td style="padding:8px;border:1px solid #ddd;">${firstName} ${lastName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Telefon</td><td style="padding:8px;border:1px solid #ddd;">${phone}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Kompanija</td><td style="padding:8px;border:1px solid #ddd;">${company || "—"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Vrsta članstva</td><td style="padding:8px;border:1px solid #ddd;">${tierLabels[membershipTier] || membershipTier}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Preporuka</td><td style="padding:8px;border:1px solid #ddd;">${(referrals || []).join(", ") || "—"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Kako je saznao/la</td><td style="padding:8px;border:1px solid #ddd;">${howHeard || "—"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Članarinu plaća</td><td style="padding:8px;border:1px solid #ddd;">${paidBy === "employer" ? "Poslodavac" : "Osobno"}</td></tr>
      </table>
    `;

    const token = await getAccessToken();
    const graphUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`;
    const response = await fetch(graphUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: `Nova prijava za članstvo: ${firstName} ${lastName}`,
          body: { contentType: "HTML", content: htmlBody },
          toRecipients: toRecipients("hub@peopleandculture.hr"),
          replyTo: toRecipients(email),
        },
        saveToSentItems: true,
      }),
    });

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }

      console.error("Graph API error:", response.status, errorBody);
      return new Response(JSON.stringify({ error: "Graph API error", details: errorBody }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Membership notification email queued successfully via Microsoft Graph");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
