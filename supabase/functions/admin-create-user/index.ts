import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";

const allowedRoles = new Set(["master_admin", "member"]);
const allowedBodies = new Set([
  "association_member",
  "upravno_vijece",
  "savjetodavno_vijece",
  "znanstveno_vijece",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return Response.json({ error: "Missing authorization header." }, { status: 401, headers: corsHeaders });
    }

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return Response.json({ error: "Missing server configuration." }, { status: 500, headers: corsHeaders });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authorization } },
    });

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user: requester },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !requester) {
      return Response.json({ error: "Unauthorized." }, { status: 401, headers: corsHeaders });
    }

    const { data: requesterRoles, error: requesterRoleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", requester.id);

    if (requesterRoleError) {
      return Response.json({ error: requesterRoleError.message }, { status: 500, headers: corsHeaders });
    }

    const isMasterAdmin = (requesterRoles ?? []).some((role) => role.role === "master_admin");

    if (!isMasterAdmin) {
      return Response.json({ error: "Forbidden." }, { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.fullName ?? "").trim();
    const title = body.title ? String(body.title).trim() : null;
    const membershipStatus = String(body.membershipStatus ?? "active").trim() || "active";
    const isActive = body.isActive !== false;
    const role = String(body.role ?? "member").trim();
    // Always force production URL for invitation links, regardless of where the admin triggered it from.
    const redirectTo = "https://peopleandculture.hr/reset-password";
    const bodies = Array.isArray(body.bodies)
      ? Array.from(new Set(body.bodies.map((item: unknown) => String(item))))
      : [];

    if (email.length < 5 || !email.includes("@") || fullName.length < 2) {
      return Response.json({ error: "Invalid payload." }, { status: 400, headers: corsHeaders });
    }

    if (!allowedRoles.has(role)) {
      return Response.json({ error: "Invalid role." }, { status: 400, headers: corsHeaders });
    }

    if (bodies.some((item) => !allowedBodies.has(item))) {
      return Response.json({ error: "Invalid body membership." }, { status: 400, headers: corsHeaders });
    }

    // 1) Create user without sending default Supabase email
    const { data: createdUserData, error: createUserError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: { full_name: fullName },
    });

    if (createUserError || !createdUserData.user) {
      return Response.json({ error: createUserError?.message ?? "User creation failed." }, { status: 400, headers: corsHeaders });
    }

    const newUserId = createdUserData.user.id;

    // 2) Generate invite link (does NOT send an email)
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "invite",
      email,
      options: { redirectTo },
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      await adminClient.auth.admin.deleteUser(newUserId);
      return Response.json({ error: linkError?.message ?? "Failed to generate invite link." }, { status: 400, headers: corsHeaders });
    }

    // Build a custom link that points DIRECTLY to our app with token_hash as a query param.
    // This avoids Supabase's /verify endpoint being prefetched by Outlook Safe Links / Defender,
    // which would consume the one-time token before the user actually opens the page.
    const hashedToken = linkData.properties.hashed_token;
    const redirectUrl = new URL(redirectTo);
    redirectUrl.searchParams.set("token_hash", hashedToken);
    redirectUrl.searchParams.set("type", "invite");
    const inviteLink = redirectUrl.toString();

    const profileInsert = await adminClient.from("profiles").insert({
      user_id: newUserId,
      email,
      full_name: fullName,
      title,
      membership_status: membershipStatus,
      is_active: isActive,
    });

    if (profileInsert.error) {
      await adminClient.auth.admin.deleteUser(newUserId);
      return Response.json({ error: profileInsert.error.message }, { status: 400, headers: corsHeaders });
    }

    const roleInsert = await adminClient.from("user_roles").insert({
      user_id: newUserId,
      role,
    });

    if (roleInsert.error) {
      await adminClient.auth.admin.deleteUser(newUserId);
      return Response.json({ error: roleInsert.error.message }, { status: 400, headers: corsHeaders });
    }

    if (bodies.length > 0) {
      const membershipsInsert = await adminClient.from("user_body_memberships").insert(
        bodies.map((membership) => ({
          user_id: newUserId,
          body: membership,
        })),
      );

      if (membershipsInsert.error) {
        await adminClient.auth.admin.deleteUser(newUserId);
        return Response.json({ error: membershipsInsert.error.message }, { status: 400, headers: corsHeaders });
      }
    }

    // 3) Send custom Croatian invitation email via send-email (MS Graph)
    const emailHtml = `
<!DOCTYPE html>
<html lang="hr">
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#222;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
            <tr>
              <td style="background:#55bab7;padding:24px 32px;">
                <h1 style="margin:0;color:#ffffff;font-family:Arial,sans-serif;font-size:20px;font-weight:bold;">
                  Pozivnica
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Poštovani/a ${fullName},</p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                  pozvani ste da se pridružite internom portalu <strong>Udruge People &amp; Culture HUB</strong>.
                </p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                  Kliknite na gumb ispod kako biste prihvatili pozivnicu i kreirali svoj račun:
                </p>
                <p style="margin:32px 0;text-align:center;">
                  <a href="${inviteLink}" style="background:#55bab7;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;font-family:Arial,sans-serif;">
                    Prihvati pozivnicu
                  </a>
                </p>
                <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#666;">
                  Ako gumb ne radi, kopirajte i zalijepite sljedeću poveznicu u preglednik:
                </p>
                <p style="margin:0 0 24px;font-size:12px;line-height:1.5;word-break:break-all;color:#55bab7;">
                  ${inviteLink}
                </p>
                <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#666;">
                  Poveznica vrijedi ograničeno vrijeme. Ako niste očekivali ovu pozivnicu, zanemarite ovaj e-mail.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
                <p style="margin:0;font-size:12px;color:#999;">
                  Udruga People &amp; Culture HUB · hub@peopleandculture.hr
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    try {
      const sendRes = await adminClient.functions.invoke("send-email", {
        body: {
          to: email,
          subject: "Pozivnica",
          html: emailHtml,
        },
      });
      if (sendRes.error) {
        console.error("send-email failed:", sendRes.error);
      }
    } catch (e) {
      console.error("send-email invoke error:", e);
    }

    return Response.json(
      {
        userId: newUserId,
        message: "Pozivnica je poslana emailom i korisnik može sam postaviti lozinku.",
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});