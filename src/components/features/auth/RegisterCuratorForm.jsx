'use client';

import Link from 'next/link';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import DocumentUploader from '@/components/ui/DocumentUploader';
import FormField from '@/components/ui/FormField';
import RoleSelector from '@/components/features/auth/RoleSelector';
import {
  RegisterIdentityFields,
  RegisterPasswordFields,
} from '@/components/features/auth/AccountCredentialsFields';
import { useRegisterDraft } from '@/components/features/auth/register-draft';
import { apiFetch } from '@/lib/shared/api-client';

const ALLOWED_CV_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);
const MAX_CV_BYTES = 5 * 1024 * 1024;

export default function RegisterCuratorForm() {
  const { draft, onFieldChange, clearDraft } = useRegisterDraft();
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [createdUser, setCreatedUser] = useState(null);

  const handleCvSelect = (file) => {
    setCvFile(file);
    if (fieldErrors.cv) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.cv;
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const nextErrors = {};
    if (draft.password !== draft.confirm_password) {
      nextErrors.confirm_password = 'Konfirmasi kata sandi tidak cocok.';
    }

    const cleanWebsite = website.trim();
    if (!cleanWebsite) {
      nextErrors.website = 'Tautan portofolio wajib diisi.';
    } else if (!/^https?:\/\/.+/i.test(cleanWebsite)) {
      nextErrors.website =
        'Tautan portofolio harus diawali http:// atau https://.';
    }

    if (!cvFile) {
      nextErrors.cv = 'File CV (PDF atau Word) wajib diunggah.';
    } else {
      const ext = cvFile.name?.split('.').pop()?.toLowerCase() || '';
      if (!ALLOWED_CV_EXTENSIONS.has(ext)) {
        nextErrors.cv =
          'Format CV harus berupa PDF (.pdf) atau Word (.doc, .docx).';
      } else if (cvFile.size > MAX_CV_BYTES) {
        nextErrors.cv = 'Ukuran file CV melebihi batas maksimal 5 MB.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setErrorMsg('Periksa kembali data pendaftaran dan kelengkapan dokumenmu.');
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set('username', draft.username);
      fd.set('email', draft.email);
      fd.set('display_name', draft.display_name);
      fd.set('bio', bio);
      fd.set('website', cleanWebsite);
      fd.set('password', draft.password);
      fd.set('cv', cvFile);

      const res = await apiFetch('/api/auth/register/curator', {
        method: 'POST',
        body: fd,
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
          Pengajuan Kurator berhasil dikirim!
        </h2>
        <Alert tone="warning" title="Menunggu verifikasi Admin">
          Akun Kurator atas nama <strong>{createdUser.display_name}</strong> sedang berstatus menunggu peninjauan. Kamu akan dapat membuat tantangan setelah Admin menyetujui pengajuan ini.
        </Alert>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" href="/curator/verification">
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
    <div className="space-y-5">
      <div className="hidden space-y-1 lg:block">
        <h2 className="text-2xl font-semibold text-ink">Ajukan akun Kurator</h2>
        <p className="text-sm text-ink-soft sm:text-base">
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
        <RegisterIdentityFields
          draft={draft}
          onFieldChange={onFieldChange}
          fieldErrors={fieldErrors}
          usernamePlaceholder="contoh: studio_komunitas"
        />

        <FormField
          label="Nama Kurator / Organisasi"
          name="display_name"
          value={draft.display_name}
          onChange={onFieldChange('display_name')}
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
          label="Tautan portofolio / situs web"
          name="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://portofolio-kamu.com"
          helperText="Wajib diawali http:// atau https:// (mis. Behance, ArtStation, atau situs portofolio)."
          inputProps={{
            autoCorrect: 'off',
            autoCapitalize: 'none',
            spellCheck: false,
          }}
          error={fieldErrors.website}
          required
        />

        <DocumentUploader
          label="Dokumen CV Kurator (Word atau PDF)"
          name="cv"
          file={cvFile}
          onFileSelect={handleCvSelect}
          error={fieldErrors.cv}
          required
        />

        <RegisterPasswordFields
          draft={draft}
          onFieldChange={onFieldChange}
          fieldErrors={fieldErrors}
        />

        <div className="pt-1">
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Ajukan akun Kurator
          </Button>
        </div>
      </form>

      <div className="border-t border-line pt-4 text-sm text-ink-soft">
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
