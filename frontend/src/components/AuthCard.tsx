// Shared shell used by the signup, login and invite-accept pages, so all
// three look consistent and only need their form fields written once.
export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-lg p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-text">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-sm text-text-muted">{footer}</div>}
      </div>
    </main>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-text mb-1">{children}</label>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-md border border-border bg-surface px-3 py-2 text-text " +
        "placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary " +
        (props.className ?? "")
      }
    />
  );
}

export function SubmitButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-md bg-primary text-primary-fg py-2 font-medium
                 hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function ErrorText({ children }: { children?: string | null }) {
  if (!children) return null;
  return <p className="mt-3 text-sm text-danger">{children}</p>;
}
