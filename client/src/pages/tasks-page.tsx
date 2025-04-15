import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Calendar, BarChart, BookOpen, Dumbbell, Edit, Trash } from "lucide-react";

// Form schema
const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.enum(["Daily", "Exercise", "Study", "Custom"]),
  frequency: z.string().min(3, "Please specify a frequency"),
  notes: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

// Mock task type for demonstration
interface Task {
  id: string;
  title: string;
  type: "Daily" | "Exercise" | "Study" | "Custom";
  frequency: string;
  notes?: string;
  progress: number;
  goal: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Morning Pushups",
      type: "Exercise",
      frequency: "20 pushups/day",
      notes: "Focus on proper form",
      progress: 15,
      goal: 20,
    },
    {
      id: "2",
      title: "Read Programming Book",
      type: "Study",
      frequency: "30 pages/day",
      progress: 30,
      goal: 30,
    },
    {
      id: "3",
      title: "Drink Water",
      type: "Daily",
      frequency: "8 glasses/day",
      progress: 10,
      goal: 8,
    },
  ]);

  const [open, setOpen] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      type: "Daily",
      frequency: "",
      notes: "",
    },
  });

  const onSubmit = (data: TaskFormValues) => {
    // In a real app, we would add this to the database
    const newTask: Task = {
      id: Date.now().toString(),
      title: data.title,
      type: data.type,
      frequency: data.frequency,
      notes: data.notes,
      progress: 0,
      goal: parseInt(data.frequency.split("/")[0]) || 1,
    };

    setTasks([...tasks, newTask]);
    form.reset();
    setOpen(false);
  };

  const incrementProgress = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, progress: task.progress + 1 }
          : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "Daily":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "Exercise":
        return <Dumbbell className="h-5 w-5 text-green-500" />;
      case "Study":
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      default:
        return <BarChart className="h-5 w-5 text-orange-500" />;
    }
  };

  const getProgressMessage = (progress: number, goal: number) => {
    if (progress > goal) {
      return "🔥 Amazing work!";
    } else if (progress === goal) {
      return "✅ Great job, you did it!";
    } else {
      return "📉 Try to do more tomorrow!";
    }
  };

  const getProgressPercentage = (progress: number, goal: number) => {
    return Math.min((progress / goal) * 100, 100);
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to track your daily habits and goals.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Morning Pushups" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a task type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Exercise">Exercise</SelectItem>
                          <SelectItem value="Study">Study</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 10 pushups/day or Read 30 pages"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Specify quantity and frequency (e.g., "20 pushups/day")
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional details..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Save Task</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  {getTaskIcon(task.type)}
                  <CardTitle>{task.title}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{task.frequency}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress: {task.progress}/{task.goal}</span>
                  <span
                    className={
                      task.progress >= task.goal ? "text-green-500" : ""
                    }
                  >
                    {Math.round(getProgressPercentage(task.progress, task.goal))}%
                  </span>
                </div>
                <Progress
                  value={getProgressPercentage(task.progress, task.goal)}
                  className="h-2"
                />
                <p
                  className={`text-sm ${
                    task.progress > task.goal
                      ? "text-green-500"
                      : task.progress === task.goal
                      ? "text-green-500"
                      : "text-amber-500"
                  }`}
                >
                  {getProgressMessage(task.progress, task.goal)}
                </p>
                {task.notes && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {task.notes}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => incrementProgress(task.id)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Update Progress
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
}