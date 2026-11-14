import { LoginForm } from "./login-form";

import { pageTitle } from "@/lib/i18n/metadata";

export const generateMetadata = pageTitle("signIn");

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-brand-700 p-4">
      <LoginForm />
    </div>
  );
}
