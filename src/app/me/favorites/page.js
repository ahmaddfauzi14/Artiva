import ArtworkCard from '@/components/cards/ArtworkCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/layout/PageHeader';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listUserFavorites } from '@/lib/repositories/interactions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Favorit · ARTIVA',
};

export default async function MemberFavoritesPage() {
  const user = await requirePageRole('member', '/me/favorites');
  const myFavorites = await listUserFavorites(user.user_id, {
    page: 1,
    limit: 48,
  });
  const favorites = myFavorites.items || [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="SIMPANAN INSPIRASI"
        title="Favorit"
        subtitle="Kumpulan karya komunitas yang kamu simpan sebagai favorit."
        rightSlot={
          <Button variant="secondary" href="/artworks">
            Jelajahi karya →
          </Button>
        }
      />

      {favorites.length === 0 ? (
        <EmptyState
          title="Simpan yang menginspirasimu."
          description="Belum ada karya favorit tersimpan. Jelajahi galeri dan tandai karya yang paling berkesan."
          actionLabel="Jelajahi karya →"
          actionHref="/artworks"
        />
      ) : (
        <div
          className={`auto-grid-cards gap-6 ${
            favorites.length === 1 ? 'max-w-sm' : ''
          }`}
        >
          {favorites.map((art, idx) => (
            <ArtworkCard
              key={art.artwork_id}
              artwork={art}
              index={idx}
              href={`/me/favorites/${art.artwork_id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
