import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ShoppingCart } from "lucide-react";
import {
  requestCustomerOtp,
  verifyCustomerOtp,
  getUserSession,
} from "~/lib/user-session";

export function meta() {
  return [{ title: "Customer Sign In — SukiTrack" }];
}

type Tab = "signup" | "login";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors";

export default function AuthCustomer() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("signup");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [signupOtp, setSignupOtp] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [signupOtpRequested, setSignupOtpRequested] = useState(false);
  const [loginOtpRequested, setLoginOtpRequested] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getUserSession();
    if (session?.role === "customer") navigate("/customer", { replace: true });
    else if (session?.role === "store_owner") navigate("/store", { replace: true });
  }, [navigate]);

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!signupOtpRequested) {
      setLoading(true);
      const request = requestCustomerOtp(email.trim(), "signup", name.trim());
      setLoading(false);
      if (!request.ok) {
        setError(request.error ?? "Something went wrong.");
        return;
      }
      setSignupOtpRequested(true);
      setDevOtpCode(request.debugCode ?? "");
      return;
    }

    setLoading(true);
    const result = verifyCustomerOtp(email.trim(), signupOtp.trim(), "signup", name.trim());
    setLoading(false);
    if (!result.ok) { setError(result.error ?? "Something went wrong."); return; }
    navigate("/customer");
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!loginOtpRequested) {
      setLoading(true);
      const request = requestCustomerOtp(loginEmail.trim(), "login");
      setLoading(false);
      if (!request.ok) {
        setError(request.error ?? "Something went wrong.");
        return;
      }
      setLoginOtpRequested(true);
      setDevOtpCode(request.debugCode ?? "");
      return;
    }

    setLoading(true);
    const result = verifyCustomerOtp(loginEmail.trim(), loginOtp.trim(), "login");
    setLoading(false);
    if (!result.ok) { setError(result.error ?? "Something went wrong."); return; }
    navigate("/customer");
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
        >
          <ShoppingCart size={20} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none" style={{ color: "var(--foreground)" }}>
            Customer
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Browse stores, track prices, manage your list
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div
        className="flex rounded-xl p-1 mb-6 gap-1"
        style={{ backgroundColor: "var(--muted)" }}
      >
        {(["signup", "login"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setError(""); }}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={
              tab === t
                ? { backgroundColor: "var(--card)", color: "var(--foreground)", boxShadow: "var(--shadow-sm)" }
                : { color: "var(--muted-foreground)" }
            }
          >
            {t === "signup" ? "Sign Up" : "Sign In"}
          </button>
        ))}
      </div>

      {/* Sign Up */}
      {tab === "signup" && (
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Your Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maria Santos"
              required
              className={inputCls}
              style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={inputCls}
              style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
            />
            <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
              We send a one-time code to verify this email.
            </p>
          </div>

          {signupOtpRequested && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Verification Code *
              </label>
              <input
                type="text"
                value={signupOtp}
                onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="6-digit code"
                required
                className={inputCls}
                style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
              />
            </div>
          )}

          {devOtpCode && (
            <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--c-info-bg)", color: "var(--c-text-2)" }}>
              Demo OTP code: {devOtpCode}
            </p>
          )}

          {error && (
            <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--c-error-bg)", color: "var(--destructive)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
          >
            {loading ? "Please wait…" : signupOtpRequested ? "Verify & Continue" : "Send OTP"}
          </button>
        </form>
      )}

      {/* Sign In */}
      {tab === "login" && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Email Address *
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={inputCls}
              style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
            />
          </div>

          {loginOtpRequested && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Verification Code *
              </label>
              <input
                type="text"
                value={loginOtp}
                onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="6-digit code"
                required
                className={inputCls}
                style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
              />
            </div>
          )}

          {devOtpCode && (
            <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--c-info-bg)", color: "var(--c-text-2)" }}>
              Demo OTP code: {devOtpCode}
            </p>
          )}

          {error && (
            <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--c-error-bg)", color: "var(--destructive)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
          >
            {loading ? "Please wait…" : loginOtpRequested ? "Verify & Sign In" : "Send OTP"}
          </button>
        </form>
      )}
    </>
  );
}
