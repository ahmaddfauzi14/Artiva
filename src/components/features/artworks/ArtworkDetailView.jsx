import Link from 'next/link';
import ArtworkDetail from '@/components/features/artworks/ArtworkDetail';
import { canInteract, canReport } from '@/lib/shared/permissions';

/**
 * Wrapper tampilan detail karya dengan tautan kembali sesuai konteks rute asal.
 */
export default function ArtworkDetailView({
  artwork,
  commentsData,
  viewer,
  backHref = '/artworks',
  backLabel = '← Kembali ke galeri karya',
}) {
  return (
    <>
      <div>
        <Link
          href={backHref}
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          {backLabel}
        </Link>
      </div>

      <ArtworkDetail
        artwork={artwork}
        initialComments={commentsData.items}
        initialCommentsMeta={commentsData.meta}
        viewer={viewer}
        canInteract={canInteract(viewer)}
        canReport={canReport(viewer)}
      />
    </>
  );
}
