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

export default function RegisterMemberForm() {
  const form = useSyncExternalStore(
    subscribeRegisterDraft,
    getRegisterDraftSnapshot,
    getServerRegisterDraftSnapshot
  );

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [createdUser, setCreatedUser] = useState(null);

  const updateField = (key) => (e) => {
    updateRegisterDraftField(key, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    if (form.password !== form.confirm_password) {
      setFieldErrors({
        confirm_password: 'Konfirmasi kata sandi tidak cocok.',
      });
      setErrorMsg('Periksa kembali kata sandi dan konfirmasinya.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/register/member', {
        method: 'POST',
        body: {
          username: form.username,
          email: form.email,
          display_name: form.display_name,
          password: form.password,
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
          Selamat datang di ARTIVA, {createdUser.display_name}!
        </h2>
        <p className="text-base text-ink-soft">
          Akun Member <span className="font-semibold text-ink">@{createdUser.username}</span> sudah aktif. Kamu bisa langsung mengunggah karya pertamamu atau menjelajahi tantangan terbuka.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" href="/dashboard/member">
            Masuk ke Dashboard →
          </Button>
          <Button variant="secondary" href="/artworks">
            Jelajahi karya →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="hidden lg:block space-y-1">
        <h2 className="text-2xl font-semibold text-ink">Buat akun ARTIVA</h2>
        <p className="text-base text-ink-soft">
          Unggah karya, beri apresiasi, dan ikuti berbagai tantangan kreatif.
        </p>
      </div>

      <RoleSelector activeRole="member" />

      {errorMsg ? (
        <Alert tone="danger" title="Pendaftaran belum berhasil">
          {errorMsg}
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Nama lengkap"
          name="display_name"
          value={form.display_name}
          onChange={updateField('display_name')}
          placeholder="Nama tampilan di galeri (opsional)"
          helperText="Jika kosong, akan memakai username."
          error={fieldErrors.display_name}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Username"
            name="username"
            value={form.username}
            onChange={updateField('username')}
            placeholder="contoh: kreator_muda"
            helperText="3–30 karakter huruf kecil, angka, atau _."
            error={fieldErrors.username}
            required
            inputProps={{ autoComplete: 'username' }}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField('email')}
            placeholder="email@example.com"
            error={fieldErrors.email}
            required
            inputProps={{ autoComplete: 'email' }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Kata sandi"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField('password')}
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
            value={form.confirm_password}
            onChange={updateField('confirm_password')}
            placeholder="Ulangi kata sandi"
            error={fieldErrors.confirm_password}
            required
            inputProps={{ autoComplete: 'new-password' }}
          />
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Buat akun Member
          </Button>
        </div>
      </form>

      <div className="border-t border-line pt-5 text-sm text-ink-soft">
        <p>
          Sudah memiliki akun?{' '}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Masuk ke akunmu →
          </Link>
        </p>
      </div>
    </div>
  );
}
