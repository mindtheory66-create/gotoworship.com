'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  q: string;
  a: string;
}

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  return (
    <div>
      <h2 className="mb-5 text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-100 bg-white">
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-semibold text-slate-900">{faq.q}</span>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open === idx ? 'rotate-180' : ''}`} />
            </button>
            {open === idx && (
              <div className="px-5 pb-4 text-sm leading-relaxed text-slate-600">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
