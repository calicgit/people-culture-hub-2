import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";

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
    const userId = String(body.userId ?? "").trim();

    if (!userId) {
      return Response.json({ error: "Invalid payload." }, { status: 400, headers: corsHeaders });
    }

    if (userId === requester.id) {
      return Response.json({ error: "Ne možeš obrisati vlastiti račun." }, { status: 400, headers: corsHeaders });
    }

    const { data: targetProfile, error: targetProfileError } = await adminClient
      .from("profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (targetProfileError) {
      return Response.json({ error: targetProfileError.message }, { status: 500, headers: corsHeaders });
    }

    if (!targetProfile) {
      return Response.json({ error: "Korisnik nije pronađen." }, { status: 404, headers: corsHeaders });
    }

    const { error: deleteAuthUserError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteAuthUserError) {
      return Response.json({ error: deleteAuthUserError.message }, { status: 400, headers: corsHeaders });
    }

    return Response.json(
      {
        message: "Korisnik je trajno uklonjen iz portala.",
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});