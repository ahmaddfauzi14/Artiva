import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LegacyMemberEditArtworkRedirect({ params }) {
  const { id } = await params;
  redirect(`/me/artworks/${id}/edit`);
}
