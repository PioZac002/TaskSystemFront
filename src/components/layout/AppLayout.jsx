import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export const AppLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen w-full bg-background relative">
            {/* Subtle animated dot-grid background — desktop only via CSS */}
            <div className="app-bg-pattern" aria-hidden="true" />

            <Sidebar />
            <div className="flex flex-1 flex-col relative z-10">
                <TopBar />
                <main className="flex-1 overflow-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
