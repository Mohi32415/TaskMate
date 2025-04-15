import React, { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/hooks/use-language';
import { DaySelector } from './day-selector';
import { FrequencySelector } from './frequency-selector';
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters."
  }),
  description: z.string().optional(),
  categoryId: z.coerce.number(),
  scheduleType: z.enum(["daily", "custom"]).default("daily"),
  unitValue: z.number().optional(),
  unitType: z.string().optional(),
  schedule: z.object({
    monday: z.boolean().default(true),
    tuesday: z.boolean().default(true),
    wednesday: z.boolean().default(true),
    thursday: z.boolean().default(true),
    friday: z.boolean().default(true),
    saturday: z.boolean().default(true),
    sunday: z.boolean().default(true)
  }),
  participantEmail: z.string().email().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface AddChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { id: number; name: string; icon: string }[];
}

export function AddChallengeDialog({ open, onOpenChange, categories }: AddChallengeDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      scheduleType: "daily",
      schedule: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true
      }
    }
  });
  
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/challenges", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("challenge.addSuccess"),
        description: t("challenge.addSuccessDescription"),
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("challenge.addError"),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: FormValues) => {
    // Convert selected days array to schedule object
    if (data.scheduleType === "custom") {
      data.schedule = {
        monday: selectedDays.includes("monday"),
        tuesday: selectedDays.includes("tuesday"),
        wednesday: selectedDays.includes("wednesday"),
        thursday: selectedDays.includes("thursday"),
        friday: selectedDays.includes("friday"),
        saturday: selectedDays.includes("saturday"),
        sunday: selectedDays.includes("sunday")
      };
    } else {
      // For daily, set all days to true
      data.schedule = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true
      };
    }
    
    mutation.mutate(data);
  };
  
  const handleScheduleTypeChange = (value: "daily" | "custom") => {
    form.setValue("scheduleType", value);
    
    // When changing to daily, reset all days to true
    if (value === "daily") {
      setSelectedDays([
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
      ]);
    }
  };
  
  const handleDaysChange = (days: string[]) => {
    setSelectedDays(days);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("challenge.add")}</DialogTitle>
          <DialogDescription>
            {t("challenge.addDescription")}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("challenge.title")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("challenge.description")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("challenge.category")}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("challenge.selectCategory")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="scheduleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("challenge.schedule")}</FormLabel>
                  <FormControl>
                    <DaySelector 
                      schedule={field.value as "daily" | "custom"} 
                      selectedDays={selectedDays}
                      onScheduleChange={handleScheduleTypeChange}
                      onDaysChange={handleDaysChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FrequencySelector 
              control={form.control} 
              taskType="general"
              schedule={form.watch("scheduleType") as "daily" | "custom"}
            />
            
            <FormField
              control={form.control}
              name="participantEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("challenge.inviteEmail")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="friend@example.com" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t("common.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}