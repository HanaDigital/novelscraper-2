import * as React from 'react'
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    return (
        <React.Fragment>
            <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <Outlet />
            </SidebarProvider>
            <TanStackRouterDevtools position='bottom-right' />
        </React.Fragment>
    )
}
