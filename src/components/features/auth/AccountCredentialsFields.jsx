'use client';

import FormField from '@/components/ui/FormField';

/**
 * Field kredensial akun bersama (Username, Email, Kata Sandi, Konfirmasi)
 * untuk formulir registrasi Member dan Kurator.
 */
export function RegisterIdentityFields({
  draft,
  onFieldChange,
  fieldErrors = {},
  usernamePlaceholder = 'contoh: kreator_muda',
  usernameHelperText = '',
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField
        label="Username"
        name="username"
        value={draft.username}
        onChange={onFieldChange('username')}
        placeholder={usernamePlaceholder}
        helperText={usernameHelperText}
        error={fieldErrors.username}
        required
        inputProps={{ autoComplete: 'username' }}
      />

      <FormField
        label="Email"
        name="email"
        type="email"
        value={draft.email}
        onChange={onFieldChange('email')}
        placeholder="email@example.com"
        error={fieldErrors.email}
        required
        inputProps={{ autoComplete: 'email' }}
      />
    </div>
  );
}

export function RegisterPasswordFields({ draft, onFieldChange, fieldErrors = {} }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField
        label="Kata sandi"
        name="password"
        type="password"
        value={draft.password}
        onChange={onFieldChange('password')}
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
        value={draft.confirm_password}
        onChange={onFieldChange('confirm_password')}
        placeholder="Ulangi kata sandi"
        error={fieldErrors.confirm_password}
        required
        inputProps={{ autoComplete: 'new-password' }}
      />
    </div>
  );
}
