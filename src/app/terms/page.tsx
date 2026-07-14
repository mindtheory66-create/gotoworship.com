import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import {
  LEGAL_ENTITY,
  LEGAL_ENTITY_TYPE,
  LEGAL_ADDRESS,
  SITE_URL,
  CONTACT_EMAIL,
  LEGAL_EMAIL,
  EFFECTIVE_DATE,
  GOVERNING_STATE,
  ARBITRATION_LOCATION,
} from '@/lib/config/site';
import { getBaseUrl } from '@/lib/utils/site-url';

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  title: 'Terms of Service | GoToWorship',
  description:
    'Read the GoToWorship Terms of Service for rules, disclaimers, intellectual property, dispute resolution, and legal terms governing use of our platform.',
  alternates: { canonical: `${siteUrl}/terms` },
  openGraph: {
    title: 'Terms of Service | GoToWorship',
    description:
      'Read the GoToWorship Terms of Service for rules, disclaimers, intellectual property, dispute resolution, and legal terms.',
    url: `${siteUrl}/terms`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | GoToWorship',
    description:
      'Read the GoToWorship Terms of Service for rules, disclaimers, intellectual property, dispute resolution, and legal terms.',
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Card className="border-t-4 border-t-primary-500 p-8 md:p-12">
        <h1 className="mb-4 text-4xl font-extrabold text-slate-900">Terms of Service</h1>
        <p className="mb-8 text-sm font-medium text-slate-500">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose max-w-none text-slate-700">
          <p>
            These Terms of Service ("Terms") are a legal agreement between you and {LEGAL_ENTITY} ({LEGAL_ENTITY_TYPE}, "GoToWorship," "we," "us," or "our") governing your access to and use of the website located at{' '}
            <a href={SITE_URL} className="text-primary-600 hover:underline">{SITE_URL}</a> (the "Site") and any related services (collectively, the "Services"). Please read these Terms carefully. By accessing or using the Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use the Services.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">1. Acceptance and changes</h2>
          <p>
            By creating an account, browsing listings, submitting events or other content, or otherwise using the Services, you represent that you have read, understood, and agree to these Terms and our Privacy Policy. We may modify these Terms from time to time. Material changes will be posted on this page with an updated effective date. Your continued use of the Services after changes take effect constitutes acceptance of the revised Terms.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">2. Eligibility</h2>
          <p>
            The Services are intended for users located in the United States. You must be at least 13 years old to browse the Site. To create an account or submit content, you must be at least 18 years old or the age of legal majority in your jurisdiction, and capable of forming a binding contract. If you are using the Services on behalf of an organization, you represent that you are authorized to bind that organization.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">3. User accounts</h2>
          <p>
            To access certain features, such as bookmarking places or submitting events, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use. Contributor accounts require admin approval before they can publish content.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">4. User-submitted content</h2>
          <p>
            Users and contributors may submit listings, events, photos, descriptions, corrections, comments, or other content ("User Content"). By submitting User Content, you grant GoToWorship a non-exclusive, worldwide, royalty-free, sublicensable, and transferable license to use, reproduce, modify, display, distribute, and publish that content in connection with the Services. You retain ownership of your original content.
          </p>
          <p>
            You represent and warrant that: (a) you own or have the necessary rights to submit the User Content; (b) the content is accurate to the best of your knowledge; (c) the content does not violate any third-party rights, including copyright, trademark, privacy, or publicity rights; and (d) the content complies with these Terms and all applicable laws.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">5. Prohibited conduct</h2>
          <p>You agree not to use the Services to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Post false, misleading, fraudulent, defamatory, obscene, hateful, or illegal content.</li>
            <li>Harass, threaten, intimidate, or discriminate against any person or group.</li>
            <li>Impersonate any person or entity or misrepresent your affiliation.</li>
            <li>Attempt to access accounts, data, or systems without authorization.</li>
            <li>Use automated tools, bots, scrapers, or spiders to access or collect data from the Site without our written permission.</li>
            <li>Interfere with the security or availability of the Services, or upload viruses, malware, or harmful code.</li>
            <li>Use the Services for unsolicited advertising, spam, or pyramid schemes.</li>
          </ul>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">6. Content moderation and termination</h2>
          <p>
            We reserve the right, but not the obligation, to review, edit, remove, or refuse any User Content for any reason, including violations of these Terms. We may suspend or terminate your account and access to the Services at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">7. Intellectual property</h2>
          <p>
            The GoToWorship name, logo, design, layout, graphics, software, and original content created by our team are owned by GoToWorship or our licensors and are protected by copyright, trademark, and other intellectual property laws. You may not use our branding or content without prior written permission, except as expressly permitted by these Terms.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">8. Copyright policy and DMCA</h2>
          <p>
            We respect the intellectual property rights of others. If you believe that content on the Site infringes your copyright, please send a written notice to our designated copyright agent at{' '}
            <a href={`mailto:${LEGAL_EMAIL}`} className="text-primary-600 hover:underline">
              {LEGAL_EMAIL}
            </a>{' '}
            including: (a) your physical or electronic signature; (b) identification of the copyrighted work; (c) identification of the infringing material and its location on the Site; (d) your contact information; (e) a statement that you have a good-faith belief the use is unauthorized; and (f) a statement under penalty of perjury that the information is accurate and that you are the copyright owner or authorized to act on behalf of the owner.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">9. Disclaimers</h2>
          <p>
            THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. LISTING INFORMATION IS PROVIDED BY COMMUNITY MEMBERS, PLACE REPRESENTATIVES, AND PUBLIC SOURCES, AND WE DO NOT GUARANTEE THAT IT IS COMPLETE, ACCURATE, OR CURRENT.
          </p>
          <p>
            GoToWorship is a neutral directory. We do not endorse any place of worship, religious leader, event, or belief system. Visitors should independently verify all information before attending services or events.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">10. Limitation of liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, GO TOWORSHIP, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THESE TERMS OR THE SERVICES WILL NOT EXCEED THE GREATER OF ONE HUNDRED U.S. DOLLARS (US $100) OR THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">11. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless GoToWorship and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys&apos; fees) arising out of or relating to your User Content, your use of the Services, your violation of these Terms, or your violation of any rights of a third party.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">12. Dispute resolution and arbitration</h2>
          <p>
            Please read this section carefully. It affects your legal rights.
          </p>
          <p>
            <strong>Informal resolution.</strong> Before filing any claim, you agree to try to resolve the dispute informally by contacting us at{' '}
            <a href={`mailto:${LEGAL_EMAIL}`} className="text-primary-600 hover:underline">
              {LEGAL_EMAIL}
            </a>
            . We will attempt to resolve the dispute within 60 days.
          </p>
          <p>
            <strong>Binding arbitration.</strong> If informal resolution fails, any dispute, claim, or controversy arising out of or relating to these Terms or the Services will be resolved exclusively through binding arbitration administered by JAMS in accordance with its Consumer Arbitration Rules, held in {ARBITRATION_LOCATION}. Judgment on the arbitration award may be entered in any court of competent jurisdiction.
          </p>
          <p>
            <strong>Class action waiver.</strong> YOU AGREE THAT ANY PROCEEDINGS, WHETHER IN ARBITRATION OR COURT, WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT AS A CLASS ACTION, COLLECTIVE ACTION, PRIVATE ATTORNEY GENERAL ACTION, OR REPRESENTATIVE ACTION. The arbitrator may not consolidate more than one person&apos;s claims or preside over any form of representative or class proceeding.
          </p>
          <p>
            <strong>Opt-out.</strong> You may opt out of this arbitration agreement within 30 days of first accepting these Terms by sending an email to{' '}
            <a href={`mailto:${LEGAL_EMAIL}`} className="text-primary-600 hover:underline">
              {LEGAL_EMAIL}
            </a>{' '}
            with your name, address, and a clear statement that you wish to opt out of arbitration. If you opt out, disputes will be resolved in the state or federal courts located in {ARBITRATION_LOCATION}.
          </p>
          <p>
            <strong>Exceptions.</strong> Either party may bring an individual action in small claims court or seek injunctive or other equitable relief in a court of competent jurisdiction for intellectual property or confidentiality matters.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">13. Governing law and venue</h2>
          <p>
            These Terms and any dispute arising out of them will be governed by the laws of the State of {GOVERNING_STATE}, without regard to conflict-of-law principles. Subject to the arbitration section above, any legal action must be brought in the state or federal courts located in {ARBITRATION_LOCATION}.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">14. General provisions</h2>
          <p>
            If any provision of these Terms is held invalid or unenforceable, the remaining provisions will remain in full force and effect. Our failure to enforce any right or provision will not be considered a waiver. These Terms, together with our Privacy Policy, constitute the entire agreement between you and GoToWorship regarding the Services.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-slate-900">15. Contact us</h2>
          <p>
            If you have questions about these Terms, please contact us:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Legal inquiries:{' '}
              <a href={`mailto:${LEGAL_EMAIL}`} className="text-primary-600 hover:underline">
                {LEGAL_EMAIL}
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
