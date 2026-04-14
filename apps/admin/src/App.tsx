import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import ProductsPage from "./pages/products/ProductsPage"
import ProductCreateEditPage from "./pages/products/ProductCreateEditPage"
import CategoriesPage from "./pages/categories/CategoriesPage"
import TagsPage from "./pages/tags/TagsPage"
import UsersPage from "./pages/users/UsersPage"
import DiscountsPage from "./pages/discounts/DiscountsPage"
import CouponCreateEditPage from "./pages/discounts/CouponCreateEditPage"
import OrdersPage from "./pages/orders/OrdersPage"
import OrderDetailPage from "./pages/orders/OrderDetailPage"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import AppLayout from "./components/layout/AppLayout"

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected admin routes wrapped in Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Catalog Management */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductCreateEditPage />} />
          <Route path="/products/:id" element={<ProductCreateEditPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/tags" element={<TagsPage />} />
          
          {/* Sales Management */}
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          
          {/* Discount Management */}
          <Route path="/discounts" element={<DiscountsPage />} />
          <Route path="/discounts/new" element={<CouponCreateEditPage />} />
          <Route path="/discounts/:id" element={<CouponCreateEditPage />} />
          
          {/* User Management */}
          <Route path="/users" element={<UsersPage />} />
          
          {/* Other Page Placeholders */}
          <Route path="/settings" element={<div>Settings Page Placeholder</div>} />
        </Route>
      </Route>
      
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
