import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Enums, Tables } from "@/integrations/supabase/types";
import { clearLoginPersistence, shouldDropPersistedSession } from "@/lib/auth-persistence";

type Profile = Tables<"profiles"> | null;
type UserRole = Tables<"user_roles">;
type UserBodyMembership = Tables<"user_body_memberships">;

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile;
  roles: UserRole[];
  memberships: UserBodyMembership[];
  loading: boolean;
  isMasterAdmin: boolean;
  refreshAccessData: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MASTER_ADMIN_ROLE: Enums<"app_role"> = "master_admin";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [memberships, setMemberships] = useState<UserBodyMembership[]>([]);
  const [loading, setLoading] = useState(true);

  const clearAuthState = () => {
    setSession(null);
    setUser(null);
    setProfile(null);
    setRoles([]);
    setMemberships([]);
  };

  const loadAccessData = async (userId: string) => {
    const [profileResult, rolesResult, membershipsResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_roles").select("*").eq("user_id", userId),
      supabase.from("user_body_memberships").select("*").eq("user_id", userId),
    ]);

    setProfile(profileResult.data ?? null);
    setRoles(rolesResult.data ?? []);
    setMemberships(membershipsResult.data ?? []);
  };

  useEffect(() => {
    let active = true;

    if (shouldDropPersistedSession()) {
      void supabase.auth.signOut();
      clearLoginPersistence();
    }

    const syncSession = async (nextSession: Session | null) => {
      if (!active) return;

      if (!nextSession?.user) {
        clearAuthState();
        setLoading(false);
        return;
      }

      setSession(nextSession);
      setUser(nextSession.user);

      try {
        await loadAccessData(nextSession.user.id);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncSession(nextSession);
    });

    void supabase.auth.getSession().then(({ data }) => {
      void syncSession(data.session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshAccessData = async () => {
    if (!user) return;
    await loadAccessData(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearLoginPersistence();
    clearAuthState();
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      roles,
      memberships,
      loading,
      isMasterAdmin: roles.some((role) => role.role === MASTER_ADMIN_ROLE),
      refreshAccessData,
      signOut,
    }),
    [loading, memberships, profile, roles, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};