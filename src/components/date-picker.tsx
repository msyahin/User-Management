import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon } from 'lucide-react'; // <-- Use lucide-react
import React, { useMemo } from 'react';
import type { DateRange, SelectRangeEventHandler } from 'react-day-picker'; // <-- Import types

// --- Removed MUI Imports ---
// import { DatePicker } from '@mui/x-date-pickers';
// import { Box, Button, Popover } from '@mui/material';

// --- Added shadcn/ui Imports ---
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// --- Assumed Imports from your project ---
import { formatStr } from '@/utils/format-time';
import { cn } from '@/lib/utils'; // Standard shadcn/ui utility

interface IDatePickerButton {
  startDate: Dayjs | null;
  endDate: Dayjs | null;

  setStartDate: (date: Dayjs | null) => void;
  setEndDate: (date: Dayjs | null) => void;
  className?: string; // <-- Added className prop for flexibility
}

const DatePickerButton: React.FC<IDatePickerButton> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  className,
}) => {
  // 1. Convert Dayjs props to the 'DateRange' object required by react-day-picker
  const selectedDateRange: DateRange | undefined = useMemo(
    () => ({
      from: startDate ? startDate.toDate() : undefined,
      to: endDate ? endDate.toDate() : undefined,
    }),
    [startDate, endDate]
  );

  // 2. Handle selection from the Calendar and update state with Dayjs objects
  const handleDateSelect: SelectRangeEventHandler = (range) => {
    setStartDate(range?.from ? dayjs(range.from) : null);
    setEndDate(range?.to ? dayjs(range.to) : null);
  };

  // 3. Format the label (kept your logic, added a fallback)
  const dateRangeLabel = useMemo(() => {
    if (!startDate || !endDate) return 'Pick a date range';

    // Assuming formatStr.split.date is 'YYYY/MM/DD' or similar
    const format = formatStr.split.date;
    return `${dayjs(startDate).format(format)} - ${dayjs(endDate).format(
      format
    )}`;
  }, [startDate, endDate]);

  // 4. Replicates the maxDate={dayjs()} from the original component
  // Note: This now disables all future dates for both start and end
  const disabledDays = { after: new Date() };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-auto justify-start text-left font-normal',
            !startDate && !endDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRangeLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={selectedDateRange?.from}
          selected={selectedDateRange}
          onSelect={handleDateSelect}
          numberOfMonths={2} // <-- Display 2 months (common for range pickers)
          disabled={disabledDays} // <-- Apply the maxDate logic
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerButton;