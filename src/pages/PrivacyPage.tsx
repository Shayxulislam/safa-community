import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <SectionHeader
          badge="Privacy & Confidentiality"
          badgeIcon={<Lock className="w-3.5 h-3.5" />}
          title="Privacy Policy & Beneficiary Dignity Charter"
          description="Last updated: January 2026. How SAFA protects supporter data, volunteer information, and vulnerable community member privacy."
        />

        <Card className="p-8 sm:p-10 space-y-6 text-sm text-[#475569] leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-[#172033] mb-2">1. Core Privacy Commitment</h3>
            <p>
              SAFA operates under strict principles of human dignity and data protection. We recognize the sacred trust placed in us by community beneficiaries, volunteers, and supporters.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#172033] mb-2">2. Beneficiary Protection (Zero Vulnerability Exposure)</h3>
            <p>
              We strictly forbid the public disclosure of private residential addresses, personal phone numbers, passport or national identity records, or medical records of the elderly and disabled persons we visit. All photography and testimonials require verified prior consent.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#172033] mb-2">3. Donor & Financial Information Security</h3>
            <p>
              SAFA never collects or stores complete payment card numbers (PANs), CVV codes, or bank PINs on our servers. All online checkouts are handled through certified, PCI-compliant payment gateways. Donors have the explicit right to remain listed as "Anonymous Supporter" on the public ledger.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#172033] mb-2">4. Volunteer Records</h3>
            <p>
              Volunteer personal phone numbers, telegram handles, and emails are maintained exclusively for operational coordination and are never sold, rented, or shared with third-party advertising brokers.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#172033] mb-2">5. Inquiries & Data Rights</h3>
            <p>
              To request the removal or correction of any published record, please reach our leadership directly at <strong className="text-[#172033]">safaauzb@gmail.com</strong>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
