import { withTransaction } from '@/lib/server/db';
import { AppError } from '@/lib/server/http';
import { getErrorMessage } from '@/lib/shared/error-messages';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signSessionToken } from '@/lib/auth/session';
import { toUploadUrl } from '@/lib/shared/format';
import {
  deleteUploadedFile,
  saveUploadedImage,
  saveValidatedDocument,
  validateUploadedDocument,
} from '@/lib/server/uploads';
import {
  createUserWithProfile,
  findProfileByUserId,
  findUserCredentialsById,
  findUserForLogin,
  updateProfileRow,
  updateUserCredentials,
} from '@/lib/repositories/users';

const DUMMY_BCRYPT_HASH =
  '$2b$12$C6UzMDM.H6dfI/f/IKxGhu6pA/U5s6F2nC3V6zN2dK1B0lF3e7fK.';

function toPublicSessionUser(row) {
  return {
    user_id: row.user_id,
    username: row.username,
    email: row.email,
    role: row.role,
    status: row.status,
    created_at: row.created_at,
    display_name: row.display_name || row.username,
    bio: row.bio || '',
    avatar_path: row.avatar_path || null,
    avatar_url: toUploadUrl(row.avatar_path),
    website: row.website || '',
    verification: row.verification
      ? {
          verification_id: row.verification.verification_id,
          status: row.verification.status,
          note: row.verification.note || null,
          appeal_note: row.verification.appeal_note || null,
          has_cv: Boolean(row.verification.cv_path),
          cv_url: row.verification.cv_path
            ? '/api/curator/verification/cv'
            : null,
          submitted_at: row.verification.submitted_at,
          reviewed_at: row.verification.reviewed_at,
        }
      : row.role === 'curator' && row.verification_id
        ? {
            verification_id: row.verification_id,
            status: row.verification_status,
            note: row.verification_note || null,
            appeal_note: row.verification_appeal_note || null,
            has_cv: Boolean(row.verification_cv_path),
            cv_url: row.verification_cv_path
              ? '/api/curator/verification/cv'
              : null,
            submitted_at: row.verification_submitted_at,
            reviewed_at: row.verification_reviewed_at,
          }
        : null,
  };
}

async function registerWithRole({
  username,
  email,
  password,
  role,
  status,
  displayName,
  bio = null,
  website = null,
  validatedCv = null,
}) {
  const passwordHash = await hashPassword(password);
  const cvPath = validatedCv
    ? await saveValidatedDocument(validatedCv, 'cvs')
    : null;

  let created;
  try {
    created = await withTransaction(async (client) =>
      createUserWithProfile(
        {
          username,
          email,
          passwordHash,
          role,
          status,
          displayName,
          bio,
          website,
          cvPath,
        },
        client
      )
    );
  } catch (err) {
    if (cvPath) {
      await deleteUploadedFile(cvPath);
    }
    throw err;
  }

  const token = await signSessionToken({
    userId: created.user_id,
    role: created.role,
  });

  return { user: toPublicSessionUser(created), token };
}

export async function registerMember(input) {
  return registerWithRole({
    username: input.username,
    email: input.email,
    password: input.password,
    role: 'member',
    status: 'active',
    displayName: input.display_name?.trim() || input.username,
  });
}

export async function registerCurator(input, cvFile) {
  const validatedCv = await validateUploadedDocument(cvFile, 'cv');
  return registerWithRole({
    username: input.username,
    email: input.email,
    password: input.password,
    role: 'curator',
    status: 'pending',
    displayName: input.display_name,
    bio: input.bio,
    website: input.website,
    validatedCv,
  });
}

export async function loginAccount({ identifier, password }) {
  const row = await findUserForLogin(identifier);
  if (!row) {
    await verifyPassword(password, DUMMY_BCRYPT_HASH);
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      getErrorMessage('INVALID_CREDENTIALS')
    );
  }

  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      getErrorMessage('INVALID_CREDENTIALS')
    );
  }

  if (row.status === 'suspended') {
    throw new AppError(
      403,
      'ACCOUNT_SUSPENDED',
      getErrorMessage('ACCOUNT_SUSPENDED')
    );
  }

  const token = await signSessionToken({
    userId: row.user_id,
    role: row.role,
  });

  return { user: toPublicSessionUser(row), token };
}

export async function updateMyProfile(userId, input, avatarFile = null) {
  let newAvatarPath = null;
  if (avatarFile && typeof avatarFile.arrayBuffer === 'function' && avatarFile.size > 0) {
    newAvatarPath = await saveUploadedImage(avatarFile, 'avatars');
  }

  let oldAvatarPath = null;
  try {
    const updated = await withTransaction(async (client) => {
      const prev = await findProfileByUserId(userId, client);
      oldAvatarPath = prev?.avatar_path || null;
      return updateProfileRow(
        userId,
        {
          displayName: input.display_name,
          bio: input.bio,
          website: input.website,
          avatarPath: newAvatarPath,
        },
        client
      );
    });

    if (newAvatarPath && oldAvatarPath && oldAvatarPath !== newAvatarPath) {
      await deleteUploadedFile(oldAvatarPath);
    }

    return {
      ...updated,
      avatar_url: toUploadUrl(updated?.avatar_path),
    };
  } catch (err) {
    if (newAvatarPath) {
      await deleteUploadedFile(newAvatarPath);
    }
    throw err;
  }
}

export async function updateMyAccount(userId, input) {
  const creds = await findUserCredentialsById(userId);
  if (!creds) {
    throw new AppError(404, 'NOT_FOUND', getErrorMessage('NOT_FOUND'));
  }

  const valid = await verifyPassword(input.current_password, creds.password_hash);
  if (!valid) {
    throw new AppError(
      400,
      'INVALID_CREDENTIALS',
      'Kata sandi saat ini tidak sesuai.',
      { current_password: 'Kata sandi saat ini tidak sesuai.' }
    );
  }

  const nextPasswordHash = input.new_password
    ? await hashPassword(input.new_password)
    : null;

  const updated = await updateUserCredentials(userId, {
    email: input.email || null,
    passwordHash: nextPasswordHash,
  });

  return updated;
}
