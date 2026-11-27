import React, { useMemo, useState } from 'react';
import { Download, Printer, Search, Trash2 } from 'lucide-react';
import {
  ContainerType,
  SaleTransaction,
  UserRole,
  WaterType,
} from '../types';
import { CURRENT_MONTH_PREFIX, TODAY_DATE } from '../data/initialData';
import {
  convertLitersToCubicMeters,
  exportTransactionsToCsv,
  formatNumber,
  formatPHP,
} from '../utils/waterCalculations';

interface SalesReportViewProps {
  transactions: SaleTransaction[];
  role: UserRole;
  onDeleteTransaction: (id: string) => void;
}

export const SalesReportView: React.FC<SalesReportViewProps> = ({
  transactions,
  role,
  onDeleteTransaction,
}) => {
  const [dateFilter, setDateFilter] = useState<string>(TODAY_DATE);
  const [waterFilter, setWaterFilter] = useState<'ALL' | WaterType>('ALL');
  const [containerFilter, setContainerFilter] = useState<'ALL' | ContainerType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions
      .filter((t) => {
        if (dateFilter === 'ALL_MONTH') {
          if (!t.date.startsWith(CURRENT_MONTH_PREFIX)) return false;
        } else if (dateFilter && t.date !== dateFilter) {
          return false;
        }

        if (waterFilter !== 'ALL' && t.waterType !== waterFilter) return false;
        if (containerFilter !== 'ALL' && t.containerType !== containerFilter) return false;

        if (q) {
          const matchesReceipt = t.receiptNo.toLowerCase().includes(q);
          const matchesCustomer = t.customerName.toLowerCase().includes(q);
          if (!matchesReceipt && !matchesCustomer) return false;
        }
        return true;
      })
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [transactions, dateFilter, waterFilter, containerFilter, searchQuery]);

  const reportSummary = useMemo(() => {
    const totalSales = filteredTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const totalContainers = filteredTransactions.reduce((acc, t) => acc + t.quantity, 0);
    const totalLiters = filteredTransactions.reduce((acc, t) => acc + t.liters, 0);
    const purifiedRev = filteredTransactions
      .filter((t) => t.waterType === WaterType.PURIFIED)
      .reduce((acc, t) => acc + t.totalAmount, 0);
    const alkalineRev = filteredTransactions
      .filter((t) => t.waterType === WaterType.ALKALINE)
      .reduce((acc, t) => acc + t.totalAmount, 0);
    const roundQty = filteredTransactions
      .filter((t) => t.containerType === ContainerType.ROUND_20L)
      .reduce((acc, t) => acc + t.quantity, 0);
    const slimQty = filteredTransactions
      .filter((t) => t.containerType === ContainerType.SLIM_20L)
      .reduce((acc, t) => acc + t.quantity, 0);

    return {
      totalSales,
      totalContainers,
      totalLiters,
      cubicMeters: convertLitersToCubicMeters(totalLiters),
      purifiedRev,
      alkalineRev,
      roundQty,
      slimQty,
    };
  }, [filteredTransactions]);

  const handleExportCsv = () => {
    const label = dateFilter === 'ALL_MONTH' ? CURRENT_MONTH_PREFIX : dateFilter || 'all';
    exportTransactionsToCsv(
      filteredTransactions,
      `PureFlow360-Sales-Report-${label}.csv`
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <div className="bg-white border border-[#D4E6FA] rounded-2xl p-4 sm:p-5 space-y-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDateFilter(TODAY_DATE)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                dateFilter === TODAY_DATE
                  ? 'bg-[#64A2EB] text-white'
                  : 'bg-[#EDF5FF] text-[#3A5978] hover:bg-[#DDEBFD]'
              }`}
            >
              Today ({TODAY_DATE})
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('ALL_MONTH')}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                dateFilter === 'ALL_MONTH'
                  ? 'bg-[#64A2EB] text-white'
                  : 'bg-[#EDF5FF] text-[#3A5978] hover:bg-[#DDEBFD]'
              }`}
            >
              This Month ({CURRENT_MONTH_PREFIX})
            </button>
            <input
              type="date"
              aria-label="Filter by specific date"
              value={dateFilter === 'ALL_MONTH' ? '' : dateFilter}
              onChange={(e) => setDateFilter(e.target.value || 'ALL_MONTH')}
              className="h-9 px-3 rounded-lg border border-[#CFE3FA] bg-white font-mono tabular-nums text-[13px] text-[#0F2942]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredTransactions.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CFE3FA] bg-white hover:bg-[#F4F9FF] disabled:opacity-50 text-[13px] font-semibold text-[#0F2942] cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-[#4E8EDB]" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#14CFF0] hover:bg-[#0EC0E0] text-[13px] font-display font-bold text-white cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6A8CAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipt or customer..."
              className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#CFE3FA] bg-[#FAFBFD] text-[13px] text-[#0F2942] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14CFF0]"
            />
          </div>

          <select
            aria-label="Filter by water type"
            value={waterFilter}
            onChange={(e) => setWaterFilter(e.target.value as 'ALL' | WaterType)}
            className="h-10 px-3 rounded-xl border border-[#CFE3FA] bg-[#FAFBFD] text-[13px] font-medium text-[#0F2942]"
          >
            <option value="ALL">All Water Types</option>
            <option value={WaterType.PURIFIED}>Purified Water Only</option>
            <option value={WaterType.ALKALINE}>Alkaline Water Only</option>
          </select>

          <select
            aria-label="Filter by container type"
            value={containerFilter}
            onChange={(e) =>
              setContainerFilter(e.target.value as 'ALL' | ContainerType)
            }
            className="h-10 px-3 rounded-xl border border-[#CFE3FA] bg-[#FAFBFD] text-[13px] font-medium text-[#0F2942]"
          >
            <option value="ALL">All 20L Containers</option>
            <option value={ContainerType.ROUND_20L}>20L Round Only</option>
            <option value={ContainerType.SLIM_20L}>20L Slim Only</option>
          </select>
        </div>
      </div>

      {/* Report Summary Strip */}
      <div className="bg-white border border-[#D4E6FA] rounded-2xl p-6 print-container space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-[#E5EFFB]">
          <div>
            <h2 className="font-display font-bold text-[19px] text-[#0F2942]">
              PureFlow 360 · Sales Report Summary
            </h2>
            <p className="text-[13px] text-[#5B7FA4]">
              Period:{' '}
              <span className="font-mono font-semibold text-[#0F2942]">
                {dateFilter === 'ALL_MONTH' ? CURRENT_MONTH_PREFIX : dateFilter}
              </span>{' '}
              · {filteredTransactions.length} matching records
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[#52779E]">Gross Report Sales</p>
            <p className="font-mono tabular-nums text-[26px] font-bold text-[#0F2942]">
              {formatPHP(reportSummary.totalSales)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
          <div>
            <p className="text-[#52779E]">Purified Sales</p>
            <p className="mt-1 font-mono tabular-nums text-[17px] font-bold text-[#0F2942]">
              {formatPHP(reportSummary.purifiedRev)}
            </p>
          </div>
          <div>
            <p className="text-[#52779E]">Alkaline Sales</p>
            <p className="mt-1 font-mono tabular-nums text-[17px] font-bold text-[#0E6993]">
              {formatPHP(reportSummary.alkalineRev)}
            </p>
          </div>
          <div>
            <p className="text-[#52779E]">20L Containers</p>
            <p className="mt-1 font-mono tabular-nums text-[17px] font-bold text-[#0F2942]">
              {formatNumber(reportSummary.totalContainers)}
            </p>
            <p className="text-[11px] text-[#6A8CAE] font-mono tabular-nums">
              {reportSummary.roundQty} Round · {reportSummary.slimQty} Slim
            </p>
          </div>
          <div>
            <p className="text-[#52779E]">Water Volume</p>
            <p className="mt-1 font-mono tabular-nums text-[17px] font-bold text-[#0F2942]">
              {formatNumber(reportSummary.totalLiters)} L
            </p>
            <p className="text-[11px] text-[#6A8CAE] font-mono tabular-nums">
              {reportSummary.cubicMeters.toFixed(2)} m³
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-[#D4E6FA] rounded-2xl overflow-hidden print-container">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="font-display font-bold text-[16px] text-[#0F2942]">
              No matching sales transactions
            </p>
            <p className="text-[13px] text-[#5B7FA4]">
              Adjust your date, water grade, or search filters to view recorded transactions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6FAFF] border-b border-[#E5EFFB] text-[12px] font-semibold text-[#52779E]">
                  <th className="py-3 px-6 whitespace-nowrap">Receipt No.</th>
                  <th className="py-3 px-4 whitespace-nowrap">Date / Time</th>
                  <th className="py-3 px-4 whitespace-nowrap">Customer / Note</th>
                  <th className="py-3 px-4 whitespace-nowrap">Type</th>
                  <th className="py-3 px-4 whitespace-nowrap">Container</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Qty</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Liters</th>
                  <th className="py-3 px-4 whitespace-nowrap">Payment</th>
                  <th className="py-3 px-6 text-right whitespace-nowrap">Total</th>
                  {role === UserRole.OWNER && (
                    <th className="py-3 px-4 text-right whitespace-nowrap no-print">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF4FC] text-[13px]">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F8FBFF]">
                    <td className="py-3 px-6 font-mono tabular-nums font-semibold text-[#0F2942] whitespace-nowrap">
                      {tx.receiptNo}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-[#52779E] whitespace-nowrap">
                      {tx.date} · {tx.time}
                    </td>
                    <td className="py-3 px-4 text-[#1E3B5A] max-w-[200px] truncate">
                      {tx.customerName}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#0F2942] whitespace-nowrap">
                      {tx.waterType}
                    </td>
                    <td className="py-3 px-4 text-[#335577] whitespace-nowrap">
                      {tx.containerType}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-[#0F2942]">
                      {tx.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#52779E]">
                      {formatNumber(tx.liters)} L
                    </td>
                    <td className="py-3 px-4 text-[#52779E] whitespace-nowrap">
                      {tx.paymentMethod}
                    </td>
                    <td className="py-3 px-6 text-right font-mono tabular-nums font-bold text-[#0F2942] whitespace-nowrap">
                      {formatPHP(tx.totalAmount)}
                    </td>
                    {role === UserRole.OWNER && (
                      <td className="py-3 px-4 text-right no-print">
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          aria-label={`Remove ${tx.receiptNo}`}
                          className="p-1.5 rounded-lg text-[#7A96B3] hover:text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
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
