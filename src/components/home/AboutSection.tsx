import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Heart, Users, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { storage } from '../../services/storage';

export const AboutSection: React.FC = () => {
  const founder = storage.getFounderProfile();
  const founderImage = founder.imageUrl || founder.image || '/ceo.png';

  return (
    <section className="py-16 sm:py-24 bg-[#C1E8FF]/35 border-b border-[#C1E8FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="min-h-[384px] rounded-[2.5rem] border border-[#BFDBFE] bg-white p-8 flex flex-col items-center justify-center text-center">
              {founderImage ? (
                <img
                  src={founderImage}
                  alt={founder.name ? `${founder.name}, ${founder.title || founder.role}` : 'SAFA CEO'}
                  className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 aspect-square rounded-2xl object-cover object-top border-4 border-[#EAF4FF] shadow-sm mb-5"
                />
              ) : (
                <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 aspect-square rounded-2xl bg-[#EAF4FF] border border-dashed border-[#BFDBFE] flex items-center justify-center mb-5">
                  <Users className="w-10 h-10 text-[#5483B3]" />
                </div>
              )}
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5E6E52] mb-2">CEO Profile</span>
              {founder.name ? (
                <>
                  <h3 className="text-2xl font-serif font-bold text-[#172033]">{founder.name}</h3>
                  <p className="text-sm font-semibold text-[#5E6E52] mt-1">{founder.title || founder.role}</p>
                  {founder.biography || founder.bio ? (
                    <p className="max-w-md text-sm text-[#6D6A61] leading-relaxed mt-4">{founder.biography || founder.bio}</p>
                  ) : null}
                </>
              ) : (
                <p className="max-w-sm text-sm text-[#6D6A61]">The verified CEO profile will be published here by the SAFA team.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F1EDE4] text-[#B06D50] border border-[#E5E0D5] mb-4 shadow-2xs">
              <span>About SAFA</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#3D3B36] tracking-tight leading-tight mb-5">
              Turning Compassion into Practical, Direct Action
            </h2>

            <p className="text-base sm:text-lg text-[#6D6A61] leading-relaxed mb-6">
              SAFA is an independent community initiative designed to bridge the gap between people who want to contribute and communities facing tangible life hardships across Uzbekistan.
            </p>

            <div className="space-y-3.5 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#5E6E52] shrink-0 mt-0.5" />
                <p className="text-sm text-[#3D3B36]">
                  <strong className="font-semibold text-[#3D3B36]">Direct Field Connection:</strong> We conduct personal home visits, ensuring aid goes directly to intended families.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#5E6E52] shrink-0 mt-0.5" />
                <p className="text-sm text-[#3D3B36]">
                  <strong className="font-semibold text-[#3D3B36]">Youth Empowerment:</strong> Mobilizing universities, young doctors, and student leaders to take active civic ownership.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#5E6E52] shrink-0 mt-0.5" />
                <p className="text-sm text-[#3D3B36]">
                  <strong className="font-semibold text-[#3D3B36]">Complete Transparency:</strong> Open financial summaries, verified receipts, and public contribution records.
                </p>
              </div>
            </div>

            <Link to="/about">
              <Button variant="outline" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                Read Full SAFA Story
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
