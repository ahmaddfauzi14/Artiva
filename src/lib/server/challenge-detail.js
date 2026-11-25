import {
  findPublicChallengeById,
  listChallengeWinners,
  listPublicChallengeSubmissions,
} from '@/lib/repositories/challenges';
import { todayInTz } from '@/lib/server/challenge-status';
import { loadPublicArtworkDetail } from '@/lib/server/artwork-detail';
import { getEligibleArtworksForMember } from '@/lib/services/submissions';

/**
 * Menghasilkan metadata halaman detail tantangan berdasarkan parameter ID rute.
 */
export async function getChallengeMetadataByIdParam(params) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return { title: 'Tantangan Tidak Ditemukan · ARTIVA' };
  }
  const challenge = await findPublicChallengeById(numId);
  return {
    title: challenge
      ? `${challenge.title} · ARTIVA`
      : 'Tantangan Tidak Ditemukan · ARTIVA',
  };
}

/**
 * Memuat data tantangan publik beserta daftar submission dan pemenangnya.
 */
export async function loadPublicChallengeDetail(idParam) {
  const challengeId = Number(idParam);
  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    return null;
  }

  const challenge = await findPublicChallengeById(challengeId);
  if (!challenge) {
    return null;
  }

  const [submissionsData, winners] = await Promise.all([
    listPublicChallengeSubmissions(challengeId, { page: 1, limit: 24 }),
    challenge.status === 'announced' ? listChallengeWinners(challengeId) : [],
  ]);

  return { challengeId, challenge, submissionsData, winners };
}

/**
 * Memuat data karya publik di dalam konteks tantangan tertentu.
 */
export async function loadChallengeArtworkDetail(
  challengeIdParam,
  artworkIdParam,
  viewerUserId = null
) {
  const challengeId = Number(challengeIdParam);
  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    return null;
  }

  const [challenge, artworkData] = await Promise.all([
    findPublicChallengeById(challengeId),
    loadPublicArtworkDetail(artworkIdParam, viewerUserId),
  ]);

  if (!challenge || !artworkData) {
    return null;
  }

  return { challengeId, challenge, ...artworkData };
}

/**
 * Memuat data tantangan dan karya yang memenuhi syarat untuk halaman submit.
 */
export async function loadChallengeSubmitData(userId, idParam) {
  const challengeId = Number(idParam);
  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    return null;
  }

  let data;
  try {
    data = await getEligibleArtworksForMember(userId, challengeId);
  } catch {
    return null;
  }

  const today = todayInTz();
  const isOpenWindow =
    data.challenge.status === 'open' &&
    data.challenge.start_date <= today &&
    today <= data.challenge.end_date;

  return { challengeId, ...data, isOpenWindow };
}
