import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === DropdownMenuTrigger) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onClick: () => setIsOpen(!isOpen)
            });
          }
          if (child.type === DropdownMenuContent) {
            return isOpen ? React.cloneElement(child as React.ReactElement<any>, {
              onItemClick: () => setIsOpen(false)
            }) : null;
          }
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps & { onClick?: () => void }> = ({ 
  asChild, 
  children, 
  onClick 
}) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.();
        children.props.onClick?.(e);
      }
    });
  }
  
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
};

const DropdownMenuContent: React.FC<DropdownMenuContentProps & { onItemClick?: () => void }> = ({ 
  align = 'end', 
  children, 
  className,
  onItemClick 
}) => {
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  };

  return (
    <div className={cn(
      "absolute top-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md",
      alignmentClasses[align],
      className
    )}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DropdownMenuItem) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onItemClick
          });
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuItem: React.FC<DropdownMenuItemProps & { onItemClick?: () => void }> = ({ 
  onClick, 
  children, 
  className,
  onItemClick 
}) => {
  const handleClick = () => {
    onClick?.();
    onItemClick?.();
  };

  return (
    <button
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}
