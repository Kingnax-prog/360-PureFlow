import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { SaleTransaction } from '../types';
import { CURRENT_MONTH_PREFIX, TODAY_DATE } from '../data/initialData.ts';
import {
  calculateCowdBill,
  calculateTotalLiters,
  convertLitersToCubicMeters,
  formatNumber,
  formatPHP,
} from '../utils/waterCalculations';

interface WaterBillViewProps {
  transactions: SaleTransaction[];
}

export const WaterBillView: React.FC<WaterBillViewProps> = ({ transactions }) => {
  const actualStats = useMemo(() => {
    const todayContainers = transactions
      .filter((t) => t.date === TODAY_DATE)
      .reduce((acc, t) => acc + t.quantity, 0);

    const monthContainers = transactions
      .filter((t) => t.date.startsWith(CURRENT_MONTH_PREFIX))
      .reduce((acc, t) => acc + t.quantity, 0);

    const todayLiters = calculateTotalLiters(todayContainers);
    const todayCubicMeters = convertLitersToCubicMeters(todayLiters);
    const monthlyBill = calculateCowdBill(monthContainers);

    return {
      todayContainers,
      todayLiters,
      todayCubicMeters,
      monthlyBill,
    };
  }, [transactions]);

  const [mode, setMode] = useState<'actual' | 'simulator'>('actual');
  const [simulatedContainers, setSimulatedContainers] = useState<number>(
    actualStats.monthlyBill.totalContainers
  );

  const activeEstimate = useMemo(() => {
    if (mode === 'actual') {
      return actualStats.monthlyBill;
    }
    return calculateCowdBill(simulatedContainers);
  }, [mode, actualStats.monthlyBill, simulatedContainers]);

  return (
    <div className="space-y-6">
      {/* Mode Toggle + Formula Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-[13px] text-[#52779E] flex flex-wrap items-center gap-2">
          <span>Formulas:</span>
          <span className="font-mono tabular-nums font-semibold text-[#0F2942]">
            Total Liters = Qty × 20 L
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums font-semibold text-[#0F2942]">
            Cubic Meters (m³) = Total Liters ÷ 1,000
          </span>
        </div>

        <div className="inline-flex items-center p-1 rounded-xl bg-white border border-[#D4E6FA]">
          <button
            type="button"
            onClick={() => setMode('actual')}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'actual'
                ? 'bg-[#64A2EB] text-white'
                : 'text-[#52779E] hover:text-[#0F2942]'
            }`}
          >
            Recorded Monthly Sales
          </button>
          <button
            type="button"
            onClick={() => {
              setSimulatedContainers(actualStats.monthlyBill.totalContainers);
              setMode('simulator');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'simulator'
                ? 'bg-[#64A2EB] text-white'
                : 'text-[#52779E] hover:text-[#0F2942]'
            }`}
          >
            Rate Simulator
          </button>
        </div>
      </div>

      {/* Simulator Control Bar when active */}
      {mode === 'simulator' && (
        <div className="bg-white border border-[#A5DBF3] rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-[17px] text-[#0F2942]">
                Monthly Volume &amp; COWD Rate Simulator
              </h2>
              <p className="text-[13px] text-[#5B7FA4]">
                Adjust projected monthly 20L containers sold to preview COWD bracket charges
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sim-containers" className="text-[13px] font-medium text-[#52779E]">
                Containers:
              </label>
              <input
                id="sim-containers"
                type="number"
                min={0}
                max={10000}
                value={simulatedContainers}
                onChange={(e) =>
                  setSimulatedContainers(Math.max(0, Number(e.target.value) || 0))
                }
                className="w-28 h-10 px-3 rounded-xl border border-[#C3DCF8] font-mono tabular-nums font-bold text-[15px] text-[#0F2942] text-right"
              />
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={3500}
            step={25}
            value={Math.min(3500, simulatedContainers)}
            onChange={(e) => setSimulatedContainers(Number(e.target.value))}
            aria-label="Simulated monthly 20L containers sold"
            className="w-full accent-[#14CFF0] cursor-pointer"
          />

          <div className="flex justify-between text-[11px] font-mono tabular-nums text-[#6A8CAE]">
            <span>0 (0 m³)</span>
            <span>500 (10 m³)</span>
            <span>1,000 (20 m³)</span>
            <span>1,500 (30 m³)</span>
            <span>2,000 (40 m³)</span>
            <span>3,500 (70 m³)</span>
          </div>
        </div>
      )}

      {/* Consumption & Bill Headline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D4E6FA] rounded-2xl p-5">
          <p className="text-[13px] font-medium text-[#52779E]">Today&apos;s Est. Consumption</p>
          <p className="mt-2 font-mono tabular-nums text-[26px] font-bold text-[#0F2942]">
            {formatNumber(actualStats.todayLiters)} L
          </p>
          <p className="mt-1.5 text-[12px] text-[#5B7FA4] font-mono tabular-nums">
            {actualStats.todayContainers} containers · {actualStats.todayCubicMeters.toFixed(2)} m³
          </p>
        </div>

        <div className="bg-white border border-[#D4E6FA] rounded-2xl p-5">
          <p className="text-[13px] font-medium text-[#52779E]">
            {mode === 'actual' ? 'Monthly Total Liters' : 'Simulated Total Liters'}
          </p>
          <p className="mt-2 font-mono tabular-nums text-[26px] font-bold text-[#0F2942]">
            {formatNumber(activeEstimate.totalLiters)} L
          </p>
          <p className="mt-1.5 text-[12px] text-[#5B7FA4] font-mono tabular-nums">
            {formatNumber(activeEstimate.totalContainers)} containers × 20 L
          </p>
        </div>

        <div className="bg-white border border-[#D4E6FA] rounded-2xl p-5">
          <p className="text-[13px] font-medium text-[#52779E]">Converted Cubic Meters</p>
          <p className="mt-2 font-mono tabular-nums text-[26px] font-bold text-[#0F2942]">
            {formatNumber(activeEstimate.cubicMeters, 2)} m³
          </p>
          <p className="mt-1.5 text-[12px] text-[#5B7FA4]">
            Bracket: {activeEstimate.currentBracket}
          </p>
        </div>

        <div className="bg-white border border-[#D4E6FA] rounded-2xl p-5">
          <p className="text-[13px] font-medium text-[#52779E]">Estimated COWD Monthly Bill</p>
          <p className="mt-2 font-mono tabular-nums text-[26px] font-bold text-[#0E6993]">
            {formatPHP(activeEstimate.totalBill)}
          </p>
          <p className="mt-1.5 text-[12px] text-[#5B7FA4] font-mono tabular-nums">
            Avg: {formatPHP(activeEstimate.effectiveRatePerCubicMeter)} / m³
          </p>
        </div>
      </div>

      {/* Itemized COWD 3/4-inch Water Meter Table */}
      <div className="bg-white border border-[#D4E6FA] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5EFFB] flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-bold text-[18px] text-[#0F2942]">
              Cagayan de Oro City Water District (COWD) Rate Breakdown
            </h2>
            <p className="text-[13px] text-[#5B7FA4]">
              3/4-inch water meter progressive tariff applied to {formatNumber(activeEstimate.cubicMeters, 2)} m³
            </p>
          </div>
          <span className="font-mono tabular-nums text-[13px] font-semibold text-[#0E6993]">
            Meter Size: 3/4&quot;
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6FAFF] border-b border-[#E5EFFB] text-[12px] font-semibold text-[#52779E]">
                <th className="py-3 px-6 whitespace-nowrap">Consumption Bracket</th>
                <th className="py-3 px-4 whitespace-nowrap">Range (m³)</th>
                <th className="py-3 px-4 whitespace-nowrap">COWD Rate</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Volume Charged</th>
                <th className="py-3 px-6 text-right whitespace-nowrap">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF4FC] text-[14px]">
              {activeEstimate.tiers.map((tier) => (
                <tr
                  key={tier.rangeDescription}
                  className={tier.isActive ? 'bg-white' : 'bg-[#FAFBFD] text-[#8DA5BF]'}
                >
                  <td className="py-3.5 px-6 font-semibold whitespace-nowrap">
                    {tier.bracketLabel}
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums whitespace-nowrap">
                    {tier.rangeDescription}
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums whitespace-nowrap">
                    {tier.rateLabel}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                    {tier.cubicMetersInBracket.toFixed(2)} m³
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono tabular-nums font-bold whitespace-nowrap">
                    {formatPHP(tier.subtotal)}
                  </td>
                </tr>
              ))}
              <tr className="bg-[#F2F8FF] border-t-2 border-[#CFE3FA]">
                <td colSpan={3} className="py-4 px-6 font-display font-bold text-[15px] text-[#0F2942]">
                  Total Estimated Monthly Water Bill
                </td>
                <td className="py-4 px-4 text-right font-mono tabular-nums font-bold text-[#0F2942]">
                  {activeEstimate.cubicMeters.toFixed(2)} m³
                </td>
                <td className="py-4 px-6 text-right font-mono tabular-nums font-bold text-[18px] text-[#0E6993]">
                  {formatPHP(activeEstimate.totalBill)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Scope & Delimitation Note */}
      <div className="bg-[#F7FBFF] border border-[#CFE3FA] rounded-2xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#4E8EDB] shrink-0 mt-0.5" />
        <div className="text-[13px] leading-relaxed text-[#335577]">
          <p className="font-semibold text-[#0F2942]">
            Estimation Scope &amp; Delimitation Note
          </p>
          <p className="mt-1">
            This estimate uses recorded 20-liter round and slim container sales multiplied by 20 liters,
            converted to cubic meters by dividing by 1,000. Because it measures only water leaving
            the station in sold containers (excluding backwash, rinsing, and RO reject water), the
            computed figure represents a lower bound of Pure Flow 360&apos;s actual COWD meter bill.
          </p>
        </div>
      </div>
    </div>
  );
};
