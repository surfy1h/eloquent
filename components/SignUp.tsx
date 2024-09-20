"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

function SignUp() {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [confirmPopUp, setConfirmPopup] = useState(false);

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
       // router.push("/");
      }
    };
    getSession();
  }, [router, supabase.auth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  async function SignUpNewUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setConfirmPopup(true);
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex items-center justify-center min-h-screen">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Get started now by creating a new account.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-600 text-white w-full text-center p-4 rounded-xl mb-6">
              Error: {error}
            </div>
          )}
          {!error && confirmPopUp ? (
            <div className="bg-green-600 text-white w-full text-left py-12 px-6 md:px-16 rounded-xl flex flex-col gap-6">
              <h3 className="text-4xl font-bold">Account created successfully!</h3>
              <h4 className="text-2xl">Thanks for joining Company</h4>
              <span>
                To finish signing up, please confirm your email address. This
                ensures we have the right email in case we need to contact you.
              </span>
            </div>
          ) : (
            <form onSubmit={SignUpNewUser} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    onChange={handleInputChange}
                    placeholder="Enter your surname"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  required
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="tos" required />
                <Label htmlFor="tos">
                  By creating an account, I agree to Company{" "}
                  <Link href="#" className="underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="underline">
                    Privacy Policy
                  </Link>
                  .
                </Label>
              </div>
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>
          )}
          <p className="mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="font-bold underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUp;