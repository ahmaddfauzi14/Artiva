'use client';

import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import RoleSelector from '@/components/features/auth/RoleSelector';
import {
  clearRegisterDraft,
  getRegisterDraftSnapshot,
  getServerRegisterDraftSnapshot,
  subscribeRegisterDraft,
  updateRegisterDraftField,
} from '@/components/features/auth/register-draft';
import { apiFetch } from '@/lib/shared/api-client';

export default function RegisterCuratorForm() {
  const shared = useSyncExternalStore(
    subscribeRegisterDraft,
    getRegisterDraftSnapshot,
    getServerRegisterDraftSnapshot
  );

  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [createdUser, setCreatedUser] = useState(null);

  const updateShared = (key) => (e) => {
    updateRegisterDraftField(key, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    if (shared.password !== shared.confirm_password) {
      setFieldErrors({
        confirm_password: 'Konfirmasi kata sandi tidak cocok.',
      });
      setErrorMsg('Periksa kembali kata sandi dan konfirmasinya.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/register/curator', {
        method: 'POST',
        body: {
          username: shared.username,
          email: shared.email,
          display_name: shared.display_name,
          bio,
          website,
          password: shared.password,
        },
      });
      clearRegisterDraft();
      setCreatedUser(res.data.user);
    } catch (err) {
      setErrorMsg(err.message);
      if (err.fields) setFieldErrors(err.fields);
    } finally {
      setLoading(false);
    }
  };

  if (createdUser) {
    return (
      <div className="space-y-6 py-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
          PENDAFTARAN SELESAI
        </p>
        <h2 className="text-2xl font-semibold text-ink">
          Pengajuan Kurator berhasil dikirim!
        </h2>
        <Alert tone="warning" title="Menunggu verifikasi Admin">
          Akun Kurator atas nama <strong>{createdUser.display_name}</strong> sedang berstatus menunggu peninjauan. Kamu akan dapat membuat tantangan setelah Admin menyetujui pengajuan ini.
        </Alert>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" href="/dashboard/curator/verification">
            Lihat status verifikasi →
          </Button>
          <Button variant="secondary" href="/">
            Kembali ke beranda →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="hidden lg:block space-y-1">
        <h2 className="text-2xl font-semibold text-ink">Ajukan akun Kurator</h2>
        <p className="text-base text-ink-soft">
          Pengajuan Kurator ditinjau oleh Admin untuk menjaga kredibilitas tantangan.
        </p>
      </div>

      <RoleSelector activeRole="curator" />

      {errorMsg ? (
        <Alert tone="danger" title="Pengajuan belum berhasil">
          {errorMsg}
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Username"
            name="username"
            value={shared.username}
            onChange={updateShared('username')}
            placeholder="contoh: studio_komunitas"
            error={fieldErrors.username}
            required
            inputProps={{ autoComplete: 'username' }}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            value={shared.email}
            onChange={updateShared('email')}
            placeholder="email@example.com"
            error={fieldErrors.email}
            required
            inputProps={{ autoComplete: 'email' }}
          />
        </div>

        <FormField
          label="Nama Kurator / Organisasi"
          name="display_name"
          value={shared.display_name}
          onChange={updateShared('display_name')}
          placeholder="Nama studio, komunitas, atau organisasi"
          error={fieldErrors.display_name}
          required
        />

        <FormField
          label="Profil singkat & latar belakang kurasi"
          name="bio"
          as="textarea"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Ceritakan komunitas, studio, atau pengalaman penyelenggaraan tantangan kreatif..."
          helperText="Minimal 10 karakter; dibaca oleh Admin saat verifikasi."
          error={fieldErrors.bio}
          required
        />

        <FormField
          label="Situs web / portofolio (opsional)"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
          error={fieldErrors.website}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Kata sandi"
            name="password"
            type="password"
            value={shared.password}
            onChange={updateShared('password')}
            placeholder="Minimal 8 karakter"
            helperText="Gunakan minimal 8 karakter."
            error={fieldErrors.password}
            required
            inputProps={{ autoComplete: 'new-password' }}
          />

          <FormField
            label="Konfirmasi kata sandi"
            name="confirm_password"
            type="password"
            value={shared.confirm_password}
            onChange={updateShared('confirm_password')}
            placeholder="Ulangi kata sandi"
            error={fieldErrors.confirm_password}
            required
            inputProps={{ autoComplete: 'new-password' }}
          />
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Ajukan akun Kurator
          </Button>
        </div>
      </form>

      <div className="border-t border-line pt-5 text-sm text-ink-soft">
        <p>
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Masuk ke akunmu →
          </Link>
        </p>
      </div>
    </div>
  );
}
