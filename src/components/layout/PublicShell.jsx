import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

/**
 * Kerangka halaman standar (Navbar + Main Container + Footer).
 * Digunakan bersama oleh halaman publik dan ruang kerja pengguna agar jarak tepi konsisten.
 */
export default function PublicShell({
  user = null,
  children,
  mainClassName = 'space-y-8 py-6 sm:py-8',
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar user={user} />

      <main
        className={`mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 ${mainClassName}`}
      >
        {children}
      </main>

      <Footer user={user} />
    </div>
  );
}
