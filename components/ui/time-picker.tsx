"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface TimePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function TimePicker({ value, onChange, placeholder = "Select time" }: TimePickerProps) {
    const [open, setOpen] = useState(false);

    // Parse the time value (HH:mm format in 24-hour)
    const parse24Hour = (time: string) => {
        if (!time) return { hours: '', minutes: '', period: 'AM' };
        const [h, m] = time.split(':');
        const hour24 = parseInt(h);
        const hours = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        return { hours: hours.toString(), minutes: m, period };
    };

    const convert24Hour = (hours: string, minutes: string, period: string) => {
        let hour24 = parseInt(hours) || 0;
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;
        return `${hour24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    const getDisplayTime = () => {
        if (!value) return placeholder;
        const { hours, minutes, period } = parse24Hour(value);
        return `${hours}:${minutes} ${period}`;
    };

    const { hours, minutes, period } = parse24Hour(value);

    const handleHourChange = (newHour: string) => {
        const h = Math.min(Math.max(parseInt(newHour) || 0, 1), 12);
        const newTime = convert24Hour(h.toString(), minutes || '00', period);
        onChange(newTime);
    };

    const handleMinuteChange = (newMinute: string) => {
        const m = Math.min(Math.max(parseInt(newMinute) || 0, 0), 59);
        const newTime = convert24Hour(hours || '12', m.toString().padStart(2, '0'), period);
        onChange(newTime);
    };

    const handlePeriodChange = (newPeriod: string) => {
        const newTime = convert24Hour(hours || '12', minutes || '00', newPeriod);
        onChange(newTime);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                >
                    <Clock className="mr-2 h-4 w-4" />
                    {getDisplayTime()}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <label className="text-xs font-medium text-muted-foreground">Hours</label>
                        <Input
                            type="number"
                            min="1"
                            max="12"
                            value={hours}
                            onChange={(e) => handleHourChange(e.target.value)}
                            className="w-16 text-center text-lg font-semibold"
                            placeholder="12"
                        />
                    </div>
                    <span className="text-2xl font-bold mt-5">:</span>
                    <div className="flex flex-col items-center gap-1">
                        <label className="text-xs font-medium text-muted-foreground">Minutes</label>
                        <Input
                            type="number"
                            min="0"
                            max="59"
                            value={minutes}
                            onChange={(e) => handleMinuteChange(e.target.value)}
                            className="w-16 text-center text-lg font-semibold"
                            placeholder="00"
                        />
                    </div>
                    <div className="flex flex-col items-center gap-1 ml-2">
                        <label className="text-xs font-medium text-muted-foreground">Period</label>
                        <Select value={period} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
