'use client';

import Link from 'next/link';
import { useState } from 'react';
import './FaqSection.css';

const FAQ_ITEMS = [
  {
    id: 'perbedaan-akun',
    question: 'Apa perbedaan akun Member dan Kurator di ARTIVA?',
    answer:
      'Akun Member langsung aktif setelah mendaftar untuk mengunggah karya ke portofolio, memberi suka, menyimpan favorit, menulis komentar, dan mengikuti tantangan. Akun Kurator ditujukan bagi penyelenggara tantangan tematik dan memerlukan verifikasi Admin (dengan melampirkan CV PDF/Word serta tautan portofolio) sebelum dapat membuka tantangan.',
    defaultOpen: true,
  },
  {
    id: 'unggah-ulang-tantangan',
    question: 'Apakah karya harus diunggah ulang saat mengikuti tantangan?',
    answer:
      'Tidak perlu. Cukup unggah karya sekali ke portofoliomu dengan status Terbit. Selama kategori karya sesuai dengan tantangan yang sedang dibuka, kamu bisa langsung memilih karya tersebut dari halaman detail tantangan atau menu Submission tanpa mengunggah ulang file gambar.',
  },
  {
    id: 'format-karya',
    question: 'Format dan ukuran file apa saja yang didukung untuk karya?',
    answer:
      'ARTIVA mendukung gambar berformat JPEG, PNG, atau WEBP dengan ukuran maksimal 5 MB per karya. Kamu juga dapat mengatur status visibilitas karya antara Terbit dan Tersembunyi kapan saja melalui ruang kelola karya.',
  },
  {
    id: 'tarik-pengajuan',
    question: 'Bisakah saya menarik pengajuan karya dari tantangan?',
    answer:
      'Bisa. Selama Kurator belum mengumumkan pemenang tantangan, kamu dapat membatalkan atau menarik pengajuan (withdraw) melalui menu Submission atau halaman detail tantangan terkait tanpa menghapus karya dari portofoliomu.',
  },
  {
    id: 'penilaian-pemenang',
    question: 'Bagaimana proses kurasi dan pengumuman pemenang tantangan?',
    answer:
      'Setelah masa pengajuan tantangan selesai, Kurator terverifikasi meninjau seluruh karya peserta secara independen dan menetapkan 1 sampai 3 pemenang resmi. Hasil pemenang akan tampil secara terbuka pada halaman tantangan dan podium pemenang di beranda.',
  },
  {
    id: 'hak-cipta-laporan',
    question: 'Bagaimana hak cipta karya dan pelaporan konten bermasalah?',
    answer:
      'Setiap kreator tetap memegang penuh hak cipta atas karyanya (dengan izin penayangan di galeri publik, profil kreator, dan tantangan ARTIVA). Apabila menemukan karya yang melanggar ketentuan atau hak cipta, kamu dapat mengirim laporan lewat tombol lapor di halaman detail karya untuk ditinjau Admin.',
  },
];

const INITIAL_OPEN_IDS = FAQ_ITEMS.filter((item) => item.defaultOpen).map(
  (item) => item.id
);

export default function FaqSection() {
  const [openIds, setOpenIds] = useState(INITIAL_OPEN_IDS);

  const allExpanded = openIds.length === FAQ_ITEMS.length;

  const handleItemToggle = (id, isOpen) => {
    setOpenIds((prev) => {
      const hasId = prev.includes(id);
      if (isOpen && !hasId) return [...prev, id];
      if (!isOpen && hasId) return prev.filter((item) => item !== id);
      return prev;
    });
  };

  const handleToggleAll = () => {
    setOpenIds(allExpanded ? [] : FAQ_ITEMS.map((item) => item.id));
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-24 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8"
    >
      <div className="space-y-4 lg:col-span-5">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            PERTANYAAN UMUM
          </p>
          <h2
            id="faq-heading"
            className="text-2xl font-semibold tracking-[-0.015em] text-ink sm:text-[1.75rem]"
          >
            Hal yang sering ditanyakan.
          </h2>
        </div>

        <p className="max-w-prose text-sm leading-relaxed text-ink-soft sm:text-base">
          Ringkasan aturan main di ARTIVA seputar akun kreator, pengajuan karya ke tantangan, hingga verifikasi Kurator.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            aria-expanded={allExpanded}
            onClick={handleToggleAll}
            className="inline-flex min-h-[44px] items-center rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-card-sm transition-colors hover:border-brand-400/60 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            {allExpanded ? 'Tutup semua jawaban' : 'Buka semua jawaban'}
          </button>

          <Link
            href="/about"
            className="inline-flex min-h-[44px] items-center text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
          >
            Pelajari alur lengkap →
          </Link>
        </div>
      </div>

      <div className="space-y-3 lg:col-span-7">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.id}
            open={openIds.includes(item.id)}
            onToggle={(e) => handleItemToggle(item.id, e.currentTarget.open)}
            className="faq-item"
          >
            <summary className="faq-summary">
              <span>{item.question}</span>
            </summary>
            <div className="faq-answer">
              <p className="max-w-prose">{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
