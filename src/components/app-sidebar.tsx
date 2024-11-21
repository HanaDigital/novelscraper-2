import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { ChevronDoubleRight, SquareSolid } from "@mynaui/icons-react";
import { LargeP, TinyP } from "./typography";
import { Button } from "./ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { app } from "@tauri-apps/api";
import { useSetAtom } from "jotai/react";
import { appStateAtom } from "@/lib/store";
import { routes } from "@/lib/routes";

export function AppSidebar() {
    const { resolvedLocation } = useRouterState();
    const setAppState = useSetAtom(appStateAtom);

    const { toggleSidebar, open } = useSidebar();
    const [version, setVersion] = useState("");

    useEffect(() => {
        app.getVersion().then(v => setVersion(v));
    }, []);

    useEffect(() => {
        setAppState((state) => {
            state.isSidePanelOpen = open;
            return state;
        });
    }, [open]);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem className="flex gap-2 justify-center items-center">
                        <SidebarMenuButton size="lg" className="!bg-card !cursor-default">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <SquareSolid className="size-7" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <LargeP className="truncate">NovelScraper</LargeP>
                                <TinyP className="truncate">v{version}</TinyP>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {routes.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={resolvedLocation.pathname === "/"
                                        ? item.url === "/"
                                        : resolvedLocation.pathname.includes(item.url) && item.url !== "/"
                                    }>
                                        <Link href={item.url}>
                                            <item.icon width={24} height={24} />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="flex items-end">
                <Button className="size-8" variant="outline" size="icon" onClick={toggleSidebar}>
                    <ChevronDoubleRight className={`transition-transform ${open ? "rotate-180" : ""}`} />
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}
