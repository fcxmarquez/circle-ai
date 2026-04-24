import { Eye, EyeOff } from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InputConfigProps = {
  label: string;
  id: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "password";
};

export const InputConfig: FC<InputConfigProps> = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  type = "text",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="w-24 whitespace-nowrap">
        {label}
      </label>
      <div className="relative max-w-96">
        <Input
          id={id}
          type={type === "password" && !showPassword ? "password" : "text"}
          placeholder={placeholder}
          className="flex-1 pr-10"
          value={value}
          onChange={onChange}
        />
        {type === "password" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={16} aria-hidden="true" />
            ) : (
              <Eye size={16} aria-hidden="true" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        ) : null}
      </div>
    </div>
  );
};
