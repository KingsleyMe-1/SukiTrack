import { useEffect, useState } from "react";
import { getStoreName, setStoreName } from "~/lib/store";
import { appendAudit } from "~/lib/audit-log";

export function meta() {
  return [
    { title: "Admin settings - SukiTrack" },
    { name: "robots", content: "noindex" },
  ];
}

export default function AdminSettings() {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(getStoreName());
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const prev = getStoreName();
    const next = name.trim() || "The Hearth Store";
    setStoreName(next);
    if (prev !== next) {
      appendAudit({
        action: "store_name_updated",
        summary: `Store display name: "${prev}" → "${next}"`,
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h1
        className="font-display text-2xl font-bold mb-2"
        style={{ color: "var(--c-text)" }}
      >
        Store settings
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--c-text-3)" }}>
        This name appears in the sidebar and header across the main app.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 max-w-lg"
        style={{ backgroundColor: "var(--c-card)" }}
      >
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: "var(--c-text-2)" }}
        >
          Store display name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] mb-4"
          style={{
            backgroundColor: "var(--c-input)",
            color: "var(--c-text)",
            border: "none",
          }}
          placeholder="The Hearth Store"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </form>
    </div>
  );
}
