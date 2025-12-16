import * as React from "react"
import {
  IconDashboard,
  IconInnerShadowTop,
} from "@tabler/icons-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Box, Boxes, ScanBarcodeIcon, Warehouse } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { useLocation } from "react-router"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  const data = {
    user: {
      name: user?.data?.name,
      email: user?.data?.email,
      avatar: user?.data?.avatar,
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
        active: isActive("/dashboard"),
      },
      {
        title: "Product",
        url: "/products",
        icon: Box,
        active: isActive("/products"),
      },
      {
        title: "Warehouse",
        url: "/warehouse",
        icon: Warehouse,
        active: isActive("/warehouse"),
      },
      {
        title: "Inventory",
        url: "/inventory",
        icon: ScanBarcodeIcon,
        active: isActive("/inventory"),
      }
    ]
  }
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard" className="text-black!">
                <Boxes className="size-5!" />
                <span className="text-base font-bold">Inventory System.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
