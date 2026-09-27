"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard, { ErrorText, FieldLabel, SubmitButton, TextInput } from "@/components/AuthCard";
import { signup } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [tenantName, setTenantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters for the password.");
      return;
    }
    setLoading(true);
    try {
      const result = await signup({ tenantName, email, password });
      localStorage.setItem("token", result.token);
      router.push("/login?created=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your workspace"
      subtitle="Set up a new tenant to start tracking inventory."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <FieldLabel>Company / workspace name</FieldLabel>
          <TextInput
            required
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            placeholder="Acme Supplies"
          />
        </div>
        <div>
          <FieldLabel>Work email</FieldLabel>
          <TextInput
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <FieldLabel>Password</FieldLabel>
          <TextInput
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <SubmitButton loading={loading}>Create workspace</SubmitButton>
        <ErrorText>{error}</ErrorText>
      </form>
    </AuthCard>
  );
}
