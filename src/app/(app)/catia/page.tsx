import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CatiaView } from '@/components/features/catia';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CatIA',
};

export default async function CatiaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return <CatiaView />;
}
