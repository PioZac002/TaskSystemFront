import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { DesktopNotificationDock, NotificationRealtimeBridge } from "@/components/notifications/NotificationCenter";

export const AppLayout = ({ children }) => {
    return (
        <div className="app-shell relative flex h-screen w-full max-w-full overflow-hidden bg-background">
            {/* Subtle animated dot-grid background — desktop only via CSS */}
            <div className="app-bg-pattern" aria-hidden="true" />

            <NotificationRealtimeBridge />
            <Sidebar />
            <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
                <TopBar />
                <main className="app-main min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
                    {children}
                </main>
            </div>
            <DesktopNotificationDock />
        </div>
    );
};
