import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-2xl border border-[#e0e0e0] bg-white px-4 py-3 text-sm text-[#1d1d1f] outline-none transition-colors placeholder:text-[#86868b] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}