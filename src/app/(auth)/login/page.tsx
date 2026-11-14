import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-brand-700 p-4">
      <LoginForm />
    </div>
  );
}
