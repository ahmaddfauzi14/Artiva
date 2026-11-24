'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';

function resolveRedirectTarget(user, nextParam) {
  if (
    nextParam &&
    nextParam.startsWith('/') &&
    !nextParam.startsWith('//') &&
    !nextParam.startsWith('/login')
  ) {
    if (user.role === 'curator' && user.status !== 'active') {
      if (
        nextParam.startsWith('/dashboard/curator') ||
        nextParam.startsWith('/curator')
      ) {
        return '/curator/verification';
      }
      if (!nextParam.startsWith('/dashboard') && !nextParam.startsWith('/me')) {
        return nextParam;
      }
    }
    if (
      user.role === 'member' &&
      !nextParam.startsWith('/dashboard') &&
      !nextParam.startsWith('/curator')
    ) {
      return nextParam;
    }
    if (
      user.role === 'curator' &&
      user.status === 'active' &&
      !nextParam.startsWith('/dashboard') &&
      !nextParam.startsWith('/me')
    ) {
      return nextParam;
    }
    if (
      user.role === 'admin' &&
      (nextParam.startsWith('/dashboard/admin') ||
        (!nextParam.startsWith('/dashboard') &&
          !nextParam.startsWith('/me') &&
          !nextParam.startsWith('/curator')))
    ) {
      return nextParam;
    }
  }
  if (user.role === 'curator' && user.status !== 'active') {
    return '/curator/verification';
  }
  if (user.role === 'admin') return '/dashboard/admin';
  return '/';
}

export default function LoginForm({ nextParam = '', errorParam = '' }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    errorParam === 'suspended'
      ? 'Akun kamu sedang ditangguhkan. Hubungi administrator untuk informasi lebih lanjut.'
      : ''
  );
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { identifier, password },
      });
      const user = res.data.user;
      showToast({
        tone: 'success',
        title: 'Berhasil masuk',
        message: `Selamat datang kembali, ${user.display_name || user.username}.`,
      });
      const target = resolveRedirectTarget(user, nextParam);
      router.push(target);
      router.refresh();
    } catch (err) {
      setErrorMsg(err.message);
      if (err.fields) setFieldErrors(err.fields);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="hidden lg:block space-y-1">
        <h2 className="text-2xl font-semibold text-ink">Masuk ke akunmu</h2>
        <p className="text-base text-ink-soft">
          Gunakan email atau username terdaftar untuk melanjutkan.
        </p>
      </div>

      {errorMsg ? (
        <Alert tone="danger" title="Tidak dapat masuk">
          {errorMsg}
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email atau username"
          name="identifier"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Masukkan email atau username"
          error={fieldErrors.identifier}
          required
          inputProps={{ autoComplete: 'username' }}
        />

        <FormField
          label="Kata sandi"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan kata sandi"
          error={fieldErrors.password}
          required
          inputProps={{ autoComplete: 'current-password' }}
        />

        <div className="pt-2">
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Masuk
          </Button>
        </div>
      </form>

      <div className="border-t border-line pt-5 text-sm text-ink-soft space-y-2">
        <p>
          Belum punya akun?{' '}
          <Link href="/register/member" className="font-semibold text-brand-700 hover:underline">
            Daftar sebagai Member →
          </Link>
        </p>
        <p>
          Ingin menyelenggarakan tantangan kreatif?{' '}
          <Link href="/register/curator" className="font-semibold text-brand-700 hover:underline">
            Ajukan akun Kurator →
          </Link>
        </p>
      </div>
    </div>
  );
}
