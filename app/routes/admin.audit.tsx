import { useEffect, useState } from "react";
import { getAuditLog, clearAuditLog, type AuditEntry } from "~/lib/audit-log";

export function meta() {
  return [
    { title: "Audit log - SukiTrack" },
    { name: "robots", content: "noindex" },
  ];
}

function formatAction(action: AuditEntry["action"]): string {
  return action.replace(/_/g, " ");
}

export default function AdminAudit() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  function refresh() {
    setEntries(getAuditLog());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleClear() {
    if (!confirm("Clear the entire audit log? This cannot be undone.")) return;
    clearAuditLog();
    refresh();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1
            className="font-display text-2xl font-bold mb-1"
            style={{ color: "var(--c-text)" }}
          >
            Audit log
          </h1>
          <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
            Recent catalog mutations (stored locally).
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="self-start px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors hover-error"
          style={{ color: "var(--c-error)", backgroundColor: "var(--c-error-bg)" }}
        >
          Clear log
        </button>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "var(--c-card)", border: "1px solid var(--c-border)" }}
      >
        {entries.length === 0 ? (
          <p className="py-12 text-center text-sm" style={{ color: "var(--c-text-3)" }}>
            No audit entries yet. Editing products will appear here.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--c-border)" }}>
            {entries.map((e) => (
              <li key={e.id} className="px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <time
                    className="text-xs font-mono"
                    style={{ color: "var(--c-text-3)" }}
                    dateTime={e.at}
                  >
                    {new Date(e.at).toLocaleString()}
                  </time>
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--c-tint)" }}
                  >
                    {formatAction(e.action)}
                  </span>
                </div>
                {e.productName && (
                  <p className="text-sm font-medium mt-1" style={{ color: "var(--c-text)" }}>
                    {e.productName}
                    {e.productId ? (
                      <span className="font-normal text-xs ml-2" style={{ color: "var(--c-text-3)" }}>
                        {e.productId}
                      </span>
                    ) : null}
                  </p>
                )}
                {e.summary && (
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--c-text-2)" }}>
                    {e.summary}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
