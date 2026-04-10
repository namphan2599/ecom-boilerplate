import { formatCurrency } from '@/lib/utils';

export function PriceBadge({
  amount,
  currencyCode,
  compareAtAmount,
}: {
  amount: number;
  currencyCode: string;
  compareAtAmount?: number | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-semibold text-slate-950">
        {formatCurrency(amount, currencyCode)}
      </span>
      {compareAtAmount ? (
        <span className="text-sm text-slate-500 line-through">
          {formatCurrency(compareAtAmount, currencyCode)}
        </span>
      ) : null}
    </div>
  );
}
