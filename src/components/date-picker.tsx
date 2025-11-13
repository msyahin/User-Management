import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon } from 'lucide-react'; 
import React, { useMemo } from 'react';
import type { DateRange } from 'react-day-picker'; 

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { formatStr } from '@/utils/format-time';
import { cn } from '@/lib/utils'; 

interface IDatePickerButton {
  startDate: Dayjs | null;
  endDate: Dayjs | null;

  setStartDate: (date: Dayjs | null) => void;
  setEndDate: (date: Dayjs | null) => void;
  className?: string;
}

const DatePickerButton: React.FC<IDatePickerButton> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  className,
}) => {
  const selectedDateRange: DateRange | undefined = useMemo(
    () => ({
      from: startDate ? startDate.toDate() : undefined,
      to: endDate ? endDate.toDate() : undefined,
    }),
    [startDate, endDate]
  );

  const handleDateSelect = (range: DateRange | undefined) => {
    setStartDate(range?.from ? dayjs(range.from) : null);
    setEndDate(range?.to ? dayjs(range.to) : null);
  };

  const dateRangeLabel = useMemo(() => {
    if (!startDate || !endDate) return 'Pick a date range';

    const format = formatStr.split.date;
    return `${dayjs(startDate).format(format)} - ${dayjs(endDate).format(
      format
    )}`;
  }, [startDate, endDate]);

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
          autoFocus
          mode="range"
          defaultMonth={selectedDateRange?.from}
          selected={selectedDateRange}
          onSelect={handleDateSelect}
          disabled={disabledDays}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerButton;
