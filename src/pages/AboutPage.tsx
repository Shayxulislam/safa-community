import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Users, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { FounderSection } from '../components/home/FounderSection';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SafaLogo } from '../components/ui/SafaLogo';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="About SAFA"
          badgeIcon={<Heart className="w-3.5 h-3.5 fill-[#0D47A1]" />}
          title="Connecting Hands, Changing Lives"
          description="A youth-led initiative founded in Uzbekistan to build direct, transparent bridges between those eager to help and communities in need of dignity and support."
        />

        {/* Story & Philosophy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <div className="lg:col-span-6 text-left">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#172033] mb-4">
              Our Origin & Commitment
            </h3>
            <p className="text-base text-[#64748B] leading-relaxed mb-4">
              SAFA began with a very clear observation: many people want to give back, yet often feel disconnected from where their contributions go. On the other side, vulnerable families, lonely elders, and individuals living with disabilities face critical daily barriers that go unseen.
            </p>
            <p className="text-base text-[#64748B] leading-relaxed mb-6">
              SAFA is building a transparent way for verified community work to be documented and shared. Current programs, leadership information, and results will be published here after they are confirmed by the organization.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="flex items-center gap-2 text-[#0D47A1] font-bold text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  <span>Real Field Work</span>
                </div>
                <p className="text-xs text-[#64748B]">Personal deliveries, hands-on construction, and weekly companionship.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0]">
                <div className="flex items-center gap-2 text-[#0D47A1] font-bold text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  <span>Zero Fabrication</span>
                </div>
                <p className="text-xs text-[#64748B]">No exaggerated figures or artificial claims; only verified facts.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 min-h-[400px] rounded-2xl border border-dashed border-[#BFDBFE] bg-white flex items-center justify-center p-8 text-center">
            <p className="max-w-sm text-sm text-[#64748B]">Verified organization information and authentic field photos will be published here.</p>
          </div>
        </div>

        {/* Prominent Founder Section */}
        <div className="mb-16">
          <FounderSection />
        </div>

        {/* Core Principles */}
        <div className="mb-16">
          <SectionHeader
            title="Our Guiding Principles"
            description="Every visit, program, and partnership is held to four non-negotiable operational standards."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-[#EAF4FF] text-[#0D47A1] flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h4 className="text-base font-bold text-[#172033] mb-2">Human Dignity</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Beneficiaries are never treated as objects of pity. We uphold strict privacy and respect personal consent in every photograph and story.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-[#EAF4FF] text-[#0D47A1] flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h4 className="text-base font-bold text-[#172033] mb-2">Direct Responsibility</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Volunteers take personal responsibility for deliveries, purchases, and home repairs with documented receipts.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-[#EAF4FF] text-[#0D47A1] flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h4 className="text-base font-bold text-[#172033] mb-2">Complete Transparency</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Every public contribution receives an immutable server reference code and appears on our transparent ledger.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-[#EAF4FF] text-[#0D47A1] flex items-center justify-center font-bold mb-4">
                04
              </div>
              <h4 className="text-base font-bold text-[#172033] mb-2">Youth Leadership</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Providing young people in Uzbekistan with the practical framework, leadership skills, and courage to make local impact.
              </p>
            </Card>
          </div>
        </div>

        {/* The Story Behind Our Emblem */}
        <div className="mb-16 bg-white p-8 sm:p-10 rounded-3xl border border-[#BFDBFE] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-[#EBF3FC] rounded-2xl border border-[#BFDBFE]">
              <div className="w-36 h-36 flex items-center justify-center mb-3">
                <SafaLogo variant="mark" size={130} color="#0056D2" />
              </div>
              <span className="text-xl font-serif font-black tracking-wider text-[#172033]">
                SAFA
              </span>
              <span className="text-xs font-semibold text-[#0056D2] mt-0.5">
                Connecting Hands, Changing Lives
              </span>
            </div>
            <div className="lg:col-span-8 text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3FC] text-[#0056D2] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Visual Identity & Slogan</span>
              </div>
              <h3 className="text-2xl font-bold text-[#172033]">
                The Heart, The Reaching Hands & The Flying Dove
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Every element of the SAFA emblem reflects our purpose: the <strong>central heart</strong> represents unreserved empathy and community solidarity; the <strong>two hands reaching toward each other</strong> embody our promise to directly connect those who want to help with those who need it; and the <strong>dove in flight</strong> symbolizes dignity, renewal, and hope for every elderly person, child, and family we serve across Uzbekistan.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#172033] mb-1">The Heart</p>
                  <p className="text-[11px] text-[#64748B]">Authentic compassion without prejudice or pity.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#172033] mb-1">Reaching Hands</p>
                  <p className="text-[11px] text-[#64748B]">Connecting volunteers directly to households.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#172033] mb-1">The Dove</p>
                  <p className="text-[11px] text-[#64748B]">Peace, uplifting care, and barrier-free futures.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white p-8 sm:p-12 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <h3 className="text-2xl font-bold text-[#172033] mb-3">
            Want to Join Hands with SAFA?
          </h3>
          <p className="text-sm text-[#64748B] max-w-xl mx-auto mb-6">
            Whether you want to support with a contribution, volunteer your time on weekends, or propose a neighborhood project, your participation matters.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/support">
              <Button variant="primary" size="md">Support Our Mission</Button>
            </Link>
            <Link to="/volunteer">
              <Button variant="outline" size="md">Become a Volunteer</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
