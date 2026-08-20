import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "SyncBoard - Login",
  description: "Sign in to your SyncBoard account",
};

export default function LoginPage() {
  return (
    <main className="bg-surface-container-low text-on-surface min-h-screen flex items-center justify-center font-body-md antialiased p-md">
      <LoginForm />
    </main>
  );
}
