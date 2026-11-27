import { CowdBillEstimate, CowdTierRow, SaleTransaction } from '../types';

export const LITERS_PER_CONTAINER = 20;
export const LITERS_PER_CUBIC_METER = 1000;

export const COWD_RATES = {
  MIN_CHARGE_FIRST_10: 349.40,
  TIER_11_TO_20: 30.55,
  TIER_21_TO_30: 31.85,
  TIER_31_TO_40: 33.65,
  TIER_41_AND_ABOVE: 36.00,
} as const;

export function calculateTotalLiters(quantitySold: number): number {
  if (quantitySold <= 0) return 0;
  return quantitySold * LITERS_PER_CONTAINER;
}

export function convertLitersToCubicMeters(totalLiters: number): number {
  if (totalLiters <= 0) return 0;
  return totalLiters / LITERS_PER_CUBIC_METER;
}

/**
 * Calculates the estimated monthly water bill using the Cagayan de Oro City Water District (COWD)
 * 3/4-inch water meter rate schedule.
 */
export function calculateCowdBill(quantitySold: number): CowdBillEstimate {
  const safeQty = Math.max(0, quantitySold);
  const totalLiters = calculateTotalLiters(safeQty);
  const cubicMeters = convertLitersToCubicMeters(totalLiters);

  const tier1Used = Math.min(cubicMeters, 10);
  const tier1Subtotal = safeQty === 0 ? 0 : COWD_RATES.MIN_CHARGE_FIRST_10;

  const tier2Used = Math.max(0, Math.min(cubicMeters, 20) - 10);
  const tier2Subtotal = tier2Used * COWD_RATES.TIER_11_TO_20;

  const tier3Used = Math.max(0, Math.min(cubicMeters, 30) - 20);
  const tier3Subtotal = tier3Used * COWD_RATES.TIER_21_TO_30;

  const tier4Used = Math.max(0, Math.min(cubicMeters, 40) - 30);
  const tier4Subtotal = tier4Used * COWD_RATES.TIER_31_TO_40;

  const tier5Used = Math.max(0, cubicMeters - 40);
  const tier5Subtotal = tier5Used * COWD_RATES.TIER_41_AND_ABOVE;

  const totalBill =
    tier1Subtotal + tier2Subtotal + tier3Subtotal + tier4Subtotal + tier5Subtotal;

  let currentBracket = '0–10 m³ (Minimum Charge)';
  if (cubicMeters > 40) {
    currentBracket = '41 m³ and above';
  } else if (cubicMeters > 30) {
    currentBracket = '31–40 m³';
  } else if (cubicMeters > 20) {
    currentBracket = '21–30 m³';
  } else if (cubicMeters > 10) {
    currentBracket = '11–20 m³';
  }

  const tiers: CowdTierRow[] = [
    {
      bracketLabel: 'First 10 m³',
      rangeDescription: '0 – 10 m³',
      rateLabel: '₱349.40 minimum',
      cubicMetersInBracket: tier1Used,
      subtotal: tier1Subtotal,
      isActive: safeQty > 0,
    },
    {
      bracketLabel: 'Tier 2',
      rangeDescription: '11 – 20 m³',
      rateLabel: '₱30.55 / m³',
      cubicMetersInBracket: tier2Used,
      subtotal: tier2Subtotal,
      isActive: tier2Used > 0,
    },
    {
      bracketLabel: 'Tier 3',
      rangeDescription: '21 – 30 m³',
      rateLabel: '₱31.85 / m³',
      cubicMetersInBracket: tier3Used,
      subtotal: tier3Subtotal,
      isActive: tier3Used > 0,
    },
    {
      bracketLabel: 'Tier 4',
      rangeDescription: '31 – 40 m³',
      rateLabel: '₱33.65 / m³',
      cubicMetersInBracket: tier4Used,
      subtotal: tier4Subtotal,
      isActive: tier4Used > 0,
    },
    {
      bracketLabel: 'Tier 5',
      rangeDescription: '41 m³ and above',
      rateLabel: '₱36.00 / m³',
      cubicMetersInBracket: tier5Used,
      subtotal: tier5Subtotal,
      isActive: tier5Used > 0,
    },
  ];

  return {
    totalContainers: safeQty,
    totalLiters,
    cubicMeters,
    totalBill,
    effectiveRatePerCubicMeter: cubicMeters > 0 ? totalBill / cubicMeters : 0,
    currentBracket,
    tiers,
  };
}

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function exportTransactionsToCsv(
  transactions: SaleTransaction[],
  filename: string
): void {
  const headers = [
    'Receipt No.',
    'Date',
    'Time',
    'Customer / Note',
    'Water Type',
    'Container Type',
    'Quantity (20L)',
    'Liters',
    'Unit Price (PHP)',
    'Total Amount (PHP)',
    'Payment Method',
    'Recorded By',
  ];

  const rows = transactions.map((t) => [
    t.receiptNo,
    t.date,
    t.time,
    `"${t.customerName.replace(/"/g, '""')}"`,
    t.waterType,
    t.containerType,
    t.quantity.toString(),
    t.liters.toString(),
    t.unitPrice.toFixed(2),
    t.totalAmount.toFixed(2),
    t.paymentMethod,
    t.recordedBy,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
