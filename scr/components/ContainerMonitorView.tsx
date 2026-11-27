import React, { useMemo, useState } from 'react';
import { ContainerType, SaleTransaction, WaterType } from '../types';
import { CURRENT_MONTH_PREFIX, TODAY_DATE } from '../data/initialData';
import {
  calculateTotalLiters,
  convertLitersToCubicMeters,
  formatNumber,
  formatPHP,
} from '../utils/waterCalculations';

interface ContainerMonitorViewProps {
  transactions: SaleTransaction[];
}

interface DailyContainerRow {
  date: string;
  roundPurified: number;
  roundAlkaline: number;
  slimPurified: number;
  slimAlkaline: number;
  totalRound: number;
  totalSlim: number;
  totalContainers: number;
  liters: number;
  revenue: number;
}

export const ContainerMonitorView: React.FC<ContainerMonitorViewProps> = ({
  transactions,
}) => {
  const [selectedScope, setSelectedScope] = useState<'today' | 'month'>('month');

  const scopedTransactions = useMemo(() => {
    if (selectedScope === 'today') {
      return transactions.filter((t) => t.date === TODAY_DATE);
    }
    return transactions.filter((t) => t.date.startsWith(CURRENT_MONTH_PREFIX));
  }, [transactions, selectedScope]);

  const totals = useMemo(() => {
    let roundPurified = 0;
    let roundAlkaline = 0;
    let slimPurified = 0;
    let slimAlkaline = 0;

    for (const tx of scopedTransactions) {
      if (tx.containerType === ContainerType.ROUND_20L) {
        if (tx.waterType === WaterType.PURIFIED) roundPurified += tx.quantity;
        else roundAlkaline += tx.quantity;
      } else {
        if (tx.waterType === WaterType.PURIFIED) slimPurified += tx.quantity;
        else slimAlkaline += tx.quantity;
      }
    }

    const totalRound = roundPurified + roundAlkaline;
    const totalSlim = slimPurified + slimAlkaline;
    const total = totalRound + totalSlim;
    const roundPct = total > 0 ? (totalRound / total) * 100 : 0;
    const slimPct = total > 0 ? (totalSlim / total) * 100 : 0;

    return {
      roundPurified,
      roundAlkaline,
      slimPurified,
      slimAlkaline,
      totalRound,
      totalSlim,
      total,
      roundPct,
      slimPct,
      liters: calculateTotalLiters(total),
    };
  }, [scopedTransactions]);

  const dailyBreakdown = useMemo<DailyContainerRow[]>(() => {
    const map = new Map<string, DailyContainerRow>();

    for (const tx of transactions) {
      const existing = map.get(tx.date) ?? {
        date: tx.date,
        roundPurified: 0,
        roundAlkaline: 0,
        slimPurified: 0,
        slimAlkaline: 0,
        totalRound: 0,
        totalSlim: 0,
        totalContainers: 0,
        liters: 0,
        revenue: 0,
      };

      if (tx.containerType === ContainerType.ROUND_20L) {
        if (tx.waterType === WaterType.PURIFIED) existing.roundPurified += tx.quantity;
        else existing.roundAlkaline += tx.quantity;
        existing.totalRound += tx.quantity;
      } else {
        if (tx.waterType === WaterType.PURIFIED) existing.slimPurified += tx.quantity;
        else existing.slimAlkaline += tx.quantity;
        existing.totalSlim += tx.quantity;
      }

      existing.totalContainers += tx.quantity;
      existing.liters += tx.liters;
      existing.revenue += tx.totalAmount;
      map.set(tx.date, existing);
    }

    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Scope Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[14px] text-[#52779E]">
            Tracking exclusively 20-liter Round and 20-liter Slim water containers sold
          </p>
        </div>

        <div className="inline-flex items-center p-1 rounded-xl bg-white border border-[#D4E6FA]">
          <button
            type="button"
            onClick={() => setSelectedScope('today')}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              selectedScope === 'today'
                ? 'bg-[#64A2EB] text-white'
                : 'text-[#52779E] hover:text-[#0F2942]'
            }`}
          >
            Today ({TODAY_DATE})
          </button>
          <button
            type="button"
            onClick={() => setSelectedScope('month')}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              selectedScope === 'month'
                ? 'bg-[#64A2EB] text-white'
                : 'text-[#52779E] hover:text-[#0F2942]'
            }`}
          >
            This Month ({CURRENT_MONTH_PREFIX})
          </button>
        </div>
      </div>

      {/* Round vs Slim Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#D4E6FA] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-[16px] text-[#0F2942]">
              20L Round Containers
            </h2>
            <span className="font-mono tabular-nums text-[12px] font-semibold text-[#52779E]">
              {totals.roundPct.toFixed(1)}%
            </span>
          </div>
          <p className="mt-3 font-mono tabular-nums text-[32px] font-bold text-[#0F2942]">
            {formatNumber(totals.totalRound)}
          </p>
          <div className="mt-3 pt-3 border-t border-[#EDF4FC] flex justify-between text-[13px] text-[#52779E]">
            <span className="tabular-nums">Purified: {formatNumber(totals.roundPurified)}</span>
            <span className="tabular-nums">Alkaline: {formatNumber(totals.roundAlkaline)}</span>
          </div>
        </div>

        <div className="bg-white border border-[#D4E6FA] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-[16px] text-[#0F2942]">
              20L Slim Containers
            </h2>
            <span className="font-mono tabular-nums text-[12px] font-semibold text-[#0E6993]">
              {totals.slimPct.toFixed(1)}%
            </span>
          </div>
          <p className="mt-3 font-mono tabular-nums text-[32px] font-bold text-[#0E6993]">
            {formatNumber(totals.totalSlim)}
          </p>
          <div className="mt-3 pt-3 border-t border-[#EDF4FC] flex justify-between text-[13px] text-[#52779E]">
            <span className="tabular-nums">Purified: {formatNumber(totals.slimPurified)}</span>
            <span className="tabular-nums">Alkaline: {formatNumber(totals.slimAlkaline)}</span>
          </div>
        </div>

        <div className="bg-white border border-[#D4E6FA] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-[16px] text-[#0F2942]">
              Combined 20L Output
            </h2>
            <span className="font-mono tabular-nums text-[12px] font-semibold text-[#52779E]">
              {convertLitersToCubicMeters(totals.liters).toFixed(2)} m³
            </span>
          </div>
          <p className="mt-3 font-mono tabular-nums text-[32px] font-bold text-[#0F2942]">
            {formatNumber(totals.total)}
          </p>
          <div className="mt-3 pt-3 border-t border-[#EDF4FC] flex justify-between text-[13px] text-[#52779E]">
            <span>Est. Volume</span>
            <span className="font-mono tabular-nums font-semibold text-[#0F2942]">
              {formatNumber(totals.liters)} Liters
            </span>
          </div>
        </div>
      </div>

      {/* Visual Ratio Bar */}
      <div className="bg-white border border-[#D4E6FA] rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="font-display font-bold text-[16px] text-[#0F2942]">
            Container Style Mix (20L Round vs 20L Slim)
          </h3>
          <div className="flex items-center gap-4 text-[12px] font-medium text-[#3A5978]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#64A2EB]" aria-hidden="true" />
              20L Round ({totals.roundPct.toFixed(1)}%)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#14CFF0]" aria-hidden="true" />
              20L Slim ({totals.slimPct.toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="h-4 w-full rounded-full bg-[#EDF5FF] overflow-hidden flex">
          <div
            style={{ width: `${totals.roundPct}%` }}
            className="h-full bg-[#64A2EB] transition-all duration-300"
          />
          <div
            style={{ width: `${totals.slimPct}%` }}
            className="h-full bg-[#14CFF0] transition-all duration-300"
          />
        </div>
      </div>

      {/* Daily Container Count Table */}
      <div className="bg-white border border-[#D4E6FA] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5EFFB]">
          <h3 className="font-display font-bold text-[17px] text-[#0F2942]">
            Daily Container Ledger
          </h3>
          <p className="text-[12px] text-[#5B7FA4]">
            Daily unit counts by container shape, water grade, and estimated water liters
          </p>
        </div>

        {dailyBreakdown.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="font-display font-bold text-[16px] text-[#0F2942]">
              No container sales recorded yet
            </p>
            <p className="text-[13px] text-[#5B7FA4]">
              Daily 20L round and slim counts will populate here once sales transactions are logged.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6FAFF] border-b border-[#E5EFFB] text-[12px] font-semibold text-[#52779E]">
                  <th className="py-3 px-6 whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Round (Purified)</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Round (Alkaline)</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Slim (Purified)</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Slim (Alkaline)</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Total 20L</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Est. Liters</th>
                  <th className="py-3 px-6 text-right whitespace-nowrap">Daily Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF4FC] text-[13px]">
                {dailyBreakdown.map((row) => (
                  <tr key={row.date} className="hover:bg-[#F8FBFF]">
                    <td className="py-3 px-6 font-mono tabular-nums font-semibold text-[#0F2942] whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#335577]">
                      {row.roundPurified}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#335577]">
                      {row.roundAlkaline}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#335577]">
                      {row.slimPurified}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#335577]">
                      {row.slimAlkaline}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-[#0F2942]">
                      {row.totalContainers}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#0E6993]">
                      {formatNumber(row.liters)} L
                    </td>
                    <td className="py-3 px-6 text-right font-mono tabular-nums font-bold text-[#0F2942]">
                      {formatPHP(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
