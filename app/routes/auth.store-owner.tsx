import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Store, Eye, EyeOff } from "lucide-react";
import { signupStoreOwner, loginStoreOwner, getUserSession } from "~/lib/user-session";
import { seedNewStoreOwner } from "~/lib/store";
import { SEED_PRODUCTS } from "~/lib/seed-data";
import { storeOwnerSignupInputSchema } from "~/lib/validation";

export function meta() {
  return [{ title: "Store Owner Sign In — SukiTrack" }];
}

type Tab = "signup" | "login";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors";

export default function AuthStoreOwner() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("signup");

  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getUserSession();
    if (session?.role === "store_owner") navigate("/store", { replace: true });
    else if (session?.role === "customer") navigate("/customer", { replace: true });
  }, [navigate]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    const parsed = storeOwnerSignupInputSchema.safeParse({
      name: ownerName,
      email: signupEmail,
      storeName,
      password,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form values.");
      return;
    }
    setLoading(true);
    const result = await signupStoreOwner(ownerName.trim(), signupEmail.trim(), storeName.trim(), password);
    setLoading(false);
    if (!result.ok) { setError(result.error ?? "Something went wrong."); return; }
    const session = getUserSession();
    if (session) {
      const seeded = SEED_PRODUCTS.map((p, i) => ({
        ...p,
        id: `${p.id}_${session.email.replace(/[^a-z0-9]/gi, "").slice(0, 8)}_${i}`,
        storeOwnerId: session.email,
      }));
      seedNewStoreOwner(seeded);
    }
    navigate("/store");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await loginStoreOwner(loginEmail.trim(), loginPassword);
    setLoading(false);
    if (!result.ok) { setError(result.error ?? "Something went wrong."); return; }
    navigate("/store");
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none" style={{ color: "var(--foreground)" }}>
            Store Owner
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Manage your store, prices, and catalog
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
              Store Name *
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Aling Nena's Sari-Sari"
              required
              className={inputCls}
              style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Your Name *
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Nena Reyes"
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
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={inputCls}
              style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Password *
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={8}
                className={`${inputCls} pr-11`}
                style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: "var(--muted-foreground)" }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Confirm Password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              className={inputCls}
              style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
            />
          </div>

          {error && (
            <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--c-error-bg)", color: "var(--destructive)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {loading ? "Creating store…" : "Create Store Account"}
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
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Password *
            </label>
            <div className="relative">
              <input
                type={showLoginPw ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Your password"
                required
                className={`${inputCls} pr-11`}
                style={{ backgroundColor: "var(--muted)", color: "var(--foreground)" }}
              />
              <button
                type="button"
                onClick={() => setShowLoginPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: "var(--muted-foreground)" }}
              >
                {showLoginPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--c-error-bg)", color: "var(--destructive)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      )}
    </>
  );
}
