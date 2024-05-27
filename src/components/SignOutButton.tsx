"use client";

import { ButtonHTMLAttributes, useState } from "react";
import Button from "./ui/Button";
import { toast } from "react-hot-toast";
import { Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

type SignOutButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function SignOutButton({ ...props }: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      toast.error("There was a problem signing out.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Button {...props} variant="ghost" onClick={handleSignOut}>
      {isSigningOut ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
    </Button>
  );
}
