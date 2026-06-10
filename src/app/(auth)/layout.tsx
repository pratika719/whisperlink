// src/app/(auth)/layout.tsx
// Simple passthrough — each auth page wraps itself in AuthLayout
export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
