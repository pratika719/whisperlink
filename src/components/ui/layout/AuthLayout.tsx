import Link from "next/link";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthLayout({
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Background Glow */}
      <div className="hero-gradient absolute inset-0" />

      {/* Grid Background */}
      <div className="bg-grid absolute inset-0 opacity-40" />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-3xl p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="text-gradient text-3xl font-bold"
            >
              WhisperLink
            </Link>

            <p className="mt-2 text-sm text-muted-foreground">
              Anonymous feedback. Meaningful conversations.
            </p>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold">
              {title}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}