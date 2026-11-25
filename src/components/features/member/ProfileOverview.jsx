import ProfileCard from '@/components/effects/ProfileCard';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateId } from '@/lib/shared/format';
import { ROLE_LABELS } from '@/lib/shared/navigation';
import { getStatusMeta } from '@/lib/shared/status-styles';

export default function ProfileOverview({ user, editHref }) {
  const roleTitle =
    user.role === 'curator' ? 'Kurator Terverifikasi' : 'Kreator ARTIVA';
  const roleLabel = ROLE_LABELS[user.role] || user.role;
  const statusMeta = getStatusMeta('user', user.status);
  const safeWebsite =
    user.website && /^https?:\/\//i.test(user.website) ? user.website : null;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
      {/* Kartu Profil di Bagian Kiri */}
      <aside className="mx-auto flex w-full max-w-[380px] lg:mx-0 lg:h-full lg:max-w-none">
        <ProfileCard
          className="profile-card--fill"
          name={user.display_name}
          title={roleTitle}
          handle={user.username}
          status={statusMeta.label}
          statusColor="#F2C94C"
          contactText=""
          avatarUrl={user.avatar_url || ''}
          miniAvatarUrl={user.avatar_url || ''}
          holo={0.8}
          glare={0.45}
          enableTilt
          tiltStrength={10}
          intro={false}
          parallax={8}
          radius={16}
          showUserInfo
          theme="dark"
        />
      </aside>

      {/* Data Diri di Bagian Kanan */}
      <section
        aria-labelledby="profile-details-heading"
        className="min-w-0 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              {user.role === 'curator' ? 'DATA DIRI KURATOR' : 'DATA DIRI KREATOR'}
            </p>
            <h2
              id="profile-details-heading"
              className="mt-1 truncate text-2xl font-semibold text-ink"
            >
              {user.display_name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-medium text-ink-soft">
                @{user.username}
              </span>
              <StatusBadge domain="user" status={user.status} />
            </div>
          </div>

          <Button variant="primary" href={editHref}>
            Edit profil
          </Button>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 rounded-[20px] border border-line/70 bg-canvas/80 p-5 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-mute">
              Nama tampilan
            </dt>
            <dd className="mt-1 font-medium text-ink">{user.display_name}</dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-mute">
              Username
            </dt>
            <dd className="mt-1 font-medium text-ink">@{user.username}</dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-mute">
              Email akun
            </dt>
            <dd className="mt-1 break-all font-medium text-ink">{user.email}</dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-mute">
              Peran akun
            </dt>
            <dd className="mt-1 font-medium text-ink">{roleLabel}</dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-mute">
              Bergabung sejak
            </dt>
            <dd className="mt-1 font-medium text-ink">
              {formatDateId(user.created_at)}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-mute">
              Situs web atau portofolio
            </dt>
            <dd className="mt-1">
              {safeWebsite ? (
                <a
                  href={safeWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-medium text-brand-700 underline-offset-4 hover:underline"
                >
                  {safeWebsite} ↗
                </a>
              ) : (
                <span className="text-ink-mute">Belum ditambahkan</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-4 rounded-[20px] border border-line/70 bg-canvas/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-mute">
            Bio singkat
          </p>
          {user.bio ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {user.bio}
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink-mute">
              Belum ada bio singkat yang ditambahkan.
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <p className="text-xs text-ink-soft">
            Etalase portofolio publikmu tampil di{' '}
            <span className="font-semibold text-ink">@{user.username}</span>.
          </p>
          <Button
            variant="tonal"
            size="sm"
            href={`/creators/${user.username}`}
          >
            Lihat profil publik
          </Button>
        </div>
      </section>
    </div>
  );
}
