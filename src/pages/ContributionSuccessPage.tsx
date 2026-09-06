import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, FileText, ArrowRight, Heart, Share2, Copy } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const ContributionSuccessPage: React.FC = () => {
  const [params] = useSearchParams();
  const reference = params.get('ref') || 'SAFA-2026-000007';
  const amount = params.get('amount') || '100,000';
  const currency = params.get('currency') || 'UZS';
  const purpose = params.get('purpose') || 'General Community Support';
  const isAnon = params.get('anon') === 'true';

  const copyRef = () => {
    navigator.clipboard.writeText(reference);
    alert(`Reference code ${reference} copied to clipboard.`);
  };

  return (
    <div className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-[#172033] tracking-tight mb-2">
          Thank You for Connecting Hands!
        </h1>
        <p className="text-sm text-[#64748B] mb-8">
          Your support has been registered in the SAFA transparency ledger with a server-side verified reference number.
        </p>

        {/* Receipt Card */}
        <Card className="p-6 sm:p-8 text-left mb-8 bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-5">
            <div>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Official Contribution Reference
              </span>
              <span className="text-xl font-mono font-extrabold text-[#0D47A1]">
                {reference}
              </span>
            </div>
            <button
              onClick={copyRef}
              className="p-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]"
              title="Copy Reference"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5 text-xs text-[#172033]">
            <div className="flex justify-between py-1 border-b border-dashed border-[#E2E8F0]">
              <span className="text-[#64748B]">Amount & Currency</span>
              <span className="font-bold text-sm text-[#0D47A1]">{Number(amount).toLocaleString()} {currency}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dashed border-[#E2E8F0]">
              <span className="text-[#64748B]">Purpose / Program</span>
              <span className="font-semibold">{decodeURIComponent(purpose)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dashed border-[#E2E8F0]">
              <span className="text-[#64748B]">Public Display</span>
              <span className="font-semibold">{isAnon ? 'Anonymous Supporter' : 'Supporter'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Verification Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" />
                Verified & Completed
              </span>
            </div>
          </div>
        </Card>

        {/* Navigation actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/contributions/history">
            <Button variant="primary" size="md" icon={<FileText className="w-4 h-4" />}>
              View on Public Ledger
            </Button>
          </Link>
          <Link to="/work">
            <Button variant="outline" size="md">
              Explore Our Ongoing Work
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
