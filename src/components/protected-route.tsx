import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/hooks/use-auth';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen w-full">Loading...</div>; // Atau tampilkan loading spinner
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
