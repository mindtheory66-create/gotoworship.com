import type { Metadata } from 'next';
import NearMeContent from './near-me-content';

export const metadata: Metadata = {
  title: 'Places Near Me | GoToWorship',
  description: 'Find places of worship near your current location.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NearMePage() {
  return <NearMeContent />;
}
