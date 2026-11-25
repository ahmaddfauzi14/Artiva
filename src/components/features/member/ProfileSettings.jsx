'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import ImageUploader from '@/components/ui/ImageUploader';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';

export default function ProfileSettings({ user }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    display_name: user.display_name || '',
    bio: user.bio || '',
    website: user.website || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileFields, setProfileFields] = useState({});

  const [accountForm, setAccountForm] = useState({
    email: user.email || '',
    current_password: '',
    new_password: '',
  });
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountFields, setAccountFields] = useState({});

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileFields({});
    setProfileLoading(true);

    try {
      const fd = new FormData();
      fd.set('display_name', profileForm.display_name);
      fd.set('bio', profileForm.bio);
      fd.set('website', profileForm.website);
      if (avatarFile) {
        fd.set('avatar', avatarFile);
      }
      await apiFetch('/api/me/profile', { method: 'PATCH', body: fd });
      showToast({
        tone: 'success',
        title: 'Profil diperbarui',
        message: 'Informasi profilmu telah disimpan.',
      });
      setAvatarFile(null);
      router.refresh();
    } catch (err) {
      setProfileError(err.message);
      if (err.fields) setProfileFields(err.fields);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setAccountError('');
    setAccountFields({});
    setAccountLoading(true);

    try {
      const payload = {
        current_password: accountForm.current_password,
      };
      if (accountForm.email.trim().toLowerCase() !== user.email.toLowerCase()) {
        payload.email = accountForm.email.trim();
      }
      if (accountForm.new_password) {
        payload.new_password = accountForm.new_password;
      }

      await apiFetch('/api/me/account', { method: 'PATCH', body: payload });
      showToast({
        tone: 'success',
        title: 'Akun diperbarui',
        message: 'Perubahan kredensial akunmu berhasil disimpan.',
      });
      setAccountForm((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
      }));
      router.refresh();
    } catch (err) {
      setAccountError(err.message);
      if (err.fields) setAccountFields(err.fields);
    } finally {
      setAccountLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Kartu Profil Publik */}
      <form
        onSubmit={handleProfileSubmit}
        className="space-y-6 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8 lg:col-span-7"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            {user.role === 'curator' ? 'PROFIL KURATOR' : 'PROFIL KREATOR'}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">
            Identitas yang tampil di ARTIVA
          </h2>
        </div>

        {profileError ? (
          <Alert tone="danger" title="Gagal menyimpan profil">
            {profileError}
          </Alert>
        ) : null}

        <ImageUploader
          label="Foto avatar"
          currentUrl={user.avatar_url}
          onFileSelect={setAvatarFile}
          error={profileFields.avatar || profileFields.image}
          aspectClass="aspect-[4/5]"
          imagePositionClass="object-center"
          helperText="JPEG/PNG/WEBP, maks. 5 MB"
        />

        <FormField
          label="Username"
          name="username_readonly"
          value={`@${user.username}`}
          disabled
          helperText="Username tidak dapat diubah setelah pendaftaran."
        />

        <FormField
          label="Nama tampilan"
          name="display_name"
          value={profileForm.display_name}
          onChange={(e) =>
            setProfileForm((p) => ({ ...p, display_name: e.target.value }))
          }
          error={profileFields.display_name}
          required
        />

        <FormField
          label="Bio singkat"
          name="bio"
          as="textarea"
          rows={4}
          value={profileForm.bio}
          onChange={(e) =>
            setProfileForm((p) => ({ ...p, bio: e.target.value }))
          }
          placeholder="Ceritakan gaya karyamu, minat desain, atau latar belakangmu..."
          error={profileFields.bio}
        />

        <FormField
          label="Situs web atau portofolio"
          name="website"
          value={profileForm.website}
          onChange={(e) =>
            setProfileForm((p) => ({ ...p, website: e.target.value }))
          }
          placeholder="https://portofoliomu.id"
          error={profileFields.website}
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" loading={profileLoading}>
            Simpan profil
          </Button>
        </div>
      </form>

      {/* Kartu Keamanan & Akun (sticky agar seimbang dengan tinggi formulir profil) */}
      <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
        <form
          onSubmit={handleAccountSubmit}
          className="space-y-5 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              KEAMANAN AKUN
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">
              Email &amp; Kata Sandi
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Masukkan kata sandi saat ini untuk mengonfirmasi perubahan email atau kata sandi baru.
            </p>
          </div>

          {accountError ? (
            <Alert tone="danger" title="Gagal memperbarui akun">
              {accountError}
            </Alert>
          ) : null}

          <FormField
            label="Email akun"
            name="email"
            type="email"
            value={accountForm.email}
            onChange={(e) =>
              setAccountForm((p) => ({ ...p, email: e.target.value }))
            }
            error={accountFields.email}
            required
          />

          <FormField
            label="Kata sandi baru (opsional)"
            name="new_password"
            type="password"
            value={accountForm.new_password}
            onChange={(e) =>
              setAccountForm((p) => ({ ...p, new_password: e.target.value }))
            }
            placeholder="Minimal 8 karakter jika ingin ganti"
            error={accountFields.new_password}
            inputProps={{ autoComplete: 'new-password' }}
          />

          <FormField
            label="Kata sandi saat ini"
            name="current_password"
            type="password"
            value={accountForm.current_password}
            onChange={(e) =>
              setAccountForm((p) => ({ ...p, current_password: e.target.value }))
            }
            placeholder="Wajib diisi untuk menyimpan perubahan"
            error={accountFields.current_password}
            required
            inputProps={{ autoComplete: 'current-password' }}
          />

          <div className="pt-2">
            <Button type="submit" variant="secondary" loading={accountLoading}>
              Perbarui akun
            </Button>
          </div>
        </form>

        <div className="rounded-[28px] border border-line bg-tint-lavender p-6 shadow-tint-lavender space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            ETALASE PUBLIK
          </p>
          <p className="text-sm text-ink-soft">
            Perubahan nama tampilan, avatar, dan bio akan langsung muncul pada halaman portofolio publikmu di{' '}
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
      </div>
    </div>
  );
}
