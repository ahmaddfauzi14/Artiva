import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LegacyCuratorWinnersRedirect({ params }) {
  const { id } = await params;
  redirect(`/curator/challenges/${id}/winners`);
}
