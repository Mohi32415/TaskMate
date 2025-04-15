import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  textClassName?: string;
}

export function ProgressRing({
  value,
  max,
  size = 48,
  strokeWidth = 4,
  className,
  textClassName
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = value / max;
  const strokeDashoffset = circumference - progress * circumference;
  
  // Determine color based on progress
  let progressColor = "text-primary";
  
  if (progress >= 1.5) {
    progressColor = "text-emerald-500";
  } else if (progress >= 1) {
    progressColor = "text-primary";
  } else if (progress >= 0.75) {
    progressColor = "text-blue-500";
  } else if (progress >= 0.5) {
    progressColor = "text-amber-500";
  } else if (progress >= 0.25) {
    progressColor = "text-orange-500";
  } else {
    progressColor = "text-gray-400";
  }
  
  const percentage = Math.round(progress * 100);
  
  return (
    <div className="relative">
      <svg
        className={cn("transform -rotate-90", className)}
        width={size}
        height={size}
      >
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className={cn("absolute inset-0 flex items-center justify-center text-sm font-medium", textClassName)}>
        {percentage}%
      </div>
    </div>
  );
}
