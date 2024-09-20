"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import MfaChallengeModal from "./MFAChallenge";


 
const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const supabase = createClientComponentClient();
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
       
        router.push("/profile");
      }
    };
    getSession();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClientComponentClient();

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const { data: factorsData, error: factorError } = await supabase.auth.mfa.listFactors();
      if (factorError) throw factorError;

      if (factorsData?.totp && factorsData.totp.length > 0) {
        setIsOpen(true);
      } else {
        router.push("/");
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex items-center justify-center min-h-screen">
      <div className="w-full flex flex-col h-full items-center justify-center px-4 md:px-12 lg:px-24 gap-16">
        <div className="w-full lg:text-left text-center">
          <h1 className="text-4xl font-medium text-[#202020]">Login</h1>
          <p className="text-xl font-light text-[#3C4049]">
            Enter your account details.
          </p>
        </div>
        {error && (
          <div className="bg-red-600 text-white w-full text-center p-4 rounded-xl">
            Error: {error}
          </div>
        )}
        <form onSubmit={handleSignIn} className="w-full flex flex-col gap-6">
          <div className="flex flex-col w-full">
            <Label htmlFor="email">
              Email <span className="text-[#C21515]">*</span>
            </Label>
            <Input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="flex flex-col w-full">
            <Label htmlFor="password">
              Password <span className="text-[#C21515]">*</span>
            </Label>
            <Input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <Link href="/forget-password" className="underline font-light">
            Forgot password?
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Sign In"}
          </Button>
        </form>
        <p className="font-light text-[#202020]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold underline">
            Register here
          </Link>
        </p>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <MfaChallengeModal
            onConfirm={() => {
           //   setTotpVerified(true);
              setIsOpen(false);
              router.push("/profile");
            }}
            onClose={() => {
             // setTotpNotVerified(true);
              setIsOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;