

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface MfaChallengeModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const MfaChallengeModal: React.FC<MfaChallengeModalProps> = ({ onClose, onConfirm }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  const handleConfirm = async () => {
    try {
      const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
      if (factorError) throw factorError;

      const factorId = factors?.totp[0]?.id;
      if (!factorId) throw new Error("No TOTP factor found");

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verificationCode,
      });
      if (verifyError) throw verifyError;

      onConfirm(); // Close the modal and proceed with login
    } catch (error) {
      setError((error as Error).message);
      onClose();
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      <DialogHeader>
        <DialogTitle>Enter MFA Code</DialogTitle>
        <DialogDescription>
          Enter the 6-digit code from your authenticator app.
        </DialogDescription>
      </DialogHeader>
      {error && <div className="text-red-500">{error}</div>}
      <Input
        type="text"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        placeholder="Verification Code"
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default MfaChallengeModal;