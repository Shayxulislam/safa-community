import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShieldCheck, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { storage } from '../../services/storage';

export const SupportSection: React.FC = () => {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<'UZS' | 'USD'>('UZS');
  const [amount, setAmount] = useState<number>(100000);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customVal, setCustomVal] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('General Community Support');

  const uzsAmounts = [50000, 100000, 250000, 500000];
  const usdAmounts = [10, 25, 50, 100];

  const handleProceed = () => {
    const finalAmount = isCustom ? Number(customVal) || 50000 : amount;
    navigate(`/support?amount=${finalAmount}&currency=${currency}&purpose=${encodeURIComponent(purpose)}`);
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#C1E8FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2.5rem] border border-[#E5E0D5] shadow-xs p-6 sm:p-10 lg:p-12 max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F1EDE4] text-[#B06D50] border border-[#E5E0D5] mb-3 shadow-2xs">
              <Heart className="w-3.5 h-3.5 fill-[#B06D50]" />
              <span>Direct Community Contribution</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#3D3B36] tracking-tight">
              Support the SAFA Mission
            </h2>
            <p className="mt-3 text-base text-[#6D6A61] leading-relaxed">
              Every sum is converted into groceries, warm winter coats, wheelchair ramps, and medical supplies delivered directly into community hands.
            </p>
          </div>

          <div className="bg-[#F1EDE4]/50 rounded-[2rem] p-6 sm:p-8 border border-[#E5E0D5] mb-8">
            {/* Currency selector */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E5E0D5]">
              <span className="text-xs font-bold text-[#3D3B36] uppercase tracking-wider">
                Select Currency:
              </span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-[#E5E0D5]">
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('UZS');
                    setAmount(100000);
                    setIsCustom(false);
                  }}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                    currency === 'UZS'
                      ? 'bg-[#5E6E52] text-white shadow-xs'
                      : 'text-[#6D6A61] hover:text-[#3D3B36]'
                  }`}
                >
                  UZS (So'm)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('USD');
                    setAmount(25);
                    setIsCustom(false);
                  }}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                    currency === 'USD'
                      ? 'bg-[#5E6E52] text-white shadow-xs'
                      : 'text-[#6D6A61] hover:text-[#3D3B36]'
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>

            {/* Suggested Amounts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {(currency === 'UZS' ? uzsAmounts : usdAmounts).map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setAmount(val);
                    setIsCustom(false);
                  }}
                  className={`p-3.5 rounded-2xl border text-sm font-bold transition-all text-center ${
                    !isCustom && amount === val
                      ? 'bg-[#5E6E52] border-[#5E6E52] text-white shadow-xs'
                      : 'bg-white border-[#E5E0D5] text-[#3D3B36] hover:border-[#5E6E52]'
                  }`}
                >
                  {val.toLocaleString()} {currency}
                </button>
              ))}
            </div>

            {/* Custom Amount input */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#3D3B36] uppercase tracking-wider mb-1.5">
                Or enter custom amount ({currency}):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  placeholder={currency === 'UZS' ? 'e.g. 150000' : 'e.g. 35'}
                  value={customVal}
                  onChange={e => {
                    setCustomVal(e.target.value);
                    setIsCustom(true);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E0D5] bg-white text-sm text-[#3D3B36] focus:border-[#5E6E52] focus:ring-1 focus:ring-[#5E6E52] outline-hidden shadow-2xs"
                />
              </div>
            </div>

            {/* Purpose */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#3D3B36] uppercase tracking-wider mb-1.5">
                Direct contribution towards:
              </label>
              <select
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D5] bg-white text-sm text-[#3D3B36] focus:border-[#5E6E52] outline-hidden shadow-2xs"
              >
                <option value="General Community Support">General Community Support (Where needed most)</option>
                <option value="Winter Warmth & Groceries">Winter Warmth & Family Food Packages</option>
                <option value="Accessibility Ramps & Aids">Disability Accessibility & Wheelchair Ramps</option>
                <option value="Elderly Companion Visits">Elderly Care & Prescription Medication</option>
                <option value="School Kits for Children">Youth Education & School Kits</option>
              </select>
            </div>

            {/* Action button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full shadow-sm"
              icon={<Heart className="w-5 h-5 fill-white" />}
              onClick={handleProceed}
            >
              Continue to Contribution Options
            </Button>
          </div>

          {/* Security guarantee */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#6D6A61] pt-4 border-t border-[#E5E0D5] gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#5E6E52]" />
              <span>PCI-Compliant Security • Zero Raw Card Details Stored</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5E6E52]" />
              <span>Unique Server Reference Code Generated on Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
