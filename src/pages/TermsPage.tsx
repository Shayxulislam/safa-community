import React from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';

export const TermsPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <SectionHeader
          badge="Terms of Service"
          title="SAFA Terms & Community Code"
          description="Guidelines governing public interaction, volunteer participation, and contributions."
        />

        <Card className="p-8 sm:p-10 space-y-6 text-sm text-[#475569] leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-[#172033] mb-2">1. Purpose of the Platform</h3>
            <p>
              The SAFA web platform serves as an open information portal, verified project archive, volunteer mobilization network, and transparent contribution ledger.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#172033] mb-2">2. Accuracy & Non-Fabrication</h3>
            <p>
              All published metrics, project descriptions, and photo archives represent real community events organized or supervised by SAFA in Uzbekistan. We forbid false claims and maintain strict verification standards.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#172033] mb-2">3. Contributions & Allocation</h3>
            <p>
              Funds received through the platform are dedicated directly to the specified program or general community relief initiatives. Administrative overhead is kept to the absolute operational minimum and audited publicly.
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#172033] mb-2">4. Volunteer Participation</h3>
            <p>
              Volunteers agree to treat every resident, neighbor, and fellow volunteer with absolute respect, courtesy, and dignity, adhering to local cultural customs and child protection standards.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
