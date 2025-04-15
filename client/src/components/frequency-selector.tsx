import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";

interface FrequencySelectorProps {
  control: Control<any>;
  taskType: string;
  schedule: "daily" | "custom";
  disabled?: boolean;
}

export function FrequencySelector({ control, taskType, schedule, disabled }: FrequencySelectorProps) {
  const { t } = useLanguage();
  const isExercise = taskType === "exercise";

  if (!isExercise && taskType !== "study" && schedule === "daily") {
    return null;
  }

  const unitOptions = isExercise 
    ? ["seconds", "minutes", "hours", "reps"]
    : ["seconds", "minutes", "hours", "pages"];

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="unitValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("task.value")}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value))}
                  required={isExercise}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="unitType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("task.unit")}</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("task.selectUnit")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {t(`task.unit.${unit}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
    </>
  );
}