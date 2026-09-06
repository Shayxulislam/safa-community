import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, ArrowRight, Download, CheckCircle2, Lock } from 'lucide-react';
import { storage } from '../../services/storage';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';

export const TransparencySection: React.FC = () => {
  const contributions = storage.getContributions();
  const reports = storage.getReports();

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#C1E8FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Radical Transparency"
          badgeIcon={<ShieldCheck className="w-3.5 h-3.5" />}
          title="Accountability in Every Single Sum & Initiative"
          description="We make trust visible. Every contribution receives an immutable server reference, and every financial expenditure is backed by itemized receipts."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Public Contribution Ledger Preview */}
          <div className="lg:col-span-7 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-[#3D3B36] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#5E6E52]" />
                <span>Recent Verified Contributions</span>
              </h3>
              <Link
                to="/contributions/history"
                className="text-xs font-bold text-[#5E6E52] hover:underline inline-flex items-center gap-1"
              >
                <span>View Full Ledger ({contributions.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-[2rem] border border-[#E5E0D5] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F1EDE4] text-[#3D3B36] font-serif font-bold border-b border-[#E5E0D5]">
                    <tr>
                      <th className="py-3.5 px-4">Reference</th>
                      <th className="py-3.5 px-4">Supporter</th>
                      <th className="py-3.5 px-4">Purpose</th>
                      <th className="py-3.5 px-4 text-right">Amount</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D5] bg-white">
                    {contributions.slice(0, 5).map(c => (
                      <tr key={c.id} className="hover:bg-[#FDFCF9] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#5E6E52]">
                          {c.contributionNumber}
                        </td>
                        <td className="py-3.5 px-4 text-[#3D3B36] font-medium">
                          {c.isAnonymous ? (
                            <span className="text-[#6D6A61] italic font-serif">Anonymous Supporter</span>
                          ) : (
                            c.donorName
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#6D6A61] truncate max-w-[150px]">
                          {c.purpose}
                        </td>
                        <td className="py-3.5 px-4 font-serif font-bold text-right text-[#B06D50]">
                          {c.amount.toLocaleString()} {c.currency}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F1EDE4] text-[#5E6E52] border border-[#E5E0D5]">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3.5 bg-[#F1EDE4]/50 text-[11px] text-[#6D6A61] text-center border-t border-[#E5E0D5]">
                Strict Privacy: No personal bank credentials, card numbers, or phone numbers are ever published.
              </div>
            </div>
          </div>

          {/* Published Reports Preview */}
          <div className="lg:col-span-5 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-[#3D3B36] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5E6E52]" />
                <span>Verified Public Reports</span>
              </h3>
              <Link
                to="/transparency"
                className="text-xs font-bold text-[#5E6E52] hover:underline inline-flex items-center gap-1"
              >
                <span>All Documents</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {reports.map(report => (
                <Card key={report.id} className="p-4 bg-white border border-[#E5E0D5] rounded-2xl hover:border-[#5E6E52]/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F1EDE4] text-[#5E6E52] border border-[#E5E0D5] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F1EDE4] text-[#B06D50] border border-[#E5E0D5]">
                          {report.category}
                        </span>
                        <span className="text-[11px] text-[#6D6A61]">{report.publishedAt}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-serif font-bold text-[#3D3B36] leading-snug mb-1">
                        {report.title}
                      </h4>
                      <p className="text-xs text-[#6D6A61] leading-relaxed line-clamp-2">
                        {report.summary}
                      </p>
                    </div>
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5E6E52] hover:text-[#3D3B36] p-2 rounded-lg hover:bg-[#F1EDE4] shrink-0 transition-colors"
                      title="Download Report"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Opening official report: ${report.title} (${report.fileSize})`);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
