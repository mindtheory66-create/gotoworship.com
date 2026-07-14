import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { ContactForm } from '@/components/contact/contact-form';
import { Mail, MapPin, Phone, Clock, MessageCircle, ShieldCheck } from 'lucide-react';
import {
  CONTACT_EMAIL,
  SUPPORT_EMAIL,
  LEGAL_EMAIL,
  PRIVACY_EMAIL,
  LEGAL_PHONE,
  LEGAL_ADDRESS,
  LEGAL_ENTITY,
  LEGAL_ENTITY_TYPE,
} from '@/lib/config/site';
import { getBaseUrl } from '@/lib/utils/site-url';

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  title: 'Contact Us | GoToWorship',
  description:
    'Contact GoToWorship for questions, feedback, partnership opportunities, listing updates, and support. We typically respond within 1-2 business days.',
  alternates: { canonical: `${siteUrl}/contact` },
  openGraph: {
    title: 'Contact Us | GoToWorship',
    description:
      'Contact GoToWorship for questions, feedback, partnership opportunities, listing updates, and support.',
    url: `${siteUrl}/contact`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | GoToWorship',
    description:
      'Contact GoToWorship for questions, feedback, partnership opportunities, listing updates, and support.',
  },
};

export default function ContactPage() {
  const addressLine = `${LEGAL_ADDRESS.street}, ${LEGAL_ADDRESS.city}, ${LEGAL_ADDRESS.state} ${LEGAL_ADDRESS.zip}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-4xl font-extrabold text-slate-900">Contact Us</h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          We are here to help. Whether you have a question, a correction, a partnership idea, or a privacy concern, our team will do our best to respond within 1-2 business days.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-t-4 border-t-primary-500 p-6">
            <h2 className="mb-5 text-xl font-bold text-slate-900">How to reach us</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">General inquiries</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-slate-600 hover:text-primary-600 hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Support</p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-slate-600 hover:text-primary-600 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Privacy & legal</p>
                  <a
                    href={`mailto:${PRIVACY_EMAIL}`}
                    className="block text-slate-600 hover:text-primary-600 hover:underline"
                  >
                    {PRIVACY_EMAIL}
                  </a>
                  <a
                    href={`mailto:${LEGAL_EMAIL}`}
                    className="block text-slate-600 hover:text-primary-600 hover:underline"
                  >
                    {LEGAL_EMAIL}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Phone</p>
                  <p className="text-slate-600">{LEGAL_PHONE}</p>
                  <p className="text-xs text-slate-500">Voicemail only; email is preferred.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Mailing address</p>
                  <p className="text-slate-600">{LEGAL_ENTITY}</p>
                  <p className="text-slate-600">{addressLine}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Response hours</p>
                  <p className="text-slate-600">Monday - Friday</p>
                  <p className="text-slate-600">9:00 AM - 5:00 PM ET</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-3 text-lg font-bold text-slate-900">Operating entity</h2>
            <p className="text-sm text-slate-600">
              GoToWorship is operated by {LEGAL_ENTITY}, {LEGAL_ENTITY_TYPE}. For service of legal process, please use the mailing address or {LEGAL_EMAIL} shown above.
            </p>
          </Card>
        </div>

        <Card className="p-8 lg:col-span-2">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Send a message</h2>
          <ContactForm />
        </Card>
      </div>
    </div>
  );
}
