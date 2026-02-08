import { LoginForm } from "@/components/LoginForm";

export const runtime = "edge";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo = "/messages" } = await searchParams;

  return (
    <div style={{ maxWidth: "30rem", margin: "2rem auto" }}>
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
