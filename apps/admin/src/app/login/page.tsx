import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo = "/messages" } = await searchParams;

  return (
    <div className="login-page">
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
