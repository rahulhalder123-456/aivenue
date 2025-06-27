"use client"

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Network,
  BrainCircuit,
  Users,
  Settings,
  Bot,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmaps", label: "Roadmaps", icon: Network },
  { href: "/generate-roadmap", label: "AI Generator", icon: BrainCircuit },
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
  { href: "/community", label: "Community", icon: Users },
]

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" asChild>
                <SidebarTrigger />
            </Button>
            <div className="flex items-center gap-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
                <h1 className="text-lg font-semibold font-headline">DevMap Pro</h1>
            </div>
        </div>
      </SidebarHeader>
      
      <SidebarMenu className="flex-1 p-2">
        {links.map((link) => (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(link.href)}
              tooltip={{ children: link.label }}
            >
              <Link href={link.href}>
                <link.icon />
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <Separator />

      <SidebarFooter>
        <SidebarMenu className="p-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: "Settings" }}>
                <Link href="#">
                    <Settings />
                    <span>Settings</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}
