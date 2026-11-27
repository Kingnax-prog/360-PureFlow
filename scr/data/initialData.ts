import { SaleTransaction, StationPricing } from '../types';

export const DEFAULT_PRICING: StationPricing = {
  purifiedRound: 25,
  purifiedSlim: 25,
  alkalineRound: 35,
  alkalineSlim: 35,
};

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const TODAY_DATE = formatLocalDate(new Date());
export const CURRENT_MONTH_PREFIX = TODAY_DATE.slice(0, 7);

export function getRecentDateRange(days = 7): string[] {
  const base = new Date();
  const result: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    result.push(formatLocalDate(d));
  }
  return result;
}

// Empty by default so backend/database records populate live station data
export const INITIAL_TRANSACTIONS: SaleTransaction[] = [];
