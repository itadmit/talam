"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { icons, type LucideIcon } from "lucide-react";
import { Search, Smile } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Curated icon list – 40 commonly used icons for the system          */
/* ------------------------------------------------------------------ */

const POPULAR_ICONS: string[] = [
  "Home",
  "Search",
  "BookOpen",
  "FileText",
  "Users",
  "Calendar",
  "Heart",
  "Star",
  "Shield",
  "Award",
  "Bell",
  "Mail",
  "Phone",
  "Link2",
  "Globe",
  "Settings",
  "Briefcase",
  "Building2",
  "Megaphone",
  "HelpCircle",
  "Info",
  "AlertTriangle",
  "CheckCircle",
  "Clock",
  "Map",
  "Wallet",
  "CreditCard",
  "Bookmark",
  "Tag",
  "Folder",
  "Flag",
  "Zap",
  "Target",
  "Eye",
  "Lock",
  "Unlock",
  "MessageCircle",
  "ThumbsUp",
  "Sparkles",
  "CircleDot",
];

/* ------------------------------------------------------------------ */
/*  IconPicker Component                                               */
/* ------------------------------------------------------------------ */

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return POPULAR_ICONS;
    const q = search.toLowerCase();
    // Search in popular icons first, then in all lucide icons
    const fromPopular = POPULAR_ICONS.filter((name) =>
      name.toLowerCase().includes(q)
    );
    const fromAll = Object.keys(icons).filter(
      (name) =>
        name.toLowerCase().includes(q) && !POPULAR_ICONS.includes(name)
    );
    return [...fromPopular, ...fromAll].slice(0, 40);
  }, [search]);

  // Render the currently selected icon
  const SelectedIcon: LucideIcon | null = value
    ? (icons[value as keyof typeof icons] as LucideIcon) || null
    : null;

  function handleSelect(iconName: string) {
    onChange(iconName);
    setOpen(false);
    setSearch("");
  }

  function handleClear() {
    onChange("");
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className={cn(
            "justify-start gap-2 font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {SelectedIcon ? (
            <>
              <SelectedIcon className="h-4 w-4" />
              <span className="text-xs" dir="ltr">
                {value}
              </span>
            </>
          ) : (
            <>
              <Smile className="h-4 w-4 opacity-50" />
              <span>בחר אייקון</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-3" align="start">
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש אייקון..."
              className="pr-9 h-8 text-sm"
              dir="ltr"
            />
          </div>

          {/* Icon Grid */}
          <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
            {filteredIcons.map((iconName) => {
              const Icon = icons[iconName as keyof typeof icons] as
                | LucideIcon
                | undefined;
              if (!Icon) return null;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => handleSelect(iconName)}
                  title={iconName}
                  className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-md transition-colors hover:bg-accent",
                    value === iconName &&
                      "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-3">
              לא נמצאו אייקונים
            </p>
          )}

          {/* Clear button */}
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-7"
              type="button"
              onClick={handleClear}
            >
              הסר אייקון
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
