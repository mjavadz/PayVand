import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { 
  toJalali, 
  toGregorian, 
  jalaliMonthLength, 
  jalaliWeekday,
  JALALI_MONTHS, 
  JALALI_WEEKDAYS_SHORT, 
  formatJalali,
  formatJalaliNumeric,
  type JalaliDate
} from '@/lib/jalali';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/format';

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function Calendar({
  selected,
  onSelect,
  className,
  minDate,
  maxDate
}: CalendarProps) {
  const today = useMemo(() => new Date(), []);
  const todayJalali = useMemo(() => toJalali(today), [today]);

  const initialJalali = useMemo(() => {
    return selected ? toJalali(selected) : todayJalali;
  }, [selected, todayJalali]);

  const [currentYear, setCurrentYear] = useState<number>(initialJalali.jy);
  const [currentMonth, setCurrentMonth] = useState<number>(initialJalali.jm); // 1-12

  const selectedJalali = useMemo(() => {
    return selected ? toJalali(selected) : null;
  }, [selected]);

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(todayJalali.jy);
    setCurrentMonth(todayJalali.jm);
    if (onSelect) {
      onSelect(new Date());
    }
  };

  // Build Month Grid
  const daysInMonth = useMemo(() => {
    return jalaliMonthLength(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // First day of current month in Gregorian
  const firstDayGregorian = useMemo(() => {
    return toGregorian(currentYear, currentMonth, 1);
  }, [currentYear, currentMonth]);

  // Weekday offset of 1st day (0 = Saturday, 6 = Friday)
  const startWeekday = useMemo(() => {
    return jalaliWeekday(firstDayGregorian);
  }, [firstDayGregorian]);

  // Days in previous month for padding
  const prevMonthDays = useMemo(() => {
    const prevM = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevY = currentMonth === 1 ? currentYear - 1 : currentYear;
    return jalaliMonthLength(prevY, prevM);
  }, [currentYear, currentMonth]);

  const calendarCells = useMemo(() => {
    const cells = [];

    // 1. Previous month outside days
    for (let i = startWeekday - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      cells.push({
        day: dayNum,
        isCurrentMonth: false,
        isPrev: true
      });
    }

    // 2. Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const gDate = toGregorian(currentYear, currentMonth, day);
      const isToday = 
        currentYear === todayJalali.jy && 
        currentMonth === todayJalali.jm && 
        day === todayJalali.jd;
      
      const isSelected = 
        selectedJalali !== null &&
        currentYear === selectedJalali.jy &&
        currentMonth === selectedJalali.jm &&
        day === selectedJalali.jd;

      cells.push({
        day,
        isCurrentMonth: true,
        gDate,
        isToday,
        isSelected
      });
    }

    // 3. Next month outside days to fill up to 35 or 42 cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let nextDay = 1; nextDay <= remaining; nextDay++) {
      cells.push({
        day: nextDay,
        isCurrentMonth: false,
        isNext: true
      });
    }

    return cells;
  }, [currentYear, currentMonth, daysInMonth, startWeekday, prevMonthDays, todayJalali, selectedJalali]);

  return (
    <div 
      className={cn(
        "p-4 bg-card/95 border border-border rounded-2xl shadow-lg w-full max-w-[340px] select-none font-sans",
        className
      )}
      dir="rtl"
    >
      {/* Month & Year Header Navigation */}
      <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-border/60">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-foreground text-sm">
            {JALALI_MONTHS[currentMonth - 1]}
          </span>
          <span className="font-bold text-muted-foreground text-xs font-mono">
            {toPersianDigits(currentYear)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* In RTL: Right Arrow moves to previous month (earlier in time) */}
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="ماه قبل"
            aria-label="ماه قبل"
          >
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            onClick={handleGoToToday}
            className="px-2 py-1 rounded-lg text-[11px] font-bold text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 transition-all flex items-center gap-1"
            title="برو به امروز"
          >
            <RotateCcw size={11} />
            <span>امروز</span>
          </button>

          {/* In RTL: Left Arrow moves to next month (later in time) */}
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="ماه بعد"
            aria-label="ماه بعد"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>

      {/* Weekday Names Header (Saturday first) */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {JALALI_WEEKDAYS_SHORT.map((weekday, idx) => (
          <div 
            key={weekday}
            className={cn(
              "text-[11px] font-bold py-1",
              idx === 6 ? "text-rose-400" : "text-muted-foreground" // Friday (جمعه) in red
            )}
          >
            {weekday}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <div
                key={`outside-${idx}`}
                className="h-9 flex items-center justify-center text-xs text-muted-foreground/30 font-medium select-none"
              >
                {toPersianDigits(cell.day)}
              </div>
            );
          }

          const isFriday = idx % 7 === 6;

          return (
            <button
              key={`day-${cell.day}`}
              type="button"
              onClick={() => {
                if (cell.gDate && onSelect) {
                  onSelect(cell.gDate);
                }
              }}
              className={cn(
                "h-9 w-full rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative",
                cell.isSelected
                  ? "bg-accent text-accent-foreground shadow-md font-black scale-105 z-10"
                  : cell.isToday
                    ? "bg-accent/15 text-accent border border-accent/40 font-black hover:bg-accent/25"
                    : isFriday
                      ? "text-rose-400/90 hover:bg-rose-500/10"
                      : "text-foreground hover:bg-muted/70"
              )}
            >
              <span>{toPersianDigits(cell.day)}</span>
              {cell.isToday && !cell.isSelected && (
                <span className="w-1 h-1 rounded-full bg-accent absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Summary & Gregorian Equivalent */}
      {selected && (
        <div className="mt-3.5 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-foreground font-bold">{formatJalali(selected, { weekday: true })}</span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70" dir="ltr">
            {selected.toISOString().slice(0, 10)}
          </span>
        </div>
      )}
    </div>
  );
}
