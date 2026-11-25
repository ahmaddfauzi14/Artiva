'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserIcon } from '@hugeicons/core-free-icons';

const SIZE_CONFIG = {
  sm: { box: 'h-9 w-9', icon: 18 },
  md: { box: 'h-12 w-12', icon: 22 },
  lg: { box: 'h-16 w-16', icon: 28 },
  xl: { box: 'h-24 w-24', icon: 42 },
};

export default function Avatar({
  name = 'ARTIVA',
  avatarUrl = null,
  size = 'sm',
  className = '',
}) {
  const [failedUrl, setFailedUrl] = useState('');
  const { box, icon } = SIZE_CONFIG[size] || SIZE_CONFIG.sm;
  const hasImage = Boolean(avatarUrl) && failedUrl !== avatarUrl;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-brand-700 ${box} ${className}`}
    >
      {hasImage ? (
        <img
          src={avatarUrl}
          alt={name || 'Avatar pengguna'}
          onError={() => setFailedUrl(avatarUrl)}
          className="h-full w-full object-cover"
        />
      ) : (
        <HugeiconsIcon
          icon={UserIcon}
          size={icon}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
