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
const allowedMembershipStatuses = new Set(["active", "inactive", "pending"]);

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
    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.fullName ?? "").trim();
    const title = body.title ? String(body.title).trim() : null;
    const membershipStatus = String(body.membershipStatus ?? "active").trim();
    const isActive = body.isActive === true;
    const role = String(body.role ?? "member").trim();
    const bodies = Array.isArray(body.bodies)
      ? Array.from(new Set(body.bodies.map((item: unknown) => String(item))))
      : [];

    if (!userId || email.length < 5 || !email.includes("@") || fullName.length < 2) {
      return Response.json({ error: "Invalid payload." }, { status: 400, headers: corsHeaders });
    }

    if (title && title.length > 120) {
      return Response.json({ error: "Invalid title." }, { status: 400, headers: corsHeaders });
    }

    if (!allowedRoles.has(role)) {
      return Response.json({ error: "Invalid role." }, { status: 400, headers: corsHeaders });
    }

    if (!allowedMembershipStatuses.has(membershipStatus)) {
      return Response.json({ error: "Invalid membership status." }, { status: 400, headers: corsHeaders });
    }

    if (bodies.some((item) => !allowedBodies.has(item))) {
      return Response.json({ error: "Invalid body membership." }, { status: 400, headers: corsHeaders });
    }

    const { data: profileRow, error: profileLookupError } = await adminClient
      .from("profiles")
      .select("id, user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileLookupError) {
      return Response.json({ error: profileLookupError.message }, { status: 500, headers: corsHeaders });
    }

    if (!profileRow) {
      return Response.json({ error: "Profile not found." }, { status: 404, headers: corsHeaders });
    }

    const { data: existingUser, error: userLookupError } = await adminClient.auth.admin.getUserById(userId);

    if (userLookupError || !existingUser.user) {
      return Response.json({ error: userLookupError?.message ?? "User not found." }, { status: 404, headers: corsHeaders });
    }

    const currentEmail = existingUser.user.email?.toLowerCase() ?? "";

    if (currentEmail !== email) {
      const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(userId, {
        email,
        email_confirm: true,
      });

      if (authUpdateError) {
        return Response.json({ error: authUpdateError.message }, { status: 400, headers: corsHeaders });
      }
    }

    const { error: metadataUpdateError } = await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...(existingUser.user.user_metadata ?? {}),
        full_name: fullName,
      },
    });

    if (metadataUpdateError) {
      return Response.json({ error: metadataUpdateError.message }, { status: 400, headers: corsHeaders });
    }

    const profileUpdate = await adminClient
      .from("profiles")
      .update({
        email,
        full_name: fullName,
        title,
        membership_status: membershipStatus,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (profileUpdate.error) {
      return Response.json({ error: profileUpdate.error.message }, { status: 400, headers: corsHeaders });
    }

    const deleteRolesResult = await adminClient.from("user_roles").delete().eq("user_id", userId);

    if (deleteRolesResult.error) {
      return Response.json({ error: deleteRolesResult.error.message }, { status: 400, headers: corsHeaders });
    }

    const insertRoleResult = await adminClient.from("user_roles").insert({
      user_id: userId,
      role,
    });

    if (insertRoleResult.error) {
      return Response.json({ error: insertRoleResult.error.message }, { status: 400, headers: corsHeaders });
    }

    const deleteMembershipsResult = await adminClient.from("user_body_memberships").delete().eq("user_id", userId);

    if (deleteMembershipsResult.error) {
      return Response.json({ error: deleteMembershipsResult.error.message }, { status: 400, headers: corsHeaders });
    }

    if (bodies.length > 0) {
      const insertMembershipsResult = await adminClient.from("user_body_memberships").insert(
        bodies.map((membership) => ({
          user_id: userId,
          body: membership,
        })),
      );

      if (insertMembershipsResult.error) {
        return Response.json({ error: insertMembershipsResult.error.message }, { status: 400, headers: corsHeaders });
      }
    }

    return Response.json(
      {
        message: "Korisnički podaci su uspješno ažurirani.",
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return Response.json({ error: message }, { status: 500, headers: corsHeaders });
  }
});