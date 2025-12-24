"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

interface SimpleTimePickerProps {
    value: string; // Format: "HH:MM" in 24-hour format
    onChange: (value: string) => void;
    label?: string;
}

export function SimpleTimePicker({ value, onChange, label }: SimpleTimePickerProps) {
    // Convert 24-hour format to 12-hour format with AM/PM
    const parse24Hour = (time: string) => {
        const [hours24, minutes] = time.split(":").map(Number);
        const period = hours24 >= 12 ? "PM" : "AM";
        const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
        return { hours: hours12, minutes, period };
    };

    // Convert 12-hour format to 24-hour format
    const to24Hour = (hours: number, minutes: number, period: string) => {
        let hours24 = hours;
        if (period === "AM" && hours === 12) hours24 = 0;
        if (period === "PM" && hours !== 12) hours24 = hours + 12;
        return `${String(hours24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };

    const parsed = parse24Hour(value);
    const [hours, setHours] = useState(parsed.hours);
    const [minutes, setMinutes] = useState(parsed.minutes);
    const [period, setPeriod] = useState(parsed.period);

    // Update parent when values change
    useEffect(() => {
        const newValue = to24Hour(hours, minutes, period);
        if (newValue !== value) {
            onChange(newValue);
        }
    }, [hours, minutes, period]);

    // Update local state when value prop changes
    useEffect(() => {
        const parsed = parse24Hour(value);
        setHours(parsed.hours);
        setMinutes(parsed.minutes);
        setPeriod(parsed.period);
    }, [value]);

    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = parseInt(e.target.value) || 0;
        if (val < 1) val = 1;
        if (val > 12) val = 12;
        setHours(val);
    };

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = parseInt(e.target.value) || 0;
        if (val < 0) val = 0;
        if (val > 59) val = 59;
        setMinutes(val);
    };

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <div className="flex items-center gap-2">
                {/* Hours */}
                <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground mb-1">Hours</span>
                    <input
                        type="number"
                        min="1"
                        max="12"
                        value={String(hours).padStart(2, "0")}
                        onChange={handleHoursChange}
                        className="w-16 h-12 text-center text-lg font-medium bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground mb-1">Minutes</span>
                    <input
                        type="number"
                        min="0"
                        max="59"
                        value={String(minutes).padStart(2, "0")}
                        onChange={handleMinutesChange}
                        className="w-16 h-12 text-center text-lg font-medium bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Period (AM/PM) */}
                <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground mb-1">Period</span>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as "AM" | "PM")}
                        className="w-20 h-12 text-center text-lg font-medium bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                    >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
