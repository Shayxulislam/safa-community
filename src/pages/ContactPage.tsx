import React, { useState } from 'react';
import { Mail, Send, MapPin, CheckCircle2, MessageSquare } from 'lucide-react';
import { storage } from '../services/storage';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });
    } catch {
      // Offline / network fallback
    }

    storage.addContactMessage({ name, email, subject, message });

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <SectionHeader
          badge="Direct Contact"
          badgeIcon={<Mail className="w-3.5 h-3.5" />}
          title="Get in Touch with SAFA Uzbekistan"
          description="Have an inquiry about an initiative, want to suggest a family or elderly neighbor needing support, or explore institutional partnerships? Contact us directly."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-7">
            {isSuccess ? (
              <Card className="p-8 text-center bg-white">
                <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#172033] mb-2">Message Dispatched!</h3>
                <p className="text-sm text-[#64748B] mb-6">
                  Thank you for reaching out. A coordinator from SAFA will reply to <strong>{email}</strong> within 24–48 hours.
                </p>
                <Button variant="outline" size="sm" onClick={() => setIsSuccess(false)}>
                  Send Another Message
                </Button>
              </Card>
            ) : (
              <form onSubmit={handleSubmit}>
                <Card className="p-6 sm:p-8 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kamola Rahimova"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] focus:border-[#1565C0] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. kamola@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] focus:border-[#1565C0] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Proposing a visit in Chilanzar district"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] focus:border-[#1565C0] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please describe how we can assist or collaborate..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#172033] focus:border-[#1565C0] outline-hidden"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full shadow-md"
                    icon={<Send className="w-4 h-4" />}
                  >
                    {isSubmitting ? 'Sending Message...' : 'Send Message'}
                  </Button>
                </Card>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6">
              <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider mb-4">
                Official Direct Contacts
              </h4>
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF4FF] text-[#0D47A1] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Public Inquiries & Verification</span>
                    <a href="mailto:safaauzb@gmail.com" className="font-bold text-[#0D47A1] hover:underline text-sm font-mono">
                      safaauzb@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF4FF] text-[#0D47A1] flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Official Telegram</span>
                    <a href="https://t.me/SafaUzbekistan" target="_blank" rel="noopener noreferrer" className="font-bold text-[#0D47A1] hover:underline text-sm font-mono">
                      t.me/SafaUzbekistan
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF4FF] text-[#0D47A1] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Headquarters & Coordination</span>
                    <span className="font-semibold text-[#172033]">
                      Tashkent, Republic of Uzbekistan
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-[#EAF4FF] border-[#cbe4ff]">
              <h4 className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider mb-2">
                Need Rapid Assistance for an Elder?
              </h4>
              <p className="text-xs text-[#0D47A1] leading-relaxed">
                If an elderly neighbor or person with a severe mobility restriction urgently needs basic medication or warm clothing, mention "URGENT NEIGHBOR VISIT" in your message subject.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
