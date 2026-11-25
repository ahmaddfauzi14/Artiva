'use client';

import Link from 'next/link';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import RoleSelector from '@/components/features/auth/RoleSelector';
import {
  RegisterIdentityFields,
  RegisterPasswordFields,
} from '@/components/features/auth/AccountCredentialsFields';
import { useRegisterDraft } from '@/components/features/auth/register-draft';
import { apiFetch } from '@/lib/shared/api-client';

export default function RegisterMemberForm() {
  const { draft, onFieldChange, clearDraft } = useRegisterDraft();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [createdUser, setCreatedUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    if (draft.password !== draft.confirm_password) {
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
          username: draft.username,
          email: draft.email,
          display_name: draft.display_name,
          password: draft.password,
        },
      });
      clearDraft();
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
      <div className="space-y-5 py-1">
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
          <Button variant="primary" href="/">
            Masuk ke Beranda
          </Button>
          <Button variant="secondary" href="/artworks">
            Jelajahi karya
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="hidden space-y-1 lg:block">
        <h2 className="text-2xl font-semibold text-ink">Buat akun ARTIVA</h2>
        <p className="text-sm text-ink-soft sm:text-base">
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
          value={draft.display_name}
          onChange={onFieldChange('display_name')}
          placeholder="Nama tampilan di galeri (opsional)"
          helperText="Jika kosong, akan memakai username."
          error={fieldErrors.display_name}
        />

        <RegisterIdentityFields
          draft={draft}
          onFieldChange={onFieldChange}
          fieldErrors={fieldErrors}
          usernameHelperText="3–30 karakter huruf kecil, angka, atau _."
        />

        <RegisterPasswordFields
          draft={draft}
          onFieldChange={onFieldChange}
          fieldErrors={fieldErrors}
        />

        <div className="pt-1">
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Buat akun Member
          </Button>
        </div>
      </form>

      <div className="border-t border-line pt-4 text-sm text-ink-soft">
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
