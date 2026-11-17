"use client";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
export default function AppShell({ children }: any) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">{children}</main>
      </div>
    </div>
  );
}