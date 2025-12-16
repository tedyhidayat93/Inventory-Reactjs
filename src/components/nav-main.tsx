import type { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useNavigate } from "react-router"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    active: boolean
    icon?: LucideIcon
  }[]
}) {
  const navigate = useNavigate()
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem onClick={()=> navigate(item.url)} key={item.title}>
              <SidebarMenuButton tooltip={item.title} className={item.active ? "bg-primary text-amber-100!" : ""} // Apply active class
>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
