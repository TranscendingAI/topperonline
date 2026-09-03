"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

export default function PinEntryPage() {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const router = useRouter();

  useEffect(() => {
    // Focus first input on mount
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (newPin.every((digit) => digit !== "") && index === 3) {
      submitPin(newPin.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    // Only accept 4-digit numbers
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setPin(digits);
      setError(false);
      inputRefs[3].current?.focus();
      
      // Auto-submit pasted PIN
      setTimeout(() => submitPin(pastedData), 100);
    }
  };

  const submitPin = async (pinValue: string) => {
    setIsSubmitting(true);
    setError(false);

    try {
      const response = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinValue }),
      });

      if (response.ok) {
        // PIN correct - redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      } else {
        // PIN incorrect - show error and clear
        setError(true);
        setPin(["", "", "", ""]);
        inputRefs[0].current?.focus();
      }
    } catch (err) {
      setError(true);
      setPin(["", "", "", ""]);
      inputRefs[0].current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 font-space-grotesk mb-2">
            Suburban Toppers
          </h1>
          <p className="text-slate-600">Enter your 4-digit PIN to continue</p>
        </div>

        {/* PIN Entry Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center gap-4 mb-6">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isSubmitting}
                className={`
                  w-16 h-20 text-center text-3xl font-bold rounded-xl
                  border-2 transition-all duration-200
                  focus:outline-none focus:ring-4 focus:ring-blue-500/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    error
                      ? "border-red-500 bg-red-50 text-red-600 shake"
                      : digit
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-slate-300 bg-white text-slate-900 hover:border-slate-400"
                  }
                `}
                aria-label={`PIN digit ${index + 1}`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center text-red-600 text-sm font-medium mb-4">
              Incorrect PIN. Please try again.
            </div>
          )}

          {/* Hint text */}
          <p className="text-center text-slate-500 text-sm">
            {isSubmitting ? "Verifying..." : "Enter 4 digits"}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-500 text-sm">
          Contact your administrator if you've forgotten your PIN
        </div>
      </div>

      {/* Shake animation for error */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
