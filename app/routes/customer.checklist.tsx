import { useEffect, useState, useCallback } from "react";
import { CheckSquare, Plus, Trash2, Check, Package } from "lucide-react";
import { getUserSession } from "~/lib/user-session";

export function meta() {
  return [
    { title: "Items Checklist - SukiTrack" },
    { name: "description", content: "Your personal shopping checklist" },
  ];
}

const CHECKLIST_KEY = "sukitrack_customer_checklist";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  addedAt: string;
}

function loadChecklist(email: string): ChecklistItem[] {
  try {
    const raw = localStorage.getItem(`${CHECKLIST_KEY}_${email}`);
    return raw ? (JSON.parse(raw) as ChecklistItem[]) : [];
  } catch {
    return [];
  }
}

function saveChecklist(email: string, items: ChecklistItem[]) {
  localStorage.setItem(`${CHECKLIST_KEY}_${email}`, JSON.stringify(items));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function CustomerChecklist() {
  const session = getUserSession();
  const email = session?.email ?? "guest";

  const [items, setItems] = useState<ChecklistItem[]>(() => loadChecklist(email));
  const [input, setInput] = useState("");

  useEffect(() => {
    saveChecklist(email, items);
  }, [items, email]);

  const handleAdd = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setItems((prev) => [
      ...prev,
      { id: generateId(), text, checked: false, addedAt: new Date().toISOString() },
    ]);
    setInput("");
  }, [input]);

  const handleToggle = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClearDone = useCallback(() => {
    setItems((prev) => prev.filter((item) => !item.checked));
  }, []);

  const pending = items.filter((i) => !i.checked);
  const done = items.filter((i) => i.checked);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: "var(--c-text)" }}>
            Items Checklist
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--c-text-3)" }}>
            {pending.length} item{pending.length !== 1 ? "s" : ""} to get
          </p>
        </div>
        {done.length > 0 && (
          <button
            onClick={handleClearDone}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer hover-btn self-start"
            style={{ color: "var(--c-text-3)", backgroundColor: "var(--c-card)" }}
          >
            <Trash2 size={14} />
            Clear done ({done.length})
          </button>
        )}
      </div>

      {/* Add item */}
      <div
        className="flex items-center gap-3 p-4 rounded-2xl mb-6"
        style={{ backgroundColor: "var(--c-card)" }}
      >
        <CheckSquare size={18} style={{ color: "var(--c-tint)" }} className="flex-shrink-0" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add an item to your list..."
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "var(--c-text)" }}
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-40"
          style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)" }}
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <Package size={36} className="mx-auto mb-3" style={{ color: "var(--c-border-strong)" }} />
          <p className="font-display font-bold text-lg mb-1" style={{ color: "var(--c-text)" }}>
            Your list is empty
          </p>
          <p className="text-sm" style={{ color: "var(--c-text-3)" }}>
            Add items above to start your shopping list.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ backgroundColor: "var(--c-card)" }}
            >
              <button
                onClick={() => handleToggle(item.id)}
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors"
                style={{ borderColor: "var(--c-border-strong)" }}
                aria-label="Mark as done"
              />
              <span className="flex-1 text-sm" style={{ color: "var(--c-text)" }}>
                {item.text}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover-error"
                style={{ color: "var(--c-error)" }}
                aria-label="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {done.length > 0 && (
            <>
              <p className="text-xs font-medium px-1 pt-3 pb-1" style={{ color: "var(--c-text-3)" }}>
                Done ({done.length})
              </p>
              {done.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 rounded-2xl opacity-60"
                  style={{ backgroundColor: "var(--c-card)" }}
                >
                  <button
                    onClick={() => handleToggle(item.id)}
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 cursor-pointer"
                    style={{ backgroundColor: "var(--secondary)" }}
                    aria-label="Unmark"
                  >
                    <Check size={11} style={{ color: "var(--secondary-foreground)" }} />
                  </button>
                  <span className="flex-1 text-sm line-through" style={{ color: "var(--c-text-3)" }}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover-error"
                    style={{ color: "var(--c-error)" }}
                    aria-label="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
