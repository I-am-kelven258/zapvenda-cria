import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[132px] w-full rounded-xl border border-primary/25 bg-background/80 px-4 py-3 text-base leading-relaxed text-foreground shadow-sm shadow-primary/5 transition-all duration-200 placeholder:text-muted-foreground/75 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
