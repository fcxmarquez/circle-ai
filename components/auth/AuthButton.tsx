import { usePathname } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { createClient } from "@/utils/supabase/client";

export function GoogleAuthButton() {
  const pathname = usePathname();

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${
          typeof window !== "undefined" ? window.location.origin : ""
        }/auth/callback?next=${pathname}`,
      },
    });
  };

  return (
    <button
      type="button"
      className="inline-flex h-6 items-center justify-center gap-2 bg-transparent p-0 font-medium text-base"
      onClick={handleGoogleSignIn}
    >
      <FcGoogle />
      Continue with Google
    </button>
  );
}
