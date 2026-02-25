"use client";

// components/landlord/AuthForms.tsx
// Login, Register, and ForgotPassword forms — consolidated into one file.
// Each is its own exported component consumed by its own app/ page.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";

// ─── Shared primitives ────────────────────────────────────────────────────

function FormWrapper({
  title,
  children,
  onSubmit,
}: {
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4 min-h-[70vh]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-blue-700 mb-8">{title}</h1>
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-blue-100 space-y-4"
      >
        {children}
      </form>
    </motion.div>
  );
}

function Field({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShow((v) => !v)}
            tabIndex={-1}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.97 }}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {label}
    </motion.button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
      {message}
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2">
      {message}
    </div>
  );
}

// ─── Landlord Login ────────────────────────────────────────────────────────

export function LandlordLoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid credentials. Please try again.");
        return;
      }

      router.push("/landlord/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormWrapper title="Landlord Login" onSubmit={handleSubmit}>
      <ErrorBanner message={error} />
      <Field
        label="Phone Number or Name"
        id="identifier"
        placeholder="Enter your phone or name"
        value={identifier}
        onChange={setIdentifier}
      />
      <Field
        label="Password"
        id="password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={setPassword}
      />
      <SubmitButton loading={loading} label="Login" />
      <div className="text-center space-y-2 pt-1 text-sm">
        <Link href="/landlord/forgot-password" className="text-blue-600 hover:underline block">
          Forgot your password?
        </Link>
        <Link href="/landlord/register" className="text-blue-600 hover:underline block">
          Don't have an account? Register
        </Link>
      </div>
    </FormWrapper>
  );
}

// ─── Landlord Register ─────────────────────────────────────────────────────

export function LandlordRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/^07\d{8}$/.test(phone)) {
      setError("Enter a valid Kenyan phone number (07XXXXXXXX).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => router.push("/landlord/login"), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormWrapper title="Register as a Landlord" onSubmit={handleSubmit}>
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />
      <Field label="Full Name" id="name" placeholder="Your full name" value={name} onChange={setName} />
      <Field label="Phone Number" id="phone" type="tel" placeholder="e.g. 0712345678" value={phone} onChange={setPhone} />
      <Field label="Password" id="password" type="password" placeholder="Min. 8 characters" value={password} onChange={setPassword} />
      <Field label="Confirm Password" id="confirm" type="password" placeholder="Repeat password" value={confirm} onChange={setConfirm} />
      <SubmitButton loading={loading} label="Create Account" />
      <div className="text-center text-sm pt-1">
        <Link href="/landlord/login" className="text-blue-600 hover:underline">
          Already have an account? Login
        </Link>
      </div>
    </FormWrapper>
  );
}

// ─── Forgot Password (3-step OTP flow) ────────────────────────────────────

type FPStep = 1 | 2 | 3;

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<FPStep>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Phone number not found."); return; }
      setSuccess(`OTP sent to ${phone}`);
      setStep(2);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Incorrect OTP."); return; }
      setSuccess("OTP verified!");
      setStep(3);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirm) { setError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Reset failed."); return; }
      setSuccess("Password reset! Redirecting...");
      setTimeout(() => router.push("/landlord/login"), 1500);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const stepTitles: Record<FPStep, string> = {
    1: "Forgot Password",
    2: "Enter OTP",
    3: "Reset Password",
  };

  return (
    <FormWrapper title={stepTitles[step]} onSubmit={step === 1 ? sendOtp : step === 2 ? verifyOtp : resetPassword}>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {([1, 2, 3] as FPStep[]).map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              s <= step ? "bg-blue-600 w-8" : "bg-gray-200 w-4"
            }`}
          />
        ))}
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {step === 1 && (
        <Field label="Registered Phone Number" id="phone" type="tel" placeholder="e.g. 0712345678" value={phone} onChange={setPhone} />
      )}

      {step === 2 && (
        <>
          <p className="text-sm text-gray-500">OTP sent to <strong>{phone}</strong></p>
          <Field label="Enter OTP" id="otp" placeholder="6-digit code" value={otp} onChange={setOtp} />
          <button type="button" onClick={() => { setStep(1); setSuccess(""); }} className="text-blue-600 text-sm hover:underline">
            ← Change phone number
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <Field label="New Password" id="newPassword" type="password" placeholder="Min. 8 characters" value={newPassword} onChange={setNewPassword} />
          <Field label="Confirm New Password" id="confirm" type="password" placeholder="Repeat new password" value={confirm} onChange={setConfirm} />
        </>
      )}

      <SubmitButton
        loading={loading}
        label={step === 1 ? "Send OTP" : step === 2 ? "Verify OTP" : "Reset Password"}
      />

      <div className="text-center text-sm">
        <Link href="/landlord/login" className="text-blue-600 hover:underline">
          Back to Login
        </Link>
      </div>
    </FormWrapper>
  );
}