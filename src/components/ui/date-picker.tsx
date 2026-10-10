import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from './calendar';
import { formatJalali } from '@/lib/jalali';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ شمسی...",
  className,
  disabled = false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (date: Date) => {
    if (onChange) {
      onChange(date);
    }
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      onChange(undefined);
    }
  };

  return (
    <div className={cn("relative inline-block text-right font-sans", className)} ref={containerRef} dir="rtl">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all bg-muted/40 hover:bg-muted/70",
          isOpen ? "border-accent ring-2 ring-accent/20" : "border-border",
          disabled && "opacity-50 cursor-not-allowed",
          value ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon size={15} className="text-accent shrink-0" />
          <span className="truncate">
            {value ? formatJalali(value, { weekday: false }) : placeholder}
          </span>
        </div>

        {value && !disabled && (
          <span
            onClick={handleClear}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="پاک کردن"
          >
            <X size={13} />
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 start-0 z-50 animate-fade-in">
          <Calendar
            selected={value}
            onSelect={handleSelect}
            className="shadow-2xl border-accent/20"
          />
        </div>
      )}
    </div>
  );
}
