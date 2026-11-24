export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Periksa kembali data yang kamu masukkan.',
  UNAUTHENTICATED: 'Silakan masuk terlebih dahulu untuk melanjutkan.',
  FORBIDDEN: 'Kamu tidak memiliki izin untuk melakukan tindakan ini.',
  NOT_FOUND: 'Data yang kamu cari tidak ditemukan.',
  INVALID_CREDENTIALS: 'Email/username atau kata sandi tidak sesuai.',
  ACCOUNT_SUSPENDED: 'Akun kamu sedang ditangguhkan. Hubungi administrator.',
  CURATOR_NOT_VERIFIED: 'Akun Kurator belum disetujui. Tunggu verifikasi admin.',
  USERNAME_TAKEN: 'Username sudah digunakan oleh pengguna lain.',
  EMAIL_TAKEN: 'Email sudah terdaftar.',
  INVALID_FILE: 'File harus berupa gambar JPEG, PNG, atau WEBP yang valid.',
  ARTWORK_NOT_ELIGIBLE: 'Karya tidak memenuhi syarat tantangan ini.',
  CHALLENGE_NOT_OPEN: 'Tantangan sedang tidak menerima submission saat ini.',
  CHALLENGE_STILL_OPEN: 'Tantangan masih berlangsung. Penetapan pemenang dilakukan setelah periode berakhir.',
  ALREADY_SUBMITTED: 'Karya ini sudah pernah dikirim ke tantangan yang sama.',
  WITHDRAW_NOT_ALLOWED: 'Submission tidak dapat ditarik karena tantangan sudah ditutup.',
  NO_SUBMISSIONS: 'Belum ada karya peserta aktif untuk ditetapkan sebagai pemenang.',
  INVALID_WINNERS: 'Daftar pemenang harus 1–3 karya dengan peringkat unik berurutan mulai dari 1.',
  ALREADY_ANNOUNCED: 'Pemenang tantangan ini sudah diumumkan dan tidak dapat diubah.',
  ALREADY_REPORTED: 'Kamu sudah pernah melaporkan karya ini.',
  CATEGORY_IN_USE: 'Kategori masih dipakai oleh karya atau tantangan. Nonaktifkan kategori alih-alih menghapusnya.',
  HAS_RELATIONS: 'Akun memiliki riwayat aktivitas sehingga tidak dapat dihapus permanen. Nonaktifkan akun sebagai gantinya.',
  INVALID_STATE: 'Tindakan belum dapat dilakukan pada status saat ini.',
  APPEAL_LIMIT_REACHED: 'Batas maksimal aju banding (3 kali) telah tercapai. Kamu dapat menghapus akun ini bila ingin mendaftar ulang.',
  RATE_LIMITED: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.',
  INTERNAL_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi.',
};

export function getErrorMessage(code, fallback) {
  return ERROR_MESSAGES[code] || fallback || ERROR_MESSAGES.INTERNAL_ERROR;
}
