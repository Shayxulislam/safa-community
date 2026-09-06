import React from 'react';
import { Accessibility, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';

export const AccessibilityPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <SectionHeader
          badge="Inclusion & Accessibility"
          badgeIcon={<Accessibility className="w-3.5 h-3.5" />}
          title="Digital Accessibility Statement"
          description="Ensuring equal access to SAFA's community initiatives for all individuals, including persons with visual, motor, or cognitive impairments."
        />

        <Card className="p-8 sm:p-10 space-y-6 text-sm text-[#475569] leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-[#172033] mb-2">Our Accessibility Standards</h3>
            <p>
              Just as we construct physical wheelchair ramps and remove barriers in apartment entrances, SAFA is dedicated to digital accessibility. We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#172033]">Key Implemented Features:</h4>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span><strong>High Contrast & Semantic Colors:</strong> Strict color contrast ratios exceeding 4.5:1 for standard text and 3:1 for large text and interactive boundaries.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span><strong>Descriptive Alt Text:</strong> All photographs, portrait assets, and icons contain descriptive alternative text tags.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span><strong>Keyboard Navigability:</strong> Visual focus rings and tab sequences across all buttons, form fields, and modal dialogues.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span><strong>Screen Reader Compatibility:</strong> Standard HTML5 landmark elements (`main`, `nav`, `section`, `footer`) and ARIA labels.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0]">
            <h4 className="text-sm font-bold text-[#172033] mb-1">Feedback & Barrier Reports</h4>
            <p>
              If you experience any accessibility obstacle on our portal, please inform us at <strong className="text-[#172033]">safaauzb@gmail.com</strong>. We will prioritize adjustments immediately.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
