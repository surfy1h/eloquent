"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EnrollMFA from "./MFAEnroll";

interface Factor {
  id: string;
  // Remove the 'type' property or make it optional
}

export default function Profile() {
  const [isOpen, setIsOpen] = useState(false);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [factorId, setFactorId] = useState("");
  // Remove the following line:
  // const [assuranceLevel, setAssuranceLevel] = useState("");
  const [firstName, setFirstName] = useState("");

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user data:", error.message);
          return;
        }

        if (user && user.user_metadata) {
          setFirstName(user.user_metadata.first_name || "");
        }
      }
    };
    getSession();
  }, [router, supabase.auth]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error);
    } else {
      router.push("/login");
    }
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        throw error;
      }

      setFactors(data.totp || []);
      setFactorId(data.totp?.[0]?.id || "");
    })();
  }, [supabase.auth.mfa]);

  async function handleUnenroll() {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      console.error("Error unenrolling TOTP", error);
      throw error;
    }

    console.log("Successfully unenrolled TOTP");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-[1068px] mx-auto">
        <div className="flex justify-between items-center px-8">
          <Link
            className="bg-gray-400 text-white px-6 py-4 rounded-md transition-all duration-300 hover:bg-gray-500"
            href="/"
          >
            Get back to home
          </Link>
          <Button onClick={handleSignOut} variant="destructive">
            Logout
          </Button>
        </div>
        <h1>Welcome, {firstName}</h1>
        <div className="bg-[#F4F4F4] p-8 rounded-2xl flex flex-col gap-6 text-center">
          <div className="flex flex-col">
            <div className="grid grid-cols-3 text-left py-4 px-6 text-base font-normal uppercase text-darkBlack bg-[#c9c9c9] rounded-t-[4px]">
              <p>Type</p>
              <p>Status</p>
              <p>Action</p>
            </div>
            <div className="grid grid-cols-3 items-center text-left p-6 border border-[#BBBBBB] rounded-b-[4px]">
              <p>Authenticator App</p>
              {factors.length > 0 ? (
                <p className="text-green-500">Enabled</p>
              ) : (
                <p className="text-red-500">Disabled</p>
              )}
              {factors.length > 0 ? (
                <Button onClick={handleUnenroll} variant="destructive">
                  Remove
                </Button>
              ) : (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default">Configure</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <EnrollMFA setIsModalOpen={setIsOpen} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

