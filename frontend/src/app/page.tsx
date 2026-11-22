"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, isTokenExpired } from "@/lib/session";
export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace(getToken() && !isTokenExpired() ? "/dashboard" : "/login"); }, [router]);
  return null;
}