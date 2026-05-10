import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const SMTP_HOST = Deno.env.get("SMTP_HOST");
    const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const SMTP_USER = Deno.env.get("SMTP_USER");
    const SMTP_PASS = Deno.env.get("SMTP_PASS");
    const SMTP_FROM = Deno.env.get("SMTP_FROM_EMAIL");

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

    console.log("SMTP config:", { SMTP_HOST, SMTP_PORT, SMTP_USER: SMTP_USER ? "set" : "missing", SMTP_FROM });

    if (SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM) {
      // Ensure from is a clean email address
      const cleanFrom = SMTP_FROM.trim();
      const client = new SMTPClient({
        connection: {
          hostname: SMTP_HOST,
          port: SMTP_PORT,
          tls: SMTP_PORT === 465,
          auth: {
            username: SMTP_USER,
            password: SMTP_PASS,
          },
        },
      });

      await client.send({
        from: cleanFrom,
        to: "hub@peopleandculture.hr",
        subject: `Nova prijava za članstvo: ${firstName} ${lastName}`,
        content: "Nova prijava za članstvo",
        html: htmlBody,
      });

      await client.close();
      console.log("Email sent via SMTP successfully");
    } else {
      console.log("SMTP not configured. Missing env vars.");
    }

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
