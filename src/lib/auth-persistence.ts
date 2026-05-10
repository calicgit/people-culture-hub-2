export const REMEMBER_LOGIN_KEY = "dms-remember-login";
export const ACTIVE_SESSION_KEY = "dms-active-session";

export const getRememberLoginDefault = () => {
  if (typeof window === "undefined") return true;

  return window.localStorage.getItem(REMEMBER_LOGIN_KEY) !== "false";
};

export const persistLoginPreference = (rememberLogin: boolean) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(REMEMBER_LOGIN_KEY, String(rememberLogin));

  if (rememberLogin) {
    window.sessionStorage.removeItem(ACTIVE_SESSION_KEY);
    return;
  }

  window.sessionStorage.setItem(ACTIVE_SESSION_KEY, "true");
};

export const shouldDropPersistedSession = () => {
  if (typeof window === "undefined") return false;

  return window.localStorage.getItem(REMEMBER_LOGIN_KEY) === "false" && !window.sessionStorage.getItem(ACTIVE_SESSION_KEY);
};

export const clearLoginPersistence = () => {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
  window.sessionStorage.removeItem(ACTIVE_SESSION_KEY);
};