"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getToken, isTokenExpired } from "@/lib/session";

export default function AppGroupLayout({ children }: any) {
  const router = useRouter();
  useEffect(() => {
    if (!getToken() || isTokenExpired()) router.replace("/login");
  }, [router]);
  return <AppShell>{children}</AppShell>;
}