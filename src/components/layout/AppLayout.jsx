import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export const AppLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <TopBar />
                <main className="flex-1 overflow-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
