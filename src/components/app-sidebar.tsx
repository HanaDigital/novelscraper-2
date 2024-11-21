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
import { BookOpen, ChevronDoubleRight, Home, SquareSolid } from "@mynaui/icons-react";
import { LargeP, TinyP } from "./typography";
import { Button } from "./ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { app } from "@tauri-apps/api";
import { useSetAtom } from "jotai/react";
import { appStateAtom } from "@/lib/store";

export function AppSidebar() {
    const { resolvedLocation } = useRouterState();
    const setAppState = useSetAtom(appStateAtom);

    const { toggleSidebar, open } = useSidebar();
    const [version, setVersion] = useState("");
    const items = [
        {
            title: "Home",
            url: "/",
            icon: Home,
        },
        {
            title: "Library",
            url: "/library",
            icon: BookOpen,
        }
    ];

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
                                <TinyP className="truncate">{version}</TinyP>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={resolvedLocation.pathname === item.url}>
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
