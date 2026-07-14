import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import {
  LEGAL_ENTITY,
  LEGAL_ENTITY_TYPE,
  LEGAL_ADDRESS,
  SITE_URL,
  CONTACT_EMAIL,
  PRIVACY_EMAIL,
  EFFECTIVE_DATE,
} from '@/lib/config/site';
import { getBaseUrl } from '@/lib/utils/site-url';

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  title: 'Privacy Policy | GoToWorship',
  description:
    'Read the GoToWorship Privacy Policy to learn how we collect, use, share, and protect your personal information in the United States.',
  alternates: { canonical: `${siteUrl}/privacy` },
  openGraph: {
    title: 'Privacy Policy | GoToWorship',
    description:
      'Read the GoToWorship Privacy Policy to learn how we collect, use, share, and protect your personal information.',
    url: `${siteUrl}/privacy`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | GoToWorship',
    description:
      'Read the GoToWorship Privacy Policy to learn how we collect, use, share, and protect your personal information.',
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Card className="border-t-4 border-t-primary-500 p-8 md:p-12">
        <h1 className="mb-4 text-4xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="mb-8 text-sm font-medium text-slate-500">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose max-w-none text-slate-700">
          <p>
            This Privacy Policy describes how {LEGAL_ENTITY} ({LEGAL_ENTITY_TYPE}, doing business as "GoToWorship," "we," "us," or "our") collects, uses, stores, shares, and protects personal information when you visit{' '}
            <a href={SITE_URL} className="text-primary-600 hover:underline">{SITE_URL}</a> (the "Site") or use our services (collectively, the "Services"). By using the Services, you agree to the practices described in this Privacy Policy. If you do not agree, please do not use the Services.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">1. Information we collect</h2>
          <p>We collect the following categories of information:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Identifiers.</strong> Name, email address, phone number, IP address, account username, and device identifiers.
            </li>
            <li>
              <strong>Internet or network activity.</strong> Pages viewed, search queries, referring URL, browser type, operating system, access dates and times, and interactions with the Site.
            </li>
            <li>
              <strong>Geolocation data.</strong> General location derived from your IP address or, with your consent, precise location when you use the "Near Me" feature.
            </li>
            <li>
              <strong>User-generated content.</strong> Listings, events, photos, descriptions, reviews, corrections, and messages you submit.
            </li>
            <li>
              <strong>Professional or employment information.</strong> Organization name and role when you apply for a contributor account.
            </li>
            <li>
              <strong>Sensitive personal information.</strong> We generally do not collect sensitive personal information. If you voluntarily share religious affiliation or similar information, we treat it as sensitive and use it only for the purpose for which it was provided.
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">2. How we collect information</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Directly from you.</strong> When you create an account, submit a listing or event, contact us, or complete a form.
            </li>
            <li>
              <strong>Automatically.</strong> Through cookies, log files, and similar technologies when you browse or interact with the Site.
            </li>
            <li>
              <strong>From third parties.</strong> Publicly available sources, mapping and geocoding services, and service providers that help us operate the Site.
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">3. How we use your information</h2>
          <p>We use personal information for the following business purposes:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>To provide, maintain, and improve the directory and related features.</li>
            <li>To create and manage user accounts and authenticate users.</li>
            <li>To communicate with you about your account, submissions, support requests, and policy updates.</li>
            <li>To verify contributor applications and review user-submitted content.</li>
            <li>To analyze usage trends, monitor performance, and improve user experience.</li>
            <li>To detect, prevent, and address fraud, abuse, security incidents, or technical issues.</li>
            <li>To comply with legal obligations and enforce our Terms of Service.</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">4. Cookies and similar technologies</h2>
          <p>
            We use cookies and similar technologies to keep you signed in, remember your preferences, understand how the Site is used, and prevent abuse. You can manage or disable cookies through your browser settings. If you disable cookies, some features of the Site may not function properly.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">5. How we share your information</h2>
          <p>
            We do not sell or rent your personal information. We may share information with the following categories of recipients:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Service providers.</strong> Hosting, database, authentication, analytics, email, and geocoding providers who process information on our behalf under contractual obligations to protect your data.
            </li>
            <li>
              <strong>Affiliates and successors.</strong> In connection with a merger, acquisition, sale of assets, or other business transfer, subject to confidentiality obligations.
            </li>
            <li>
              <strong>Legal and safety.</strong> When required by law, court order, or government request, or when necessary to protect our rights, property, safety, or the rights of others.
            </li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">6. Data retention</h2>
          <p>
            We retain personal information for as long as necessary to fulfill the purposes described in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. When information is no longer needed, we delete or anonymize it in accordance with our retention schedule.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">7. Data security</h2>
          <p>
            We implement reasonable administrative, technical, and physical safeguards to protect personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">8. Your privacy rights</h2>
          <p>
            Depending on the state in which you reside, you may have the right to:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Access the personal information we hold about you.</li>
            <li>Request correction of inaccurate or incomplete information.</li>
            <li>Request deletion of your personal information, subject to legal exceptions.</li>
            <li>Opt out of the sale or sharing of personal information (we do not sell personal information).</li>
            <li>Limit the use of sensitive personal information, where applicable.</li>
            <li>Withdraw consent where processing is based on consent.</li>
            <li>Non-discrimination for exercising your privacy rights.</li>
          </ul>
          <p>
            To exercise your rights, email us at{' '}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary-600 hover:underline">
              {PRIVACY_EMAIL}
            </a>
            . We may need to verify your identity before processing your request. Authorized agents must provide proof of authorization.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">9. Notice to California residents</h2>
          <p>
            Under the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA), California residents have the rights listed above. The categories of personal information we collect and the purposes for which we use them are described in Sections 1 and 3. We do not sell personal information. We do not share personal information for cross-context behavioral advertising.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">10. Children&apos;s privacy</h2>
          <p>
            The Services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at{' '}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary-600 hover:underline">
              {PRIVACY_EMAIL}
            </a>{' '}
            so we can delete it.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">11. Third-party links</h2>
          <p>
            The Site may contain links to third-party websites or services, including the official websites of listed places of worship. We are not responsible for the privacy practices or content of those third parties. We encourage you to review their privacy policies before providing any personal information.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">12. Changes to this Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we make material changes, we will revise the effective date at the top of this page and, where appropriate, notify you by email or through the Site. Your continued use of the Services after the changes take effect constitutes acceptance of the revised policy.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">13. Contact us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Email:{' '}
              <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary-600 hover:underline">
                {PRIVACY_EMAIL}
              </a>
            </li>
            <li>
              General inquiries:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 hover:underline">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              Mailing address: {LEGAL_ENTITY}, {LEGAL_ADDRESS.street}, {LEGAL_ADDRESS.city}, {LEGAL_ADDRESS.state} {LEGAL_ADDRESS.zip}
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
