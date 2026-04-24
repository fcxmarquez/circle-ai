"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { MarkdownComponents } from "./MarkdownComponents";

interface ThinkingBlockProps {
  thinking?: string;
  status?: "pending" | "success" | "error" | undefined;
}

export function ThinkingBlock({ thinking, status }: ThinkingBlockProps) {
  const isThinking = status === "pending";

  return (
    <Collapsible defaultOpen={false} className="not-prose mb-3 text-muted-foreground">
      <CollapsibleTrigger
        type="button"
        className={cn(
          "group inline-flex items-center gap-1.5 py-1 text-left text-muted-foreground text-sm",
          "hover:text-foreground"
        )}
      >
        {isThinking ? (
          <motion.span
            className="bg-[linear-gradient(110deg,var(--muted-foreground)_0%,var(--muted-foreground)_35%,var(--foreground)_50%,var(--muted-foreground)_65%,var(--muted-foreground)_100%)] bg-[length:220%_100%] bg-clip-text text-transparent"
            initial={{ backgroundPosition: "220% 0" }}
            animate={{ backgroundPosition: "-220% 0" }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 0.25,
            }}
          >
            Thinking
          </motion.span>
        ) : (
          <span>Thought</span>
        )}
        <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 border-muted border-l pl-3 text-muted-foreground text-sm">
        <motion.div
          key={thinking?.length}
          initial={{ opacity: 0.7, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground [&_*]:text-muted-foreground"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
            {thinking}
          </ReactMarkdown>
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}
