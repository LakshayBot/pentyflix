import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, Film, TrendingUp, Users, Layers, Settings, LogOut } from "lucide-react";

interface DashboardSidebarProps {
    logout: () => void;
}

export function DashboardSidebar({ logout }: DashboardSidebarProps) {
    return (
        <Sidebar className="shrink-0">
            <SidebarHeader className="flex h-14 items-center border-b px-4">
                <span className="font-bold text-lg">PentyFlix</span>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton isActive={true}>
                            <Home className="h-5 w-5" />
                            <span>Home</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <Film className="h-5 w-5" />
                            <span>Browse Content</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <TrendingUp className="h-5 w-5" />
                            <span>Trending</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <Users className="h-5 w-5" />
                            <span>Channels</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <Layers className="h-5 w-5" />
                            <span>Categories</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="border-t p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <Settings className="h-5 w-5" />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={logout}>
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
