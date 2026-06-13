"use client";

import { Sparkles } from "lucide-react";

interface SuggestionPillsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
  isPending?: boolean;
}

export function SuggestionPills({
  suggestions,
  onSelect,
  isPending = false,
}: SuggestionPillsProps) {
  if (isPending) {
    const widths = ["120px", "90px", "110px", "80px", "100px"];
    return (
      <div className="flex flex-wrap gap-2 animate-pulse mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 rounded-full bg-muted/60"
            style={{ width: widths[i % widths.length] }}
          />
        ))}
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5 mt-3 animate-fade-in">
      <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
        <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
        <span>Try these suggested message ideas:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(suggestion)}
            className="inline-flex items-center rounded-full border border-border/50 bg-card/40 px-3.5 py-1.5 text-xs font-medium text-card-foreground/80 transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
