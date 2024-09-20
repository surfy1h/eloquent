"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { X } from "lucide-react";

interface EnrollMFAProps {
  setIsModalOpen: (isOpen: boolean) => void;
}

export default function EnrollMFA({ setIsModalOpen }: EnrollMFAProps) {
  const [factorId, setFactorId] = useState("");
  const [qr, setQR] = useState(""); // holds the QR code image SVG
  const [verifyCode, setVerifyCode] = useState(""); // contains the code entered by the user
  const [error, setError] = useState(""); // holds an error message

  const supabase = createClientComponentClient();

  const onEnableClicked = async () => {
    setError("");
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        setError(challenge.error.message);
        throw challenge.error;
      }

      const challengeId = challenge.data.id;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verifyCode,
      });
      if (verify.error) {
        setError(verify.error.message);
        throw verify.error;
      }
    } catch (error) {
      console.error("MFA verification error:", error);
    }
  };

  useEffect(() => {
    const enrollMFA = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: "totp",
        });
        if (error) {
          throw error;
        }
        setFactorId(data.id);
        if (data.type === "totp") {
          setQR(data.totp.qr_code);
        }
      } catch (error) {
        console.error("MFA enrollment error:", error);
      }
    };

    enrollMFA();
  }, [supabase.auth.mfa]);

  return (
    <Card className="w-full">
      {error && <div className="text-red-500 p-4">{error}</div>}
      <CardHeader className="flex justify-between items-center bg-gray-100 rounded-t-xl">
        <h2 className="text-2xl">Set-up Multi Factor Authentication</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsModalOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2">
            Scan the QR code below with your authenticator app:
          </h3>
          <div className="flex items-center justify-center">
            <Image src={qr} height={300} width={300} alt="QR Code" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">
            Enter the passcode from your authenticator app:
          </h3>
          <Input
            type="text"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.trim())}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={onEnableClicked}
          disabled={!verifyCode}
        >
          Enable
        </Button>
      </CardFooter>
    </Card>
  );
}