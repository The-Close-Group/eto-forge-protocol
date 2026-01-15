import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'link' | 'compact';
  className?: string;
}

export const ThemeToggle = ({ variant = 'default', className }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  const isCompact = variant === 'compact';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isCompact ? 'ghost' : variant === 'compact' ? 'ghost' : variant}
          size={isCompact ? 'icon' : 'sm'}
          onClick={toggleTheme}
          className={cn(
            "transition-colors duration-200",
            isCompact ? "w-8 h-8 text-muted-foreground hover:bg-muted" : "",
            className
          )}
        >
          {theme === 'dark' ? (
            <Sun className={cn("h-[1.1rem] w-[1.1rem]", isCompact ? "h-4 w-4" : "")} />
          ) : (
            <Moon className={cn("h-[1.1rem] w-[1.1rem]", isCompact ? "h-4 w-4" : "")} />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeToggle;



