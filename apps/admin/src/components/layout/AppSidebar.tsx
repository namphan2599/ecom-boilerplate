import {
  LayoutDashboard,
  Package,
  Users,
  Tag,
  TicketPercent,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { NavCategory } from "./NavCategory"
import type { Category } from "@/types"

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Products", icon: Package, url: "/products" },
  { title: "Users", icon: Users, url: "/users" },
  { title: "Discounts", icon: TicketPercent, url: "/discounts" },
  { title: "Orders", icon: ShoppingCart, url: "/orders" },
]

// Mock data for categories - will be replaced with real data fetching
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    parentId: null,
    children: [
      { id: "1-1", name: "Phones", slug: "phones", parentId: "1" },
      { id: "1-2", name: "Laptops", slug: "laptops", parentId: "1" },
    ],
  },
  {
    id: "2",
    name: "Fashion",
    slug: "fashion",
    parentId: null,
    children: [
      { id: "2-1", name: "Men", slug: "men", parentId: "2" },
      { id: "2-2", name: "Women", slug: "women", parentId: "2" },
    ],
  },
]

export function AppSidebar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-sm">A</div>
          <span>Aura Admin</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    render={<Link to={item.url} />}
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Product Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavCategory categories={mockCategories} />
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={<Link to="/categories" />} 
                  tooltip="Manage Categories"
                >
                  <Tag className="w-4 h-4" />
                  <span>Manage Categories</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={<Link to="/settings" />}
                  tooltip="Settings"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{user?.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout} 
            title="Logout"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
