// frontend/src/components/TopNav.tsx
"use client";
import { clearToken } from "@/lib/procurement";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/suppliers", label: "Suppliers" },
  { href: "/purchase-orders", label: "Purchase Orders" },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <nav className="flex items-center gap-6 border-b bg-white px-6 py-3">
      <span className="font-bold text-slate-800">Inventory · Procurement</span>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={
            pathname.startsWith(l.href)
              ? "text-blue-600 font-medium"
              : "text-slate-600 hover:text-blue-600"
          }
        >
          {l.label}
        </Link>
      ))}
      <button
        onClick={logout}
        className="ml-auto text-sm text-slate-500 hover:text-red-600"
      >
        Log out
      </button>
    </nav>
  );
}