"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard, { ErrorText, FieldLabel, SubmitButton, TextInput } from "@/components/AuthCard";
import { acceptInvite } from "@/lib/api";

// Reached from an emailed link like /invite-accept?token=xyz. Someone was
// invited to an existing tenant (as opposed to /signup, which creates a
// brand-new one) and just needs to set their name and password.
export default function InviteAcceptPage() {
  return (
    <Suspense fallback={null}>
      <InviteAcceptForm />
    </Suspense>
  );
}

function InviteAcceptForm() {
  const router = useRouter();
  const inviteToken = useSearchParams().get("token") ?? "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!inviteToken) {
      setError("This invite link is missing its token. Ask for a new invite.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for the password.");
      return;
    }
    setLoading(true);
    try {
      const result = await acceptInvite({ inviteToken, name, password });
      localStorage.setItem("token", result.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "This invite link isn't valid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Join your team" subtitle="Set your name and a password to finish joining.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <FieldLabel>Your name</FieldLabel>
          <TextInput required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
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
        <SubmitButton loading={loading}>Join workspace</SubmitButton>
        <ErrorText>{error}</ErrorText>
      </form>
    </AuthCard>
  );
}