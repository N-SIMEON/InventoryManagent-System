"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getToken } from "@/lib/procurement";

export default function AppGroupLayout({ children }: any) {
  const router = useRouter();
  useEffect(() => { if (!getToken()) router.replace("/login"); }, [router]);
  return <AppShell>{children}</AppShell>;
}