import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import {
  LEGAL_ENTITY,
  LEGAL_ENTITY_TYPE,
  LEGAL_ADDRESS,
  CONTACT_EMAIL,
  SITE_URL,
} from '@/lib/config/site';
import { getBaseUrl } from '@/lib/utils/site-url';

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  title: 'About Us | GoToWorship',
  description:
    'Learn about GoToWorship, a U.S. place-of-worship directory helping people find churches, mosques, synagogues, temples, and sacred spaces in their community.',
  alternates: { canonical: `${siteUrl}/about` },
  openGraph: {
    title: 'About Us | GoToWorship',
    description:
      'Learn about GoToWorship, a U.S. place-of-worship directory helping people find churches, mosques, synagogues, temples, and sacred spaces.',
    url: `${siteUrl}/about`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | GoToWorship',
    description:
      'Learn about GoToWorship, a U.S. place-of-worship directory helping people find churches, mosques, synagogues, temples, and sacred spaces.',
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Card className="border-t-4 border-t-primary-500 p-8 md:p-12">
        <h1 className="mb-8 text-4xl font-extrabold text-slate-900">About Us</h1>
        <div className="prose max-w-none text-slate-700">
          <p>
            GoToWorship is an online directory dedicated to helping people across the United States discover welcoming places of worship. Whether you are looking for a church, mosque, synagogue, temple, gurdwara, shrine, or another sacred gathering space, we strive to make the search simple, respectful, and reliable.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">Who we are</h2>
          <p>
            GoToWorship is operated by {LEGAL_ENTITY}, {LEGAL_ENTITY_TYPE}. Our mailing address is {LEGAL_ADDRESS.street}, {LEGAL_ADDRESS.city}, {LEGAL_ADDRESS.state} {LEGAL_ADDRESS.zip}. You can reach us anytime at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">Our mission</h2>
          <p>
            We believe everyone deserves an easy, dignified way to connect with faith communities. Our mission is to maintain the most complete, accurate, and inclusive directory of places of worship in the United States, built with care for every tradition and background.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">What we offer</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Search and browse places of worship by city, state, religious tradition, or denomination.</li>
            <li>Detailed listings with service times, address, phone, website, directions, and accessibility notes.</li>
            <li>Community event listings submitted by verified contributors.</li>
            <li>Free account features such as bookmarking favorite places and saving searches.</li>
            <li>Quality signals, verification badges, and clear sources so users can trust what they see.</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">Editorial standards</h2>
          <p>
            Listing information comes from publicly available sources, direct submissions from congregations, and contributions from approved community members. We review contributor submissions before publication and use automated and manual checks to improve accuracy.
          </p>
          <p>
            GoToWorship does not endorse any particular religion, congregation, or belief system. We provide factual directory information only. Visitors should always confirm service times, addresses, and event details directly with the place of worship before attending.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">For communities and contributors</h2>
          <p>
            Congregations and community leaders can request listing updates or apply for a contributor account to submit events and enrichment content. All contributor accounts are reviewed before they can publish, and all submissions remain subject to our{' '}
            <a href="/terms" className="text-primary-600 hover:underline">Terms of Service</a> and{' '}
            <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">Nondiscrimination and accessibility</h2>
          <p>
            We are committed to inclusion. GoToWorship welcomes listings from all faith communities and traditions. We do not discriminate on the basis of religion, race, ethnicity, national origin, disability, gender, sexual orientation, or any other protected characteristic. If you encounter a barrier to using our site, please contact us so we can improve.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">Get in touch</h2>
          <p>
            Questions, feedback, or corrections? We would love to hear from you. Visit our{' '}
            <a href="/contact" className="text-primary-600 hover:underline">Contact Us</a> page or email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </Card>
    </div>
  );
}
