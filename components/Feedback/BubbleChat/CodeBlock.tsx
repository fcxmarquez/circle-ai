"use client";

import { motion } from "motion/react";
import { memo, useState } from "react";
import { HiCheck, HiOutlineClipboard } from "react-icons/hi2";
import { LuArrowRightFromLine, LuWrapText } from "react-icons/lu";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CodeBlockProps {
  language: string;
  children: string;
}

const fadeInAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 },
};

const CodeBlockComponent = ({ language, children }: CodeBlockProps) => {
  const [isWrapped, setIsWrapped] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const toggleWrap = () => {
    setIsWrapped((prev) => !prev);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setIsCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <motion.div
      className="relative my-4 w-full min-w-0 max-w-full overflow-hidden rounded-md"
      {...fadeInAnimation}
    >
      <div className="flex items-center justify-between bg-zinc-800 px-3 py-1.5">
        <span className="text-xs text-zinc-400 select-none">{language}</span>
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 border-zinc-600 bg-transparent hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-md"
                  onClick={toggleWrap}
                >
                  {isWrapped ? (
                    <LuWrapText className="h-4 w-4" />
                  ) : (
                    <LuArrowRightFromLine className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle word wrap</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isWrapped ? "Disable word wrap" : "Enable word wrap"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 border-zinc-600 bg-transparent hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-md"
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <HiCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <HiOutlineClipboard className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy code</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div
        className={`w-full min-w-0 ${
          isWrapped
            ? "overflow-x-hidden"
            : "overflow-x-auto [-webkit-overflow-scrolling:touch]"
        }`}
      >
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            borderRadius: "0 0 0.5rem 0.5rem",
            padding: "1rem",
            margin: 0,
            width: isWrapped ? "100%" : "max-content",
            minWidth: "100%",
            overflow: "visible",
          }}
          PreTag="div"
          wrapLongLines={isWrapped}
          codeTagProps={{
            style: {
              whiteSpace: isWrapped ? "pre-wrap" : "pre",
              wordBreak: isWrapped ? "break-word" : "normal",
            },
          }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    </motion.div>
  );
};

export const CodeBlock = memo(CodeBlockComponent);
