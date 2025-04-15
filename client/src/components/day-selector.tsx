import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/use-language";

interface DaySelectorProps {
  schedule: "daily" | "custom";
  selectedDays: string[];
  onScheduleChange: (schedule: "daily" | "custom") => void;
  onDaysChange: (days: string[]) => void;
}

export function DaySelector({ 
  schedule, 
  selectedDays, 
  onScheduleChange, 
  onDaysChange 
}: DaySelectorProps) {
  const { t } = useLanguage();
  
  const days = [
    { id: "monday", label: t("day.monday") },
    { id: "tuesday", label: t("day.tuesday") },
    { id: "wednesday", label: t("day.wednesday") },
    { id: "thursday", label: t("day.thursday") },
    { id: "friday", label: t("day.friday") },
    { id: "saturday", label: t("day.saturday") },
    { id: "sunday", label: t("day.sunday") },
  ];

  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      onDaysChange([...selectedDays, day]);
    } else {
      onDaysChange(selectedDays.filter(d => d !== day));
    }
  };

  return (
    <div className="space-y-4">
      <RadioGroup value={schedule} onValueChange={(value) => onScheduleChange(value as "daily" | "custom")}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="daily" id="daily" />
          <Label htmlFor="daily">{t("schedule.daily")}</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="custom" />
          <Label htmlFor="custom">{t("schedule.custom")}</Label>
        </div>
      </RadioGroup>
      
      {schedule === "custom" && (
        <>
          <Separator />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {days.map((day) => (
              <div key={day.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={day.id} 
                  checked={selectedDays.includes(day.id)}
                  onCheckedChange={(checked) => handleDayToggle(day.id, checked as boolean)}
                />
                <Label htmlFor={day.id}>{day.label}</Label>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}