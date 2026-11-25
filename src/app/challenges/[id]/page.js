import { notFound } from 'next/navigation';
import ChallengeDetailView from '@/components/features/challenges/ChallengeDetailView';
import PublicShell from '@/components/layout/PublicShell';
import { getPublicViewer } from '@/lib/auth/page-guards';
import {
  getChallengeMetadataByIdParam,
  loadPublicChallengeDetail,
} from '@/lib/server/challenge-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  return getChallengeMetadataByIdParam(params);
}

export default async function ChallengeDetailPage({ params }) {
  const viewer = await getPublicViewer();
  const { id } = await params;
  const data = await loadPublicChallengeDetail(id);

  if (!data) {
    notFound();
  }

  return (
    <PublicShell user={viewer} mainClassName="space-y-8 py-6 sm:py-8">
      <ChallengeDetailView
        challenge={data.challenge}
        submissionsData={data.submissionsData}
        winners={data.winners}
        viewer={viewer}
      />
    </PublicShell>
  );
}
