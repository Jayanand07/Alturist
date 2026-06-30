"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getIcon = () => {
    if (!mounted) return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
    if (theme === "light") return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    if (theme === "dark") return <Moon className="h-[1.2rem] w-[1.2rem]" />;
    return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
  };

  const getLabel = () => {
    if (!mounted) return "Theme";
    if (theme === "light") return "Light theme";
    if (theme === "dark") return "Dark theme";
    return "System theme";
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
      <span className="sr-only">{getLabel()}</span>
    </Button>
  );
}