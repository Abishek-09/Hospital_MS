import React, { useState, useRef, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Percent,
  IndianRupee,
  ChevronDown
} from 'lucide-react';

// Mock Pediatric Medicine Suggestions
const MEDICINE_SUGGESTIONS = [
  "Paracetamol Syrup",
  "Amoxicillin Syrup",
  "Cetirizine Tablets",
  "Multivitamin Syrup",
  "Ibuprofen Suspension",
  "Azithromycin"
];

export default function BillingEngine({ 
  initialItems = null, 
  onSave = null,
  isReadOnly = false,
  invoiceNumber = "INV-2026-0042" 
}) {
  // Line items state
  const [items, setItems] = useState(
    initialItems || [
      { id: 1, name: "Paracetamol Syrup", type: "Syrup", amount: 120 },
      { id: 2, name: "Amoxicillin Syrup", type: "Syrup", amount: 180 }
    ]
  );

  // Discount & Tax state
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState('flat'); // 'flat' | 'percent'
  const [taxPercent, setTaxPercent] = useState(0);

  // Autocomplete tracking
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper: auto-detect Syrup or Suspension
  const detectTypeFromName = (name) => {
    if (!name) return 'Medicine';
    const isSyrup = /syrup|suspension/i.test(name);
    return isSyrup ? 'Syrup' : 'Medicine';
  };

  // Add line item
  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      name: "",
      type: "Medicine",
      amount: 0
    };
    setItems([...items, newItem]);
    setActiveDropdownIndex(items.length); // auto focus newly added item
  };

  // Remove line item
  const handleRemoveItem = (indexToRemove) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== indexToRemove));
    if (activeDropdownIndex === indexToRemove) {
      setActiveDropdownIndex(null);
    }
  };

  // Handle medicine search input change
  const handleNameChange = (index, value) => {
    const autoType = detectTypeFromName(value);
    setItems(prevItems => {
      const updated = [...prevItems];
      updated[index] = {
        ...updated[index],
        name: value,
        type: autoType
      };
      return updated;
    });
    setActiveDropdownIndex(index);
  };

  // Select autocomplete suggestion
  const handleSelectSuggestion = (index, suggestion) => {
    const autoType = detectTypeFromName(suggestion);
    setItems(prevItems => {
      const updated = [...prevItems];
      updated[index] = {
        ...updated[index],
        name: suggestion,
        type: autoType
      };
      return updated;
    });
    setActiveDropdownIndex(null);
  };

  // Handle type dropdown change ("Medicine" | "Syrup")
  const handleTypeChange = (index, newType) => {
    setItems(prevItems => {
      const updated = [...prevItems];
      updated[index] = {
        ...updated[index],
        type: newType
      };
      return updated;
    });
  };

  // Handle amount change
  const handleAmountChange = (index, val) => {
    const num = parseFloat(val);
    setItems(prevItems => {
      const updated = [...prevItems];
      updated[index] = {
        ...updated[index],
        amount: isNaN(num) ? 0 : num
      };
      return updated;
    });
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  
  const discountAmount = discountType === 'flat'
    ? Math.min(Number(discountValue) || 0, subtotal)
    : (subtotal * (Math.min(Number(discountValue) || 0, 100) / 100));

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = discountedSubtotal * ((Number(taxPercent) || 0) / 100);
  const totalAmount = Math.max(0, discountedSubtotal + taxAmount);

  const handleSaveInvoice = () => {
    const invoiceData = {
      invoiceNumber,
      items,
      subtotal,
      discount: { value: discountValue, type: discountType, amount: discountAmount },
      tax: { percent: taxPercent, amount: taxAmount },
      totalAmount
    };
    if (onSave) {
      onSave(invoiceData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col gap-5 w-full">
      {/* Engine Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#416B66]/10 flex items-center justify-center text-[#416B66] shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#2A4343] uppercase tracking-wide">
              Billing Engine
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Invoice: <strong className="font-mono text-slate-700">{invoiceNumber}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
            Draft
          </span>
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-[#D35E36] hover:bg-[#b54c2a] text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Line Items Section */}
      <div ref={dropdownRef}>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Line Items (Medicine / Syrup)
          </label>
          <span className="text-xs text-slate-400 font-mono">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const searchQuery = (item.name || "").toLowerCase().trim();
            const suggestions = MEDICINE_SUGGESTIONS.filter(med => 
              med.toLowerCase().includes(searchQuery)
            );
            const isDropdownOpen = activeDropdownIndex === index && suggestions.length > 0;

            return (
              <div 
                key={item.id} 
                className="flex flex-col md:flex-row gap-3 mb-3 p-3 md:p-0 bg-slate-50 md:bg-transparent rounded-lg border border-slate-200 md:border-transparent relative"
              >
                {/* 1. Search Input (Full width on mobile, flex-1 on desktop) */}
                <div className="relative flex-1 w-full">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      disabled={isReadOnly}
                      placeholder="Search medicine (e.g., Paracetamol Syrup)..."
                      value={item.name}
                      onFocus={() => setActiveDropdownIndex(index)}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100 font-medium text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {isDropdownOpen && !isReadOnly && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-40 overflow-y-auto custom-scrollbar">
                      {suggestions.map((suggestion, sIdx) => {
                        const isSyrup = /syrup|suspension/i.test(suggestion);
                        return (
                          <div
                            key={sIdx}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectSuggestion(index, suggestion);
                            }}
                            className="px-3 py-2 text-sm text-slate-700 hover:bg-[#416B66]/10 hover:text-[#416B66] cursor-pointer flex items-center justify-between transition-colors border-b border-slate-100 last:border-b-0"
                          >
                            <span className="font-medium">{suggestion}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isSyrup 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-teal-100 text-[#416B66]'
                            }`}>
                              {isSyrup ? 'Syrup (ml)' : 'Medicine (qty)'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Type & Amount & Trash (Grid on mobile, Flex on desktop) */}
                <div className="grid grid-cols-[1fr_1fr_auto] md:flex gap-3 items-center w-full md:w-auto">
                  {/* Restricted Type Dropdown: ONLY "Medicine" and "Syrup" */}
                  <select
                    disabled={isReadOnly}
                    value={item.type}
                    onChange={(e) => handleTypeChange(index, e.target.value)}
                    className="w-full md:w-32 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100 font-medium cursor-pointer"
                  >
                    <option value="Medicine">Medicine</option>
                    <option value="Syrup">Syrup</option>
                  </select>

                  {/* Dynamic Amount Input with ₹ on left and dynamic unit (ml/qty) on right */}
                  <div className="relative w-full md:w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 select-none pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      disabled={isReadOnly}
                      min="0"
                      step="any"
                      placeholder="0.00"
                      value={item.amount === 0 ? '' : item.amount}
                      onChange={(e) => handleAmountChange(index, e.target.value)}
                      className="w-full pl-7 pr-11 py-2 text-sm font-bold text-right border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase select-none pointer-events-none">
                      {item.type === 'Syrup' ? 'ml' : 'qty'}
                    </span>
                  </div>

                  {/* Trash Icon Button */}
                  <button
                    type="button"
                    disabled={isReadOnly || items.length === 1}
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-25 disabled:hover:text-slate-400 disabled:hover:bg-transparent justify-self-end md:justify-self-auto shrink-0"
                    title={items.length === 1 ? "Cannot remove last item" : "Delete item"}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Layout: Discount & Tax Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 mt-4 border-t border-slate-200">
        {/* Bill-Level Discount */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Bill-Level Discount
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                {discountType === 'flat' ? '₹' : '%'}
              </span>
              <input
                type="number"
                disabled={isReadOnly}
                min="0"
                value={discountValue === 0 ? '' : discountValue}
                onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 text-sm font-medium border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100 text-slate-800"
              />
            </div>
            <select
              disabled={isReadOnly}
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-32 px-3 py-2 text-sm font-medium border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100 cursor-pointer"
            >
              <option value="flat">₹ Flat</option>
              <option value="percent">% Percent</option>
            </select>
          </div>
        </div>

        {/* Tax Configuration */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Tax Configuration
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                disabled={isReadOnly}
                min="0"
                max="100"
                value={taxPercent === 0 ? '' : taxPercent}
                onChange={(e) => setTaxPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                placeholder="0"
                className="w-full pr-8 pl-3 py-2 text-sm font-medium border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#416B66] disabled:bg-slate-100 text-slate-800 text-right"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                %
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              (Default: 0%)
            </span>
          </div>
        </div>
      </div>

      {/* Financial Calculation Summary */}
      <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal:</span>
          <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span>
              Discount ({discountType === 'percent' ? `${discountValue}%` : 'Flat'}):
            </span>
            <span>- ₹{discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600">
          <span>Tax ({taxPercent}%):</span>
          <span className="font-semibold text-slate-800">₹{taxAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center text-base font-bold text-[#2A4343] pt-3 border-t border-slate-200">
          <span>Total Amount:</span>
          <span className="text-xl text-[#2A4343]">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Engine Action Button */}
      {!isReadOnly && (
        <div className="pt-2 flex flex-col sm:flex-row justify-end items-center gap-3">
          <button
            type="button"
            onClick={handleSaveInvoice}
            className="w-full sm:w-auto bg-[#D35E36] hover:bg-[#b54c2a] text-white px-6 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Receipt className="w-4 h-4" />
            <span>Save & Lock Invoice</span>
          </button>
        </div>
      )}
    </div>
  );
}
