// app/link/page.tsx
import { Metadata } from 'next';
import { getBioSettings, getBioLinks } from '@/lib/appwrite/api';
import BioPageView from './components/BioPageView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBioSettings();
  return {
    title: `${settings.title} | الروابط الرسمية وقنوات التواصل`,
    description: settings.bio,
    openGraph: {
      title: `${settings.title} | الروابط الرسمية`,
      description: settings.bio,
      url: 'https://alwasitastore.com/link',
      images: [
        {
          url: '/mylogo.png',
          width: 500,
          height: 500,
          alt: settings.title,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: settings.title,
      description: settings.bio,
      images: ['/mylogo.png'],
    },
  };
}

export default async function BioLinkPage() {
  const [settings, links] = await Promise.all([
    getBioSettings(),
    getBioLinks(false),
  ]);

  return (
    <BioPageView
      initialSettings={settings}
      initialLinks={links}
      storeLogo="/mylogo.png"
    />
  );
}
