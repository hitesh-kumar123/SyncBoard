import { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "SyncBoard - Sign Up",
  description: "Create your SyncBoard account",
};

export default function SignupPage() {
  return (
    <main className="bg-surface-container-low text-on-surface min-h-screen flex items-center justify-center font-body-md antialiased p-md">
      <SignupForm />
    </main>
  );
}
