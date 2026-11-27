import React, { useState } from 'react';
import { CheckCircle2, Printer, Settings2 } from 'lucide-react';
import {
  ContainerType,
  PaymentMethod,
  SaleTransaction,
  StationPricing,
  UserRole,
  WaterType,
} from '../types';
import { TODAY_DATE } from '../data/initialData.ts';
import {
  calculateTotalLiters,
  convertLitersToCubicMeters,
  formatNumber,
  formatPHP,
} from '../utils/waterCalculations';

interface RecordSaleViewProps {
  pricing: StationPricing;
  onUpdatePricing: (pricing: StationPricing) => void;
  onAddTransaction: (
    tx: Omit<SaleTransaction, 'id' | 'receiptNo'>
  ) => SaleTransaction;
  role: UserRole;
  username: string;
}

export const RecordSaleView: React.FC<RecordSaleViewProps> = ({
  pricing,
  onUpdatePricing,
  onAddTransaction,
  role,
  username,
}) => {
  const [waterType, setWaterType] = useState<WaterType>(WaterType.PURIFIED);
  const [containerType, setContainerType] = useState<ContainerType>(
    ContainerType.ROUND_20L
  );
  const [quantity, setQuantity] = useState<number>(5);
  const [date, setDate] = useState<string>(TODAY_DATE);
  const [customerName, setCustomerName] = useState<string>('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH
  );
  const [lastReceipt, setLastReceipt] = useState<SaleTransaction | null>(null);
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [draftPricing, setDraftPricing] = useState<StationPricing>(pricing);

  const getUnitPrice = (w: WaterType, c: ContainerType): number => {
    if (w === WaterType.PURIFIED && c === ContainerType.ROUND_20L) {
      return pricing.purifiedRound;
    }
    if (w === WaterType.PURIFIED && c === ContainerType.SLIM_20L) {
      return pricing.purifiedSlim;
    }
    if (w === WaterType.ALKALINE && c === ContainerType.ROUND_20L) {
      return pricing.alkalineRound;
    }
    return pricing.alkalineSlim;
  };

  const unitPrice = getUnitPrice(waterType, containerType);
  const safeQty = Math.max(1, quantity);
  const totalAmount = safeQty * unitPrice;
  const totalLiters = calculateTotalLiters(safeQty);
  const cubicMeters = convertLitersToCubicMeters(totalLiters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const created = onAddTransaction({
      date,
      time: timeStr,
      waterType,
      containerType,
      quantity: safeQty,
      unitPrice,
      totalAmount,
      liters: totalLiters,
      paymentMethod,
      customerName: customerName.trim() || 'Walk-in Customer',
      recordedBy: `${role} (${username})`,
    });

    setLastReceipt(created);
    setQuantity(1);
    setCustomerName('Walk-in Customer');
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePricing(draftPricing);
    setShowPriceEditor(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Point-of-Sale Transaction Entry */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-7 bg-white border border-[#D4E6FA] rounded-2xl p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E5EFFB]">
          <div>
            <h2 className="font-display font-bold text-[19px] text-[#0F2942]">
              New Refill Transaction
            </h2>
            <p className="text-[13px] text-[#5B7FA4]">
              Select water type, 20-liter container style, and quantity sold
            </p>
          </div>
          {role === UserRole.OWNER && (
            <button
              type="button"
              onClick={() => {
                setDraftPricing(pricing);
                setShowPriceEditor((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4E6FA] text-[12px] font-semibold text-[#335577] hover:bg-[#F4F9FF] cursor-pointer whitespace-nowrap"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Edit Unit Prices</span>
            </button>
          )}
        </div>

        {/* Optional Owner Price Editor */}
        {showPriceEditor && role === UserRole.OWNER && (
          <div className="p-4 rounded-xl bg-[#F4F9FF] border border-[#CFE3FA] space-y-3">
            <p className="text-[13px] font-semibold text-[#0F2942]">
              Station Unit Price Configuration (per 20L container)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="block">
                <span className="text-[11px] font-medium text-[#52779E]">
                  Purified Round (₱)
                </span>
                <input
                  type="number"
                  min={1}
                  value={draftPricing.purifiedRound}
                  onChange={(e) =>
                    setDraftPricing({
                      ...draftPricing,
                      purifiedRound: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="mt-1 w-full px-3 py-1.5 rounded-lg border border-[#C3DCF8] bg-white font-mono tabular-nums text-[13px]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium text-[#52779E]">
                  Purified Slim (₱)
                </span>
                <input
                  type="number"
                  min={1}
                  value={draftPricing.purifiedSlim}
                  onChange={(e) =>
                    setDraftPricing({
                      ...draftPricing,
                      purifiedSlim: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="mt-1 w-full px-3 py-1.5 rounded-lg border border-[#C3DCF8] bg-white font-mono tabular-nums text-[13px]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium text-[#52779E]">
                  Alkaline Round (₱)
                </span>
                <input
                  type="number"
                  min={1}
                  value={draftPricing.alkalineRound}
                  onChange={(e) =>
                    setDraftPricing({
                      ...draftPricing,
                      alkalineRound: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="mt-1 w-full px-3 py-1.5 rounded-lg border border-[#C3DCF8] bg-white font-mono tabular-nums text-[13px]"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-medium text-[#52779E]">
                  Alkaline Slim (₱)
                </span>
                <input
                  type="number"
                  min={1}
                  value={draftPricing.alkalineSlim}
                  onChange={(e) =>
                    setDraftPricing({
                      ...draftPricing,
                      alkalineSlim: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="mt-1 w-full px-3 py-1.5 rounded-lg border border-[#C3DCF8] bg-white font-mono tabular-nums text-[13px]"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPriceEditor(false)}
                className="px-3 py-1.5 text-[12px] font-medium text-[#52779E] hover:text-[#0F2942] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePricing}
                className="px-3 py-1.5 rounded-lg bg-[#64A2EB] text-white text-[12px] font-semibold hover:bg-[#4F92E3] cursor-pointer"
              >
                Save Rates
              </button>
            </div>
          </div>
        )}

        {/* Water Type Selector */}
        <div>
          <span className="block text-[13px] font-semibold text-[#2B4B6C] mb-2">
            Water Type
          </span>
          <div className="grid grid-cols-2 gap-3">
            {[WaterType.PURIFIED, WaterType.ALKALINE].map((type) => {
              const selected = waterType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setWaterType(type)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#E9F4FF] border-[#5B9EE8] ring-2 ring-[#5B9EE8]/25'
                      : 'bg-[#FAFBFD] border-[#DDEAF9] hover:border-[#A9CCF5]'
                  }`}
                >
                  <p className="font-display font-bold text-[15px] text-[#0F2942]">
                    {type} Water
                  </p>
                  <p className="text-[12px] text-[#5B7FA4] mt-0.5 font-mono tabular-nums">
                    {formatPHP(getUnitPrice(type, containerType))} / 20L refill
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Container Type Selector */}
        <div>
          <span className="block text-[13px] font-semibold text-[#2B4B6C] mb-2">
            20-Liter Container Style
          </span>
          <div className="grid grid-cols-2 gap-3">
            {[ContainerType.ROUND_20L, ContainerType.SLIM_20L].map((cType) => {
              const selected = containerType === cType;
              return (
                <button
                  key={cType}
                  type="button"
                  onClick={() => setContainerType(cType)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#E9F4FF] border-[#5B9EE8] ring-2 ring-[#5B9EE8]/25'
                      : 'bg-[#FAFBFD] border-[#DDEAF9] hover:border-[#A9CCF5]'
                  }`}
                >
                  <p className="font-display font-bold text-[15px] text-[#0F2942]">
                    {cType} Container
                  </p>
                  <p className="text-[12px] text-[#5B7FA4] mt-0.5">
                    {cType === ContainerType.ROUND_20L
                      ? 'Standard round gallon (20L)'
                      : 'Slim faucet dispenser jug (20L)'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity & Quick Steppers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="sale-quantity"
              className="block text-[13px] font-semibold text-[#2B4B6C] mb-2"
            >
              Quantity (Containers)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-11 h-11 rounded-xl border border-[#CFE3FA] bg-[#F4F9FF] hover:bg-[#E7F2FF] font-bold text-lg text-[#0F2942] cursor-pointer"
              >
                -
              </button>
              <input
                id="sale-quantity"
                type="number"
                min={1}
                max={500}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="flex-1 h-11 px-4 rounded-xl border border-[#CFE3FA] bg-white text-center font-mono tabular-nums font-bold text-[17px] text-[#0F2942] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14CFF0]"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-11 h-11 rounded-xl border border-[#CFE3FA] bg-[#F4F9FF] hover:bg-[#E7F2FF] font-bold text-lg text-[#0F2942] cursor-pointer"
              >
                +
              </button>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {[1, 5, 10, 20].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className="px-2.5 py-1 rounded-lg bg-[#EDF5FF] hover:bg-[#D9EBFF] text-[12px] font-mono tabular-nums font-semibold text-[#2B4B6C] cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="sale-date"
              className="block text-[13px] font-semibold text-[#2B4B6C] mb-2"
            >
              Transaction Date
            </label>
            <input
              id="sale-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[#CFE3FA] bg-white font-mono tabular-nums text-[14px] text-[#0F2942] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14CFF0]"
            />
          </div>
        </div>

        {/* Customer & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="sale-customer"
              className="block text-[13px] font-semibold text-[#2B4B6C] mb-2"
            >
              Customer / Delivery Note
            </label>
            <input
              id="sale-customer"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Walk-in Customer or Household"
              className="w-full h-11 px-4 rounded-xl border border-[#CFE3FA] bg-white text-[14px] text-[#0F2942] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14CFF0]"
            />
          </div>

          <div>
            <span className="block text-[13px] font-semibold text-[#2B4B6C] mb-2">
              Payment Method
            </span>
            <div className="grid grid-cols-2 gap-2 h-11 p-1 rounded-xl bg-[#EDF5FF]">
              {[PaymentMethod.CASH, PaymentMethod.GCASH].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-white text-[#0F2942] shadow-xs'
                      : 'text-[#5B7FA4] hover:text-[#0F2942]'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-12 rounded-full bg-[#14CFF0] hover:bg-[#0EC0E0] active:scale-[0.99] text-white font-display font-bold text-[15px] tracking-wide uppercase shadow-[0_8px_20px_-4px_rgba(20,207,240,0.45)] transition-all cursor-pointer"
        >
          Record Sale · {formatPHP(totalAmount)}
        </button>
      </form>

      {/* Right: Live Calculation Summary & Latest Receipt */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border border-[#D4E6FA] rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-[17px] text-[#0F2942]">
            Order &amp; Volume Preview
          </h2>

          <div className="divide-y divide-[#EDF4FC] text-[14px]">
            <div className="py-2.5 flex justify-between">
              <span className="text-[#52779E]">Product</span>
              <span className="font-semibold text-[#0F2942]">
                {waterType} · {containerType}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#52779E]">Unit Price</span>
              <span className="font-mono tabular-nums font-semibold text-[#0F2942]">
                {formatPHP(unitPrice)}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#52779E]">Quantity Sold</span>
              <span className="font-mono tabular-nums font-semibold text-[#0F2942]">
                {safeQty} × 20L
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-[#52779E]">Estimated Water Volume</span>
              <span className="font-mono tabular-nums font-semibold text-[#0E6993]">
                {formatNumber(totalLiters)} L ({cubicMeters.toFixed(3)} m³)
              </span>
            </div>
            <div className="pt-3 flex justify-between items-baseline">
              <span className="font-display font-bold text-[15px] text-[#0F2942]">
                Total Sale Amount
              </span>
              <span className="font-mono tabular-nums font-bold text-[26px] text-[#0F2942]">
                {formatPHP(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Receipt Confirmation Card */}
        {lastReceipt && (
          <div className="bg-white border border-[#A5DBF3] rounded-2xl p-6 space-y-4 print-container">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#0B7A5C]">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="font-display font-bold text-[15px]">
                  Transaction Recorded
                </span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#335577] hover:text-[#0F2942] cursor-pointer no-print"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#F6FAFF] border border-[#DFECFC] space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#52779E]">Receipt No.</span>
                <span className="font-mono tabular-nums font-bold text-[#0F2942]">
                  {lastReceipt.receiptNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52779E]">Date / Time</span>
                <span className="font-mono tabular-nums text-[#0F2942]">
                  {lastReceipt.date} {lastReceipt.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52779E]">Customer</span>
                <span className="text-[#0F2942] font-medium">
                  {lastReceipt.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52779E]">Order</span>
                <span className="text-[#0F2942] font-mono tabular-nums">
                  {lastReceipt.quantity}× {lastReceipt.waterType} ({lastReceipt.containerType})
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#DFECFC]">
                <span className="font-semibold text-[#0F2942]">
                  Paid via {lastReceipt.paymentMethod}
                </span>
                <span className="font-mono tabular-nums font-bold text-[#0F2942]">
                  {formatPHP(lastReceipt.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
