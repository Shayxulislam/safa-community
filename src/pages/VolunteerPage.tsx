import React, { useState } from 'react';
import { Users, CheckCircle2, Heart, Sparkles, Send, ArrowRight } from 'lucide-react';
import { storage } from '../services/storage';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const VolunteerPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneOrTelegram, setPhoneOrTelegram] = useState('');
  const [city, setCity] = useState('Tashkent');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('Weekends');
  const [interests, setInterests] = useState<string[]>(['Home Visits & Companionship']);
  const [isConfirmedAge, setIsConfirmedAge] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const interestOptions = [
    'Home Visits & Companionship',
    'Winter Warmth Distribution & Packaging',
    'Accessibility Ramp Construction',
    'Social Media, Photography & Content',
    'Logistics & Transportation',
    'Medical & Health Companion Care'
  ];

  const handleInterestToggle = (opt: string) => {
    if (interests.includes(opt)) {
      setInterests(interests.filter(i => i !== opt));
    } else {
      setInterests([...interests, opt]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phoneOrTelegram) {
      alert('Please complete all required fields.');
      return;
    }
    if (!isConfirmedAge) {
      alert('You must confirm you are at least 16 years of age to volunteer.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send to server endpoint
      await fetch('/api/v1/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone: phoneOrTelegram,
          city,
          skills,
          availability,
          interests,
          isLegalAgeConfirmed: isConfirmedAge
        })
      });
    } catch {
      // Network / offline fallback
    }

    storage.addVolunteer({
      fullName,
      email,
      phoneOrTelegram,
      city,
      skills,
      availability,
      interests
    });

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <SectionHeader
          badge="Youth & Community Mobilization"
          badgeIcon={<Users className="w-3.5 h-3.5" />}
          title="Join the SAFA Volunteer Network"
          description="Be the direct connection. Join hundreds of passionate young people across Uzbekistan visiting elders, packing relief parcels, and making real community impact."
        />

        {isSuccess ? (
          <div className="p-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#172033] mb-2">
              Application Received!
            </h3>
            <p className="text-sm text-[#64748B] max-w-md mx-auto mb-6">
              Thank you, <strong>{fullName}</strong>. Our volunteer coordination team will review your details and contact you via <strong>{phoneOrTelegram}</strong> before our next orientation briefing.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="primary" size="md" onClick={() => setIsSuccess(false)}>
                Submit Another Application
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <form onSubmit={handleSubmit}>
                <Card className="p-6 sm:p-8 space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jasur Alimov"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] focus:border-[#1565C0] outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. jasur@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] focus:border-[#1565C0] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                        Phone or Telegram Handle *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +998 XX XXX XX XX or @your_handle"
                        value={phoneOrTelegram}
                        onChange={e => setPhoneOrTelegram(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] focus:border-[#1565C0] outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                        City / Region
                      </label>
                      <select
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] focus:border-[#1565C0] outline-hidden"
                      >
                        <option value="Tashkent">Tashkent City</option>
                        <option value="Samarkand">Samarkand</option>
                        <option value="Bukhara">Bukhara</option>
                        <option value="Fergana">Fergana Valley</option>
                        <option value="Andijan">Andijan</option>
                        <option value="Namangan">Namangan</option>
                        <option value="Nukus">Karakalpakstan / Nukus</option>
                        <option value="Other">Other Region in Uzbekistan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                        General Availability
                      </label>
                      <select
                        value={availability}
                        onChange={e => setAvailability(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] focus:border-[#1565C0] outline-hidden"
                      >
                        <option value="Weekends">Weekends Only</option>
                        <option value="Weekday Evenings">Weekday Afternoons / Evenings</option>
                        <option value="Flexible">Flexible On-Call</option>
                        <option value="Remote / Digital">Remote / Online Support</option>
                      </select>
                    </div>
                  </div>

                  {/* Areas of Interest */}
                  <div>
                    <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                      Areas You Wish to Support
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {interestOptions.map(opt => (
                        <label
                          key={opt}
                          className={`p-3 rounded-lg border text-xs font-medium cursor-pointer flex items-center gap-2.5 transition-colors ${
                            interests.includes(opt)
                              ? 'bg-[#EAF4FF] border-[#1565C0] text-[#0D47A1]'
                              : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={interests.includes(opt)}
                            onChange={() => handleInterestToggle(opt)}
                            className="rounded text-[#1565C0] focus:ring-[#1565C0]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-1.5">
                      Relevant Skills or Background (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Medical student, driving license, photography, event organization..."
                      value={skills}
                      onChange={e => setSkills(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] focus:border-[#1565C0] outline-hidden"
                    />
                  </div>

                  {/* Age confirmation checkbox */}
                  <div className="flex items-start gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="ageCheck"
                      required
                      checked={isConfirmedAge}
                      onChange={e => setIsConfirmedAge(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1565C0] border-[#E2E8F0] mt-0.5"
                    />
                    <label htmlFor="ageCheck" className="text-xs text-[#64748B] cursor-pointer">
                      I confirm that I am at least 16 years of age and agree to uphold the dignity, confidentiality, and respect of all community members visited.
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full shadow-md"
                    icon={<Send className="w-4 h-4" />}
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Volunteer Application'}
                  </Button>
                </Card>
              </form>
            </div>

            {/* Sidebar Guidelines */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 text-[#0D47A1] font-bold text-sm mb-3">
                  <Sparkles className="w-4 h-4" />
                  <span>Why Volunteer with SAFA?</span>
                </div>
                <ul className="space-y-3 text-xs text-[#64748B] leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                    <span>Real field involvement directly in mahallas and homes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                    <span>Active youth community networking and leadership training.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                    <span>Official certificate of community contribution on completion.</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-[#EAF4FF] border-[#cbe4ff]">
                <h4 className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider mb-2">
                  Code of Conduct
                </h4>
                <p className="text-xs text-[#0D47A1] leading-relaxed">
                  Volunteers represent SAFA's commitment to warmth and dignity. No photography is allowed without verified participant consent.
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
