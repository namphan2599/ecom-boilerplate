import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-[#0066cc] text-white hover:bg-[#0055aa]',
    outline: 'border border-[#e0e0e0] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]',
  };
  
  const sizes = {
    default: 'h-11 px-5 py-3 text-sm',
    sm: 'h-9 px-4 py-2 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}