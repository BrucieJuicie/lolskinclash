import ResetPasswordPage from "@/components/ResetPasswordPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-gold p-8 text-center">Loading reset form...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
