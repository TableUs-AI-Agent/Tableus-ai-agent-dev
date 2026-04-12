"use client";

import { useRef, useState, type KeyboardEvent } from "react";

type User = { id: string; name: string; avatar: string };

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionAdd: (user: User) => void;
  users: User[];
  placeholder?: string;
  onSubmit?: () => void;
}

export function MentionInput({
  value,
  onChange,
  onMentionAdd,
  users,
  placeholder,
  onSubmit,
}: MentionInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = users.filter((user) =>
    user.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleChange = (text: string) => {
    onChange(text);
    const atMatch = text.match(/@(\w*)$/);
    if (atMatch) {
      setFilter(atMatch[1]);
      setHighlightIdx(0);
      setShowDropdown(true);
    } else {
      setFilter("");
      setShowDropdown(false);
    }
  };

  const selectUser = (user: User) => {
    const newValue = value.replace(/@\w*$/, "").replace(/\s{2,}/g, " ").trimStart();
    onChange(newValue);
    onMentionAdd(user);
    setShowDropdown(false);
    setFilter("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (showDropdown && filtered.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightIdx((index) => (index + 1) % filtered.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightIdx((index) => (index - 1 + filtered.length) % filtered.length);
      } else if (event.key === "Enter") {
        event.preventDefault();
        selectUser(filtered[highlightIdx]);
        return;
      }
    }
    if (!showDropdown && event.key === "Enter") {
      event.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent py-0.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
      />
      {showDropdown && filtered.length > 0 && (
        <div className="absolute bottom-full left-0 z-[100] mb-2 w-64 overflow-hidden rounded-xl border border-[var(--border)] bg-white opacity-100 shadow-[0_20px_50px_rgba(15,23,42,0.22)]">
          <div className="border-b border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--muted-foreground)]">
            Select a person
          </div>
          {filtered.map((user, index) => (
            <button
              key={user.id}
              onClick={() => selectUser(user)}
              type="button"
              className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors ${
                index === highlightIdx
                  ? "bg-[var(--accent)]/15 text-[var(--accent-light)]"
                  : "bg-white text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatar} alt="" className="h-6 w-6 rounded-full" />
              <span>{user.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

