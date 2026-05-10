import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Učitavanje portala...
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/council-login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;