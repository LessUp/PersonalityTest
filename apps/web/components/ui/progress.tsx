import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "gradient";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, size = "md", variant = "default", ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizeClasses = {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-4",
    };

    const variantClasses = {
      default: "bg-indigo-600",
      success: "bg-green-500",
      warning: "bg-amber-500",
      gradient: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
    };

    return (
      <div className="w-full">
        {showLabel && (
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">进度</span>
            <span className="font-medium text-gray-900 dark:text-white">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          className={cn(
            "w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

// Step progress for multi-step forms
interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

function StepProgress({ currentStep, totalSteps, labels }: StepProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {[...Array(totalSteps)].map((_, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  index < currentStep
                    ? "bg-indigo-600 text-white"
                    : index === currentStep
                    ? "bg-indigo-100 text-indigo-600 border-2 border-indigo-600"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                )}
              >
                {index < currentStep ? "✓" : index + 1}
              </div>
              {labels && labels[index] && (
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {labels[index]}
                </span>
              )}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-colors",
                  index < currentStep ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export { Progress, StepProgress };
