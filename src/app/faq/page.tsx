import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { CONTACT_EMAIL, PRIVACY_EMAIL, SUPPORT_EMAIL } from '@/lib/config/site';
import { getBaseUrl } from '@/lib/utils/site-url';

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | GoToWorship',
  description:
    'Answers to common questions about finding places of worship, creating an account, submitting events, listing accuracy, privacy, and legal policies on GoToWorship.',
  alternates: { canonical: `${siteUrl}/faq` },
  openGraph: {
    title: 'Frequently Asked Questions | GoToWorship',
    description:
      'Answers to common questions about finding places of worship, creating an account, submitting events, listing accuracy, privacy, and legal policies.',
    url: `${siteUrl}/faq`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions | GoToWorship',
    description:
      'Answers to common questions about finding places of worship, creating an account, submitting events, listing accuracy, privacy, and legal policies.',
  },
};

export default function FaqPage() {
  const sections = [
    {
      title: 'General',
      items: [
        {
          question: 'What is GoToWorship?',
          answer:
            'GoToWorship is an online directory that helps people find places of worship across the United States, including churches, mosques, synagogues, temples, gurdwaras, shrines, and other sacred spaces.',
        },
        {
          question: 'Is GoToWorship free to use?',
          answer:
            'Yes. Searching, browsing, viewing listings, and bookmarking places of worship is completely free for all visitors. Some advanced contributor features require a free registered account and admin approval.',
        },
        {
          question: 'Does GoToWorship endorse any religion or congregation?',
          answer:
            'No. We provide neutral directory information and do not endorse any particular faith, denomination, or congregation. Visitors should always verify details directly with the place of worship.',
        },
      ],
    },
    {
      title: 'Using the directory',
      items: [
        {
          question: 'How do I find a place of worship near me?',
          answer:
            'Use the Near Me page to detect your current location, enter a city or state on the homepage, or browse the Locations page by state and city.',
        },
        {
          question: 'Can I save my favorite places?',
          answer:
            'Yes. Registered users can bookmark places and view them later from their account dashboard. Bookmarks are private to your account.',
        },
        {
          question: 'How do I report incorrect information?',
          answer:
            'Please visit our Contact Us page or email us at ' +
            SUPPORT_EMAIL +
            '. Include the listing name, the correction, and a source if possible. We review all reports and update listings as needed.',
        },
      ],
    },
    {
      title: 'Accounts and contributors',
      items: [
        {
          question: 'Do I need an account to use GoToWorship?',
          answer:
            'No. You can search and browse listings without an account. An account is only required for bookmarking places, submitting events, or applying to become a contributor.',
        },
        {
          question: 'How can I add my place of worship to the directory?',
          answer:
            'If you represent a congregation or community, sign up for a free account and apply to become a contributor. After admin approval, you can submit events and suggest listing updates. Bulk imports can also be arranged through the admin dashboard.',
        },
        {
          question: 'How long does contributor approval take?',
          answer:
            'Contributor applications are typically reviewed within 1-3 business days. You will be notified by email once your account is approved or if we need additional information.',
        },
        {
          question: 'How do I submit an event?',
          answer:
            'Approved contributors can submit events from their account dashboard. Each event is reviewed by an admin before it appears on the platform.',
        },
      ],
    },
    {
      title: 'Listings and data',
      items: [
        {
          question: 'Where does listing information come from?',
          answer:
            'Listing information comes from publicly available sources, direct submissions from congregations, and approved contributor submissions. We use automated checks and manual review to improve accuracy.',
        },
        {
          question: 'How do I update or remove a listing?',
          answer:
            'If you are authorized to represent the congregation, contact us at ' +
            SUPPORT_EMAIL +
            ' with the listing URL and the requested changes. We will review and process your request as quickly as possible.',
        },
        {
          question: 'Why is a listing missing or outdated?',
          answer:
            'Religious communities change locations, schedules, and contact information frequently. If you see a missing or outdated listing, please let us know so we can correct it.',
        },
      ],
    },
    {
      title: 'Privacy, safety, and legal',
      items: [
        {
          question: 'Do you share or sell my personal information?',
          answer:
            'We do not sell your personal information. We share information only with service providers who help us operate the platform and only as described in our Privacy Policy.',
        },
        {
          question: 'What are my privacy rights?',
          answer:
            'Depending on your state of residence, you may have rights to access, correct, delete, or opt out of the sale or sharing of your personal information. For requests, contact us at ' +
            PRIVACY_EMAIL +
            '.',
        },
        {
          question: 'Is GoToWorship safe for children?',
          answer:
            'GoToWorship is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately so we can delete it.',
        },
        {
          question: 'How do I contact the GoToWorship team?',
          answer:
            'You can reach us by email at ' +
            CONTACT_EMAIL +
            ' or through our Contact Us page. For privacy questions, use ' +
            PRIVACY_EMAIL +
            '.',
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Card className="border-t-4 border-t-primary-500 p-8 md:p-12">
        <h1 className="mb-4 text-4xl font-extrabold text-slate-900">Frequently Asked Questions</h1>
        <p className="mb-8 text-slate-600">
          Quick answers about using GoToWorship, managing your account, submitting content, and understanding our policies.
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-5 text-xl font-bold text-slate-900">{section.title}</h2>
              <div className="space-y-6">
                {section.items.map((faq, index) => (
                  <div key={index} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                    <h3 className="mb-2 text-base font-bold text-slate-900">{faq.question}</h3>
                    <p className="text-slate-700">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Card>
    </div>
  );
}
