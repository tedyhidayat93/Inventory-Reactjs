import { Routes, Route, Navigate, BrowserRouter as Router } from 'react-router';
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './App/Login';
import Dashboard from './App/Dashboard/Index';
import ProductPage from './App/Dashboard/Product/Index';
import WarehousePage from './App/Dashboard/Warehouse/Index';
import InventoryPage from './App/Dashboard/Inventory/Index';
// import { ProtectedRoute } from '@/components/protected-route';
import RegisterPage from './App/Register';
import DashboardLayout from './App/Dashboard/Layout';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen w-screen bg-background">
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPage/>} />
            
            {/* Protected Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<ProductPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/warehouse" element={<WarehousePage />} />
            </Route>
            
            {/* 404 Not Found */}
            <Route path="*" element={<div>Not Found</div>} />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;