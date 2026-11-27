import React, { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  ActiveView,
  ContainerType,
  SaleTransaction,
  WaterType,
} from '../types';
import { CURRENT_MONTH_PREFIX, TODAY_DATE, getRecentDateRange } from '../data/initialData.ts';
import {
  calculateCowdBill,
  calculateTotalLiters,
  convertLitersToCubicMeters,
  formatNumber,
  formatPHP,
} from '../utils/waterCalculations';

interface OverviewViewProps {
  transactions: SaleTransaction[];
  onNavigate: (view: ActiveView) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  transactions,
  onNavigate,
}) => {
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  const todayStats = useMemo(() => {
    const todayTx = transactions.filter((t) => t.date === TODAY_DATE);
    const revenue = todayTx.reduce((acc, t) => acc + t.totalAmount, 0);
    const containers = todayTx.reduce((acc, t) => acc + t.quantity, 0);
    const round = todayTx
      .filter((t) => t.containerType === ContainerType.ROUND_20L)
      .reduce((acc, t) => acc + t.quantity, 0);
    const slim = todayTx
      .filter((t) => t.containerType === ContainerType.SLIM_20L)
      .reduce((acc, t) => acc + t.quantity, 0);
    const purified = todayTx
      .filter((t) => t.waterType === WaterType.PURIFIED)
      .reduce((acc, t) => acc + t.quantity, 0);
    const alkaline = todayTx
      .filter((t) => t.waterType === WaterType.ALKALINE)
      .reduce((acc, t) => acc + t.quantity, 0);
    const liters = calculateTotalLiters(containers);

    return { revenue, containers, round, slim, purified, alkaline, liters, count: todayTx.length };
  }, [transactions]);

  const monthlyEstimate = useMemo(() => {
    const monthTx = transactions.filter((t) => t.date.startsWith(CURRENT_MONTH_PREFIX));
    const containers = monthTx.reduce((acc, t) => acc + t.quantity, 0);
    const revenue = monthTx.reduce((acc, t) => acc + t.totalAmount, 0);
    const bill = calculateCowdBill(containers);
    return { revenue, bill };
  }, [transactions]);

  const last7Days = useMemo(() => {
    const dates = getRecentDateRange(7);
    return dates.map((d) => {
      const dayTx = transactions.filter((t) => t.date === d);
      const purifiedQty = dayTx
        .filter((t) => t.waterType === WaterType.PURIFIED)
        .reduce((sum, t) => sum + t.quantity, 0);
      const alkalineQty = dayTx
        .filter((t) => t.waterType === WaterType.ALKALINE)
        .reduce((sum, t) => sum + t.quantity, 0);
      const totalQty = purifiedQty + alkalineQty;
      const totalRevenue = dayTx.reduce((sum, t) => sum + t.totalAmount, 0);
      const shortLabel = d.slice(5); // MM-DD
      return {
        date: d,
        label: shortLabel,
        purifiedQty,
        alkalineQty,
        totalQty,
        totalRevenue,
        liters: calculateTotalLiters(totalQty),
      };
    });
  }, [transactions]);

  const maxDailyQty = useMemo(
    () => Math.max(80, ...last7Days.map((d) => d.totalQty)),
    [last7Days]
  );

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
        .slice(0, 6),
    [transactions]
  );

  const activeDay = hoveredDayIndex !== null ? last7Days[hoveredDayIndex] : last7Days[last7Days.length - 1];

  return (
    <div className="space-y-6">
      {/* KPI Strip: 4-column summary */}
      <section aria-label="Key station metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D4E6FA] rounded-2xl p-5">
          <p className="text-[13px] font-medium text-[#52779E]">Today&apos;s Sales ({TODAY_DATE})</p>
          <p className="mt-2 font-mono tabular-nums text-[28px] font-bold tracking-tight text-[#0F2942]">
            {formatPHP(todayStats.revenue)}
          </p>
          <p className="mt-2 text-[12px] text-[#5B7FA4] flex items-center gap-1.5">
            <span className="tabular-nums">{todayStats.count} transactions</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Month: {formatPHP(monthlyEstimate.revenue)}</span>
          </p>
        </div>

        <div className="bg-white border border-[#D4E6FA] rounded-2xl p-5">
          <p className="text-[13px] font-medium text-[#52779E]">20L Containers Today</p>
          <p className="mt-2 font-mono tabular-nums text-[28px] font-bold tracking-tight text-[#0F2942]">
            {formatNumber(todayStats.containers)}
          </p>
          <p className="mt-2 text-[12px] text-[#5B7FA4] flex items-center gap-1.5">
            <span className="tabular-nums">{todayStats.round} Round</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{todayStats.slim} Slim</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{formatNumber(todayStats.liters)} L</span>
          </p>
        </div>

        <div className="bg-white border border-[#D4E6FA] rounded-2xl p-5">
          <p className="text-[13px] font-medium text-[#52779E]">Est. Monthly Water Volume</p>
          <p className="mt-2 font-mono tabular-nums text-[28px] font-bold tracking-tight text-[#0F2942]">
            {formatNumber(monthlyEstimate.bill.cubicMeters, 2)}{' '}
            <span className="text-[18px] font-semibold text-[#4B79A8]">m³</span>
          </p>
          <p className="mt-2 text-[12px] text-[#5B7FA4] flex items-center gap-1.5">
            <span className="tabular-nums">
              {formatNumber(monthlyEstimate.bill.totalLiters)} L
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {formatNumber(monthlyEstimate.bill.totalContainers)} containers
            </span>
          </p>
        </div>

        <div className="bg-white border border-[#D4E6FA] rounded-2xl p-5">
          <p className="text-[13px] font-medium text-[#52779E]">Est. COWD Monthly Bill</p>
          <p className="mt-2 font-mono tabular-nums text-[28px] font-bold tracking-tight text-[#0E6993]">
            {formatPHP(monthlyEstimate.bill.totalBill)}
          </p>
          <p className="mt-2 text-[12px] text-[#5B7FA4] flex items-center gap-1.5">
            <span>3/4&quot; Meter</span>
            <span aria-hidden="true">·</span>
            <span>{monthlyEstimate.bill.currentBracket}</span>
          </p>
        </div>
      </section>

      {/* Main 2-column analytics section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 7-Day Purified vs Alkaline Volume Chart */}
        <div className="lg:col-span-7 bg-white border border-[#D4E6FA] rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-[18px] text-[#0F2942]">
                7-Day Container Sales Breakdown
              </h2>
              <p className="text-[13px] text-[#5B7FA4] mt-0.5">
                Daily 20-liter containers sold split by Purified and Alkaline water
              </p>
            </div>
            <div className="flex items-center gap-4 text-[12px] font-medium text-[#3A5978]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#64A2EB]" aria-hidden="true" />
                Purified
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#14CFF0]" aria-hidden="true" />
                Alkaline
              </span>
            </div>
          </div>

          {/* Interactive SVG Stacked Bar Chart */}
          <div className="mt-6">
            <div className="flex items-end justify-between gap-2 sm:gap-4 h-52 pt-4 pb-2 border-b border-[#E5EFFB]">
              {last7Days.map((day, idx) => {
                const purifiedPct = (day.purifiedQty / maxDailyQty) * 100;
                const alkalinePct = (day.alkalineQty / maxDailyQty) * 100;
                const isSelected = activeDay.date === day.date;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onMouseEnter={() => setHoveredDayIndex(idx)}
                    onFocus={() => setHoveredDayIndex(idx)}
                    onClick={() => setHoveredDayIndex(idx)}
                    className="flex-1 h-full flex flex-col items-center justify-end gap-1.5 group cursor-pointer focus:outline-none"
                    aria-label={`${day.date}: ${day.totalQty} containers`}
                  >
                    <span className="font-mono tabular-nums text-[11px] font-semibold text-[#476A8F] group-hover:text-[#0F2942]">
                      {day.totalQty}
                    </span>
                    <div
                      className={`w-full max-w-[44px] h-[148px] flex flex-col justify-end rounded-t-lg overflow-hidden transition-opacity ${
                        isSelected ? 'ring-2 ring-[#0E5AA7]/35 ring-offset-2' : 'opacity-90 group-hover:opacity-100'
                      }`}
                    >
                      {day.alkalineQty > 0 && (
                        <div
                          style={{ height: `${Math.max(4, alkalinePct)}%` }}
                          className="w-full bg-[#14CFF0] transition-all duration-200"
                        />
                      )}
                      {day.purifiedQty > 0 && (
                        <div
                          style={{ height: `${Math.max(4, purifiedPct)}%` }}
                          className="w-full bg-[#64A2EB] transition-all duration-200"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 sm:gap-4 pt-2">
              {last7Days.map((day) => (
                <div
                  key={day.date}
                  className="flex-1 text-center font-mono tabular-nums text-[11px] text-[#5B7FA4]"
                >
                  {day.label}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Day Inline Readout */}
          <div className="mt-5 pt-4 border-t border-[#E5EFFB] flex flex-wrap items-center justify-between gap-3 text-[13px]">
            <div className="flex flex-wrap items-center gap-2 text-[#3A5978]">
              <span className="font-semibold text-[#0F2942] font-mono tabular-nums">
                {activeDay.date}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Purified: {activeDay.purifiedQty}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Alkaline: {activeDay.alkalineQty}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {formatNumber(activeDay.liters)} L ({convertLitersToCubicMeters(activeDay.liters).toFixed(2)} m³)
              </span>
            </div>
            <span className="font-mono tabular-nums font-bold text-[#0F2942]">
              {formatPHP(activeDay.totalRevenue)}
            </span>
          </div>
        </div>

        {/* COWD Monthly Bill Summary Card */}
        <div className="lg:col-span-5 bg-white border border-[#D4E6FA] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-[18px] text-[#0F2942]">
                  COWD Meter Estimate
                </h2>
                <p className="text-[13px] text-[#5B7FA4] mt-0.5">
                  3/4-inch meter tiered billing from sold containers
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('water-bill')}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#0E6993] hover:text-[#0F2942] cursor-pointer whitespace-nowrap"
              >
                <span>Calculator</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-[#F4F9FF] border border-[#DFECFC]">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12px] font-medium text-[#52779E]">
                  Formula Output ({CURRENT_MONTH_PREFIX})
                </span>
                <span className="font-mono tabular-nums text-[12px] text-[#52779E]">
                  {formatNumber(monthlyEstimate.bill.totalContainers)} × 20L ÷ 1,000
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-4">
                <span className="font-mono tabular-nums text-[24px] font-bold text-[#0F2942]">
                  {formatNumber(monthlyEstimate.bill.cubicMeters, 2)} m³
                </span>
                <span className="font-mono tabular-nums text-[22px] font-bold text-[#0E6993]">
                  {formatPHP(monthlyEstimate.bill.totalBill)}
                </span>
              </div>
            </div>

            <div className="mt-4 divide-y divide-[#EDF4FC]">
              {monthlyEstimate.bill.tiers.map((tier) => (
                <div
                  key={tier.rangeDescription}
                  className="py-2.5 flex items-center justify-between text-[13px]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        tier.isActive ? 'text-[#0F2942]' : 'text-[#89A3BF]'
                      }`}
                    >
                      {tier.rangeDescription}
                    </span>
                    <span className="text-[12px] text-[#7B97B5] font-mono tabular-nums">
                      ({tier.rateLabel})
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-mono tabular-nums">
                    <span className="text-[12px] text-[#5B7FA4]">
                      {tier.cubicMetersInBracket.toFixed(2)} m³
                    </span>
                    <span
                      className={`w-20 text-right font-semibold ${
                        tier.isActive ? 'text-[#0F2942]' : 'text-[#A0B6CE]'
                      }`}
                    >
                      {formatPHP(tier.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-[12px] leading-relaxed text-[#5B7FA4]">
            Represents lower-bound consumption based on sold 20L containers leaving the station.
          </p>
        </div>
      </section>

      {/* Recent Transactions Table */}
      <section className="bg-white border border-[#D4E6FA] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5EFFB] flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-[17px] text-[#0F2942]">
              Recent Sales Transactions
            </h2>
            <p className="text-[12px] text-[#5B7FA4]">
              Latest purified and alkaline 20L refills recorded at PureFlow 360
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('sales-reports')}
            className="text-[13px] font-semibold text-[#0E6993] hover:text-[#0F2942] cursor-pointer whitespace-nowrap"
          >
            Full Sales Report
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="font-display font-bold text-[16px] text-[#0F2942]">
              No sales transactions recorded yet
            </p>
            <p className="text-[13px] text-[#5B7FA4] max-w-md mx-auto">
              Record a purified or alkaline water refill transaction to populate daily sales, container counts, and COWD meter estimates.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onNavigate('record-sale')}
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-[#14CFF0] hover:bg-[#0EC0E0] text-white font-display font-bold text-[13px] tracking-wide cursor-pointer"
              >
                Record First Sale
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6FAFF] border-b border-[#E5EFFB] text-[12px] font-semibold text-[#52779E]">
                  <th className="py-3 px-6 whitespace-nowrap">Receipt</th>
                  <th className="py-3 px-4 whitespace-nowrap">Date &amp; Time</th>
                  <th className="py-3 px-4 whitespace-nowrap">Customer / Note</th>
                  <th className="py-3 px-4 whitespace-nowrap">Water &amp; Container</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Qty</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Liters</th>
                  <th className="py-3 px-6 text-right whitespace-nowrap">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF4FC] text-[13px]">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F8FBFF] transition-colors">
                    <td className="py-3 px-6 font-mono tabular-nums font-medium text-[#0F2942] whitespace-nowrap">
                      {tx.receiptNo}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-[#52779E] whitespace-nowrap">
                      {tx.date} · {tx.time}
                    </td>
                    <td className="py-3 px-4 text-[#1E3B5A] max-w-[220px] truncate">
                      {tx.customerName}
                    </td>
                    <td className="py-3 px-4 text-[#335577] whitespace-nowrap">
                      {tx.waterType} · {tx.containerType}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-[#0F2942] whitespace-nowrap">
                      {tx.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#52779E] whitespace-nowrap">
                      {formatNumber(tx.liters)} L
                    </td>
                    <td className="py-3 px-6 text-right font-mono tabular-nums font-bold text-[#0F2942] whitespace-nowrap">
                      {formatPHP(tx.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
