import * as React from "react"
import { cn } from "@/components/ui/Button"

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur px-4 py-3 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-all duration-200 hover:border-blue-200",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
