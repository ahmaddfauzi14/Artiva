import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;

function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const filePath = path.resolve(process.cwd(), name);
    if (fs.existsSync(filePath) && typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(filePath);
    }
  }
}

function getUploadRoot() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR || './storage/uploads');
}

function formatDateOffset(offsetDays) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

// Akun & tantangan fiktif versi sebelumnya yang akan dibersihkan saat migrasi ke data nyata
const LEGACY_DUMMY_USERNAMES = [
  'nadia_lens',
  'raka_visual',
  'sinta_studio',
  'kurator_arya',
];

const LEGACY_DUMMY_CHALLENGE_TITLES = [
  'Eksplorasi Cahaya & Ruang Nusantara',
  'Identitas Visual Kota Masa Depan',
];

const LEGACY_DUMMY_FILES = [
  'artworks/dummy-1.jpg',
  'artworks/dummy-1.png',
  'artworks/dummy-2.jpg',
  'artworks/dummy-2.png',
  'artworks/dummy-3.png',
  'artworks/dummy-4.png',
  'artworks/dummy-5.png',
  'artworks/dummy-6.png',
  'avatars/dummy-avatar-1.png',
  'avatars/dummy-avatar-2.png',
  'avatars/dummy-avatar-3.png',
  'avatars/dummy-avatar-4.png',
];

const CATEGORIES = [
  {
    name: 'Lukisan',
    slug: 'lukisan',
    description:
      'Karya seni lukis klasik, romantisisme, impresionisme, simbolisme, dan mahakarya seni rupa bersejarah.',
    is_active: true,
  },
  {
    name: 'Fotografi',
    slug: 'fotografi',
    description: 'Karya fotografi dokumenter, potret, alam, maupun eksperimental.',
    is_active: true,
  },
  {
    name: 'Ilustrasi',
    slug: 'ilustrasi',
    description: 'Ilustrasi cetak kayu, ilustrasi ilmiah, karakter, konsep visual, dan komik.',
    is_active: true,
  },
  {
    name: 'UI/UX',
    slug: 'ui-ux',
    description: 'Desain antarmuka, pengalaman pengguna, dan prototipe produk digital.',
    is_active: true,
  },
  {
    name: 'Desain Grafis',
    slug: 'desain-grafis',
    description: 'Poster, identitas visual, tipografi, dan tata letak kreatif.',
    is_active: true,
  },
  {
    name: '3D Art',
    slug: '3d-art',
    description: 'Pemodelan tiga dimensi, rendering, lingkungan virtual, dan patung digital.',
    is_active: true,
  },
  {
    name: 'Lainnya',
    slug: 'lainnya',
    description: 'Karya lintas disiplin, seni patung klasik, dan eksplorasi visual lainnya.',
    is_active: true,
  },
  {
    name: 'Kaligrafi Klasik',
    slug: 'kaligrafi-klasik',
    description: 'Kategori arsip nonaktif untuk eksperimen seni aksara dan kaligrafi tradisional.',
    is_active: false,
  },
  {
    name: 'Seni Pahat Kayu',
    slug: 'seni-pahat-kayu',
    description: 'Kategori arsip nonaktif yang saat ini digabungkan ke kategori Lainnya.',
    is_active: false,
  },
];

const REAL_USERS = [
  {
    username: 'raden_saleh',
    email: 'raden.saleh@artiva.local',
    role: 'member',
    display_name: 'Raden Saleh Sjarif Bustaman',
    bio: 'Pelopor seni lukis modern Indonesia (1811–1880) beraliran Romantisisme. Karya-karyanya memadukan drama cahaya Eropa dengan narasi alam dan sejarah Nusantara.',
    avatar_path: 'avatars/raden-saleh.jpg',
    website: 'https://commons.wikimedia.org/wiki/Category:Paintings_by_Raden_Saleh',
  },
  {
    username: 'vincent_vangogh',
    email: 'vincent.vangogh@artiva.local',
    role: 'member',
    display_name: 'Vincent van Gogh',
    bio: 'Maestro Pasca-Impresionisme asal Belanda (1853–1890) yang dikenal lewat sapuan kuas impasto ekspresif, ritme langit malam, dan intensitas warna emosional.',
    avatar_path: 'avatars/vincent-vangogh.jpg',
    website: 'https://www.moma.org/artists/2206',
  },
  {
    username: 'johannes_vermeer',
    email: 'johannes.vermeer@artiva.local',
    role: 'member',
    display_name: 'Johannes Vermeer',
    bio: 'Pelukis Zaman Keemasan Belanda asal Delft (1632–1675), termasyhur karena penguasaan cahaya lembut, pigmen ultramarine, dan ketenangan komposisi interior.',
    avatar_path: 'avatars/johannes-vermeer.jpg',
    website: 'https://www.mauritshuis.nl/en/our-collection/artworks/670-girl-with-a-pearl-earring/',
  },
  {
    username: 'claude_monet',
    email: 'claude.monet@artiva.local',
    role: 'member',
    display_name: 'Claude Monet',
    bio: 'Pendiri sekaligus tokoh sentral gerakan Impresionisme Prancis (1840–1926) yang mengabadikan perubahan cahaya atmosferik secara langsung di alam terbuka (en plein air).',
    avatar_path: 'avatars/claude-monet.jpg',
    website: 'https://www.marmottan.fr/en/',
  },
  {
    username: 'gustav_klimt',
    email: 'gustav.klimt@artiva.local',
    role: 'member',
    display_name: 'Gustav Klimt',
    bio: 'Pelukis Simbolisme Austria (1862–1918) dan pendiri gerakan Vienna Secession, masyhur dengan Fase Emas yang menggabungkan cat minyak dan lapisan daun emas.',
    avatar_path: 'avatars/gustav-klimt.jpg',
    website: 'https://www.belvedere.at/en',
  },
  {
    username: 'katsushika_hokusai',
    email: 'hokusai@artiva.local',
    role: 'member',
    display_name: 'Katsushika Hokusai',
    bio: 'Seniman cetak kayu ukiyo-e Jepang zaman Edo (1760–1849), pencipta seri legendaris Tiga Puluh Enam Pemandangan Gunung Fuji yang memengaruhi seni modern dunia.',
    avatar_path: 'avatars/katsushika-hokusai.jpg',
    website: 'https://www.metmuseum.org/art/collection/search/45434',
  },
  {
    username: 'ernst_haeckel',
    email: 'ernst.haeckel@artiva.local',
    role: 'member',
    display_name: 'Ernst Haeckel',
    bio: 'Ahli biologi laut, naturalis, dan ilustrator Jerman (1834–1919) pencipta kompendium ilustrasi litografi Kunstformen der Natur (1899–1904).',
    avatar_path: 'avatars/ernst-haeckel.jpg',
    website: 'https://commons.wikimedia.org/wiki/Kunstformen_der_Natur',
  },
  {
    username: 'kassian_cephas',
    email: 'kassian.cephas@artiva.local',
    role: 'member',
    display_name: 'Kassian Cephas',
    bio: 'Fotografer pribumi pertama Indonesia sekaligus fotografer resmi Keraton Yogyakarta (1845–1912), mendokumentasikan arsitektur Jawa dan relief kaki tersembunyi Borobudur.',
    avatar_path: 'avatars/kassian-cephas.jpg',
    website: 'https://commons.wikimedia.org/wiki/Category:Kassian_Cephas',
  },
  {
    username: 'ansel_adams',
    email: 'ansel.adams@artiva.local',
    role: 'member',
    display_name: 'Ansel Adams',
    bio: 'Fotografer lanskap dan konservasionis Amerika Serikat (1902–1984), salah satu perumus Zone System untuk kendali tonal hitam-putih berpresisi tinggi.',
    avatar_path: 'avatars/ansel-adams.jpg',
    website: 'https://www.archives.gov/',
  },
  {
    username: 'dorothea_lange',
    email: 'dorothea.lange@artiva.local',
    role: 'member',
    display_name: 'Dorothea Lange',
    bio: 'Fotografer dokumenter dan jurnalis foto Amerika Serikat (1895–1965) yang memotret sisi kemanusiaan era Depresi Besar untuk arsip Farm Security Administration.',
    avatar_path: 'avatars/dorothea-lange.jpg',
    website: 'https://www.loc.gov/pictures/item/2017762891/',
  },
  {
    username: 'alphonse_mucha',
    email: 'alphonse.mucha@artiva.local',
    role: 'member',
    display_name: 'Alphonse Mucha',
    bio: 'Desainer grafis, ilustrator, dan pelukis asal Ceko (1860–1939) yang membentuk ciri khas poster litografi Art Nouveau melalui garis organik dan tipografi dekoratif.',
    avatar_path: 'avatars/alphonse-mucha.jpg',
    website: 'https://commons.wikimedia.org/wiki/Category:Alphonse_Mucha',
  },
  {
    username: 'toulouse_lautrec',
    email: 'toulouse.lautrec@artiva.local',
    role: 'member',
    display_name: 'Henri de Toulouse-Lautrec',
    bio: 'Pelukis dan perintis desain poster modern Prancis (1864–1901) yang mengangkat litografi komersial Montmartre ke level seni grafis adiluhung.',
    avatar_path: 'avatars/toulouse-lautrec.jpg',
    website: 'https://www.artic.edu/',
  },
  {
    username: 'blender_studio',
    email: 'studio@blender.artiva.local',
    role: 'member',
    display_name: 'Blender Studio & Komunitas',
    bio: 'Studio produksi animasi terbuka Blender Foundation yang merilis aset, adegan, dan karya render 3D profesional berlisensi Creative Commons (CC BY).',
    avatar_path: 'avatars/blender-studio.png',
    website: 'https://studio.blender.org/',
  },
  {
    username: 'open_design_lab',
    email: 'opendesign@artiva.local',
    role: 'member',
    display_name: 'Open Source Design Collective',
    bio: 'Kolektif dokumentasi antarmuka dan sistem desain sumber terbuka seperti Penpot dan Pantheon desktop environment (elementary OS).',
    avatar_path: 'avatars/open-design-lab.png',
    website: 'https://penpot.app/',
  },
  {
    username: 'auguste_rodin',
    email: 'auguste.rodin@artiva.local',
    role: 'member',
    display_name: 'Auguste Rodin',
    bio: 'Pematung Prancis (1840–1917) yang dianggap sebagai bapak seni patung modern lewat ekspresi anatomi dan tekstur permukaan perunggu yang dramatis.',
    avatar_path: 'avatars/auguste-rodin.jpg',
    website: 'https://www.musee-rodin.fr/en',
  },
  {
    username: 'leonardo_davinci',
    email: 'leonardo.davinci@artiva.local',
    role: 'member',
    display_name: 'Leonardo da Vinci',
    bio: 'Polimatik dan maestro Renaisans Tinggi Italia (1452–1519) yang memelopori teknik sfumato, studi anatomi presisi, serta perspektif atmosferik.',
    avatar_path: 'avatars/leonardo-davinci.jpg',
    website: 'https://www.louvre.fr/en',
  },
  {
    username: 'sandro_botticelli',
    email: 'sandro.botticelli@artiva.local',
    role: 'member',
    display_name: 'Sandro Botticelli',
    bio: 'Pelukis Renaisans Awal asal Firenze (c. 1445–1510) yang termasyhur berkat garis liris anggun dan lukisan mitologi monumental di Gallerie degli Uffizi.',
    avatar_path: 'avatars/sandro-botticelli.jpg',
    website: 'https://www.uffizi.it/en',
  },
  {
    username: 'rembrandt_vanrijn',
    email: 'rembrandt@artiva.local',
    role: 'member',
    display_name: 'Rembrandt van Rijn',
    bio: 'Maestro Zaman Keemasan Belanda (1606–1669) yang menguasai teknik pencahayaan chiaroscuro dramatis dalam potret kelompok dan lukisan sejarah.',
    avatar_path: 'avatars/rembrandt-vanrijn.jpg',
    website: 'https://www.rijksmuseum.nl/en',
  },
  {
    username: 'edvard_munch',
    email: 'edvard.munch@artiva.local',
    role: 'member',
    display_name: 'Edvard Munch',
    bio: 'Pelukis dan pegrafis Norwegia (1863–1944), perintis Ekspresionisme yang mengeksplorasi tema psikologi, kecemasan eksistensial, dan warna simbolis.',
    avatar_path: 'avatars/edvard-munch.jpg',
    website: 'https://www.nasjonalmuseet.no/en/',
  },
  {
    username: 'utagawa_hiroshige',
    email: 'utagawa.hiroshige@artiva.local',
    role: 'member',
    display_name: 'Utagawa Hiroshige',
    bio: 'Maestro cetak kayu ukiyo-e Jepang (1797–1858) yang masyhur karena seri pemandangan atmosferik hujan, salju, dan jembatan Edo.',
    avatar_path: 'avatars/utagawa-hiroshige.jpg',
    website: 'https://www.brooklynmuseum.org/',
  },
  {
    username: 'nasa_archive',
    email: 'nasa.archive@artiva.local',
    role: 'member',
    display_name: 'NASA — Arsip Antariksa',
    bio: 'Arsip fotografi publik domain Badan Penerbangan dan Antariksa AS (NASA) yang mendokumentasikan misi luar angkasa bersejarah seperti program Apollo.',
    avatar_path: 'avatars/nasa-archive.png',
    website: 'https://images.nasa.gov/',
  },
  {
    username: 'michelangelo_b',
    email: 'michelangelo@artiva.local',
    role: 'member',
    display_name: 'Michelangelo Buonarroti',
    bio: 'Pematung, pelukis, dan arsitek Renaisans Tinggi Italia (1475–1564), pencipta patung marmer monumental David dan fresko Kapel Sistina.',
    avatar_path: 'avatars/michelangelo-b.jpg',
    website: 'https://www.galleriaaccademiafirenze.it/en/',
  },
  {
    username: 'steinlen_art',
    email: 'steinlen@artiva.local',
    role: 'member',
    display_name: 'Théophile-Alexandre Steinlen',
    bio: 'Ilustrator dan desainer poster Art Nouveau kelahiran Swiss (1859–1923) yang menghidupkan poster litografi legendaris Montmartre, Paris.',
    avatar_path: 'avatars/steinlen.jpg',
    website: 'https://commons.wikimedia.org/wiki/Category:Th%C3%A9ophile_Alexandre_Steinlen',
  },
  {
    username: 'georges_seurat',
    email: 'georges.seurat@artiva.local',
    role: 'member',
    display_name: 'Georges Seurat',
    bio: 'Pelukis Pasca-Impresionisme Prancis (1859–1891), perintis Neo-Impresionisme dan teknik pointilisme kromoluminarisme berbasis teori optik warna.',
    avatar_path: 'avatars/georges-seurat.jpg',
    website: 'https://www.artic.edu/artworks/27992',
  },
  {
    username: 'caspar_friedrich',
    email: 'caspar.friedrich@artiva.local',
    role: 'member',
    display_name: 'Caspar David Friedrich',
    bio: 'Pelukis lanskap Romantisisme Jerman abad ke-19 (1774–1840) yang menampilkan keagungan alam dan refleksi spiritual manusia.',
    avatar_path: 'avatars/caspar-friedrich.jpg',
    website: 'https://www.hamburger-kunsthalle.de/en',
  },
  {
    username: 'diego_velazquez',
    email: 'diego.velazquez@artiva.local',
    role: 'member',
    display_name: 'Diego Velázquez',
    bio: 'Maestro Barok Spanyol (1599–1660) dan pelukis istana Raja Felipe IV, pencipta komposisi ruang kompleks Las Meninas.',
    avatar_path: 'avatars/diego-velazquez.jpg',
    website: 'https://www.museodelprado.es/en',
  },
  {
    username: 'pieter_bruegel',
    email: 'pieter.bruegel@artiva.local',
    role: 'member',
    display_name: 'Pieter Bruegel the Elder',
    bio: 'Maestro Renaisans Utara Belanda-Flanders (c. 1525–1569) yang masyhur berkat panorama kehidupan rakyat dan lanskap musim dingin yang terperinci.',
    avatar_path: 'avatars/pieter-bruegel.jpg',
    website: 'https://www.khm.at/en/',
  },
  {
    username: 'arthur_rackham',
    email: 'arthur.rackham@artiva.local',
    role: 'member',
    display_name: 'Arthur Rackham',
    bio: 'Ilustrator buku Inggris Era Keemasan Ilustrasi (1867–1939) yang dikenal lewat goresan pena tinta detail dan palet cat air dongeng klasik.',
    avatar_path: 'avatars/arthur-rackham.jpg',
    website: 'https://commons.wikimedia.org/wiki/Category:Arthur_Rackham',
  },
  {
    username: 'alfred_stieglitz',
    email: 'alfred.stieglitz@artiva.local',
    role: 'member',
    display_name: 'Alfred Stieglitz',
    bio: 'Fotografer dan promotor seni modern Amerika Serikat (1864–1946) yang memperjuangkan fotografi sebagai bentuk seni rupa murni.',
    avatar_path: 'avatars/alfred-stieglitz.jpg',
    website: 'https://commons.wikimedia.org/wiki/Category:Alfred_Stieglitz',
  },
  {
    username: 'jules_cheret',
    email: 'jules.cheret@artiva.local',
    role: 'member',
    display_name: 'Jules Chéret',
    bio: 'Pelukis dan litografer Prancis (1836–1932) yang dijuluki Bapak Poster Modern karena revolusi teknik litografi warna besar di Paris.',
    avatar_path: 'avatars/jules-cheret.jpg',
    website: 'https://commons.wikimedia.org/wiki/Category:Jules_Ch%C3%A9ret',
  },
  // Member ditangguhkan (suspended) untuk pengujian moderasi & manajemen pengguna Admin
  {
    username: 'akun_spam_bot',
    email: 'spambot@artiva.local',
    role: 'member',
    status: 'suspended',
    display_name: 'Promo Desain Cepat (Ditangguhkan)',
    bio: 'Akun ditangguhkan oleh Admin karena berulang kali mengunggah konten promosi spam di luar ketentuan komunitas ARTIVA.',
    avatar_path: 'avatars/open-design-lab.png',
    website: null,
  },
  {
    username: 'reuploader_ilegal',
    email: 'reuploader@artiva.local',
    role: 'member',
    status: 'suspended',
    display_name: 'Galeri Reupload (Ditangguhkan)',
    bio: 'Akun ditangguhkan akibat pelanggaran atribusi hak cipta dan unggahan ulang karya tanpa izin kreator asli.',
    avatar_path: 'avatars/blender-studio.png',
    website: null,
  },
  {
    username: 'vandalis_komentar',
    email: 'vandalis@artiva.local',
    role: 'member',
    status: 'suspended',
    display_name: 'Akun Vandalis (Ditangguhkan)',
    bio: 'Akun ditangguhkan karena pelanggaran pedoman interaksi komunitas dan penyalahgunaan fitur pelaporan.',
    avatar_path: 'avatars/edvard-munch.jpg',
    website: null,
  },
  // Kurator aktif (approved)
  {
    username: 'kurator_galeri',
    email: 'kurator.galeri@artiva.local',
    role: 'curator',
    status: 'active',
    display_name: 'Dewan Kurasi Arsip ARTIVA',
    bio: 'Tim kurator independen ARTIVA yang mengkurasi pameran tematik, tantangan lintas disiplin, dan arsip karya seni publik terbuka.',
    avatar_path: 'avatars/raden-saleh.jpg',
    website: 'https://commons.wikimedia.org/',
    verification: {
      status: 'approved',
      note: 'Disetujui sebagai Dewan Kurasi Arsip utama ARTIVA.',
      submittedHoursAgo: 720,
      reviewedHoursAgo: 700,
    },
  },
  {
    username: 'kurator_seni_rupa',
    email: 'kurator.senirupa@artiva.local',
    role: 'curator',
    status: 'active',
    display_name: 'Nindya Kartika (Kurator Seni Rupa)',
    bio: 'Kurator pameran seni lukis klasik, sejarah seni rupa Nusantara, dan arsip lukisan Romantisisme hingga Modern.',
    avatar_path: 'avatars/johannes-vermeer.jpg',
    website: 'https://artiva.local/kurator/seni-rupa',
    verification: {
      status: 'approved',
      note: 'Rekam jejak kurasi pameran seni rupa terverifikasi dengan lengkap.',
      submittedHoursAgo: 620,
      reviewedHoursAgo: 600,
    },
  },
  {
    username: 'kurator_fotografi',
    email: 'kurator.fotografi@artiva.local',
    role: 'curator',
    status: 'active',
    display_name: 'Bima Maheswara (Kurator Fotografi)',
    bio: 'Kurator fotografi dokumenter, lanskap hitam-putih, dan konservasi arsip visual bersejarah.',
    avatar_path: 'avatars/ansel-adams.jpg',
    website: 'https://artiva.local/kurator/fotografi',
    verification: {
      status: 'approved',
      note: 'Portofolio kurasi fotografi dokumenter dan katalog arsip memenuhi syarat.',
      submittedHoursAgo: 540,
      reviewedHoursAgo: 520,
    },
  },
  {
    username: 'kurator_digital',
    email: 'kurator.digital@artiva.local',
    role: 'curator',
    status: 'active',
    display_name: 'Kirana Putri (Kurator Digital & 3D)',
    bio: 'Kurator ekosistem desain antarmuka sumber terbuka, motion graphics, dan seni 3D interaktif.',
    avatar_path: 'avatars/blender-studio.png',
    website: 'https://artiva.local/kurator/digital',
    verification: {
      status: 'approved',
      note: 'Pengalaman kurasi desain produk digital dan komunitas 3D terbuka terverifikasi.',
      submittedHoursAgo: 480,
      reviewedHoursAgo: 460,
    },
  },
  // Kurator menunggu verifikasi (pending)
  {
    username: 'kurator_pending_1',
    email: 'rendra.kurator@artiva.local',
    role: 'curator',
    status: 'pending',
    display_name: 'Rendra Baskara',
    bio: 'Peneliti ilustrasi buku anak dan komik independen Asia Tenggara. Mengajukan diri sebagai kurator kategori Ilustrasi.',
    avatar_path: 'avatars/arthur-rackham.jpg',
    website: 'https://artiva.local/portofolio/rendra',
    verification: {
      status: 'pending',
      note: null,
      submittedHoursAgo: 18,
      reviewedHoursAgo: null,
    },
  },
  {
    username: 'kurator_pending_2',
    email: 'larasati.kurator@artiva.local',
    role: 'curator',
    status: 'pending',
    display_name: 'Larasati Dewi',
    bio: 'Desainer tipografi dan pengajar desain komunikasi visual di Yogyakarta. Ingin membuka tantangan poster editorial bulanan.',
    avatar_path: 'avatars/alphonse-mucha.jpg',
    website: 'https://artiva.local/portofolio/larasati',
    verification: {
      status: 'pending',
      note: null,
      submittedHoursAgo: 11,
      reviewedHoursAgo: null,
    },
  },
  {
    username: 'kurator_pending_3',
    email: 'dimas.kurator@artiva.local',
    role: 'curator',
    status: 'pending',
    display_name: 'Dimas Pratama',
    bio: 'Seniman media baru dan penggerak pameran instalasi arsitektur digital di Bandung.',
    avatar_path: 'avatars/georges-seurat.jpg',
    website: 'https://artiva.local/portofolio/dimas',
    verification: {
      status: 'pending',
      note: null,
      submittedHoursAgo: 5,
      reviewedHoursAgo: null,
    },
  },
  // Kurator ditolak (rejected — sesuai aturan sistem: users.status='pending' & curator_verifications.status='rejected')
  {
    username: 'kurator_ditolak_1',
    email: 'fajar.kurator@artiva.local',
    role: 'curator',
    status: 'pending',
    display_name: 'Fajar Nugroho',
    bio: 'Tertarik menyelenggarakan lomba desain di ARTIVA.',
    avatar_path: 'avatars/toulouse-lautrec.jpg',
    website: null,
    verification: {
      status: 'rejected',
      note: 'Portofolio kurasi belum menyertakan tautan rekam jejak pameran, publikasi, atau katalog yang dapat diverifikasi.',
      submittedHoursAgo: 96,
      reviewedHoursAgo: 72,
    },
  },
  {
    username: 'kurator_ditolak_2',
    email: 'citra.kurator@artiva.local',
    role: 'curator',
    status: 'pending',
    display_name: 'Citra Pramesti',
    bio: 'Kolektor seni digital pemula.',
    avatar_path: 'avatars/claude-monet.jpg',
    website: null,
    verification: {
      status: 'rejected',
      note: 'Profil dan bio pengajuan terlalu singkat dan belum mencantumkan bidang spesialisasi kurasi secara spesifik.',
      submittedHoursAgo: 140,
      reviewedHoursAgo: 110,
    },
  },
  // Kurator ditangguhkan (suspended)
  {
    username: 'kurator_tangguh',
    email: 'bagas.kurator@artiva.local',
    role: 'curator',
    status: 'suspended',
    display_name: 'Bagas Santoso (Ditangguhkan)',
    bio: 'Mantan kurator tamu yang akunnya ditangguhkan sementara akibat pelanggaran ketentuan transparansi penjurian.',
    avatar_path: 'avatars/diego-velazquez.jpg',
    website: 'https://artiva.local/kurator/bagas',
    verification: {
      status: 'approved',
      note: 'Sempat disetujui sebelum ditangguhkan oleh Admin.',
      submittedHoursAgo: 400,
      reviewedHoursAgo: 380,
    },
  },
];

// Urutan dibuat dari yang paling awal hingga paling baru; 4 item published terakhir akan muncul sebagai 4 karya terbaru di Beranda
// dan item published paling terakhir menjadi Sorotan Hero Beranda.
const REAL_ARTWORKS = [
  // 6 Karya moderasi (3 hidden, 3 removed) untuk kelengkapan status Admin & Laporan
  {
    username: 'edvard_munch',
    category_slug: 'lukisan',
    title: 'Sketsa Ekspresi Senja — Arsip Pribadi (Disembunyikan)',
    description:
      'Draf studi warna ekspresionis yang sementara disembunyikan dari katalog publik untuk kurasi internal.',
    image_path: 'artworks/mod-hidden-1.jpg',
    tags: ['sketsa', 'ekspresionisme'],
    status: 'hidden',
    hoursAgo: 560,
  },
  {
    username: 'claude_monet',
    category_slug: 'lukisan',
    title: 'Studi Refleksi Kolam — Draf Warna (Disembunyikan)',
    description:
      'Versi studi pencahayaan kolam Giverny yang ditandai tersembunyi sembari menunggu verifikasi katalog.',
    image_path: 'artworks/mod-hidden-2.jpg',
    tags: ['impresionisme', 'studi-warna'],
    status: 'hidden',
    hoursAgo: 550,
  },
  {
    username: 'reuploader_ilegal',
    category_slug: '3d-art',
    title: 'Uji Render Pencahayaan Kafe Tanpa Atribusi (Disembunyikan)',
    description:
      'Unggahan render 3D yang disembunyikan oleh Admin setelah laporan hak cipta karena menghapus atribusi lisensi CC BY pencipta aslinya.',
    image_path: 'artworks/mod-hidden-3.png',
    tags: ['render-3d'],
    status: 'hidden',
    hoursAgo: 540,
  },
  {
    username: 'akun_spam_bot',
    category_slug: 'desain-grafis',
    title: 'Promo Jasa Desain Murah Kilat 50 Ribu!!! (Dihapus)',
    description:
      'Konten promosi spam komersial yang melanggar pedoman komunitas dan telah dihapus permanen melalui moderasi laporan.',
    image_path: 'artworks/mod-removed-1.jpg',
    tags: ['poster-klasik'],
    status: 'removed',
    hoursAgo: 530,
  },
  {
    username: 'reuploader_ilegal',
    category_slug: 'fotografi',
    title: 'Reupload Lanskap Pegunungan Tanpa Izin (Dihapus)',
    description:
      'Unggahan ulang foto lanskap dengan klaim kepemilikan palsu yang telah dihapus oleh Admin setelah verifikasi plagiarisme.',
    image_path: 'artworks/mod-removed-2.jpg',
    tags: ['fotografi-alam'],
    status: 'removed',
    hoursAgo: 520,
  },
  {
    username: 'vandalis_komentar',
    category_slug: 'desain-grafis',
    title: 'Unggahan Poster Promosi Ilegal & Menyesatkan (Dihapus)',
    description:
      'Karya yang melanggar ketentuan konten tidak pantas dan telah diturunkan oleh tim moderasi ARTIVA.',
    image_path: 'artworks/mod-removed-3.jpg',
    tags: ['poster-klasik'],
    status: 'removed',
    hoursAgo: 510,
  },
  // 10 Karya nyata baru tambahan (published)
  {
    username: 'open_design_lab',
    category_slug: 'ui-ux',
    title: 'GNOME Shell 42.2 — Tata Letak Ruang Kerja Aktivitas',
    description:
      'Antarmuka nyata desktop sumber terbuka GNOME Shell 42.2 yang menonjolkan alur kerja bebas gangguan melalui ikhtisar ruang kerja horizontal, bilah pencarian terpadu, dan hierarki fokus yang jelas. Sumber: Wikimedia Commons (Lisensi CC BY-SA 4.0).',
    image_path: 'artworks/gnome-shell-42-ui.png',
    tags: ['ui-ux', 'open-source-ui', 'desktop-ui', 'sistem-desain'],
    hoursAgo: 500,
  },
  {
    username: 'blender_studio',
    category_slug: '3d-art',
    title: 'Sprite Fright — Render 3D Blender 3.0 (2021)',
    description:
      'Karya render 3D resmi splash screen Blender 3.0 dari film pendek terbuka "Sprite Fright" karya Blender Studio (2021). Memperlihatkan gaya karakter bergaya kartun gelap, pencahayaan rim hutan malam, serta pipeline rendering Cycles X generasi baru. Sumber: Wikimedia Commons (Lisensi CC BY 4.0).',
    image_path: 'artworks/blender-30-sprite-fright.png',
    tags: ['blender-cycles', 'open-movie', 'karakter-3d', 'render-3d'],
    hoursAgo: 492,
  },
  {
    username: 'jules_cheret',
    category_slug: 'desain-grafis',
    title: 'Palais de Glace, Champs-Élysées (1893)',
    description:
      'Poster litografi warna karya Jules Chéret tahun 1893 untuk arena seluncur es Palais de Glace di Paris. Memperlihatkan figur perempuan energik khas "Chérette", sapuan warna kuning-merah cerah, dan tipografi tangan ekspresif yang merevolusi desain poster jalanan abad ke-19. Sumber: Wikimedia Commons (Public Domain).',
    image_path: 'artworks/cheret-palais-de-glace.jpg',
    tags: ['poster-klasik', 'litografi', 'tipografi', 'belle-epoque'],
    hoursAgo: 484,
  },
  {
    username: 'alfred_stieglitz',
    category_slug: 'fotografi',
    title: 'The Steerage (1907)',
    description:
      'Fotografi hitam-putih modernis ikonik karya Alfred Stieglitz yang dipotret pada Juni 1907 di atas kapal SS Kaiser Wilhelm II menuju Eropa. Komposisi jembatan putih miring, cerobong diagonal, dan bayangan tegas menjadi tonggak transisi dari piktorialisme menuju fotografi lurus (straight photography). Sumber: Wikimedia Commons (Public Domain).',
    image_path: 'artworks/stieglitz-the-steerage.jpg',
    tags: ['fotografi-dokumenter', 'hitam-putih', 'modernisme', 'komposisi'],
    hoursAgo: 476,
  },
  {
    username: 'arthur_rackham',
    category_slug: 'ilustrasi',
    title: 'A Mad Tea-Party — Ilustrasi Alice in Wonderland (1907)',
    description:
      'Ilustrasi tinta pena dan cat air karya Arthur Rackham untuk edisi 1907 novel "Alice\'s Adventures in Wonderland" karya Lewis Carroll. Menonjolkan garis tinta organik yang lincah, ekspresi karakter Mad Hatter dan March Hare yang jenaka, serta palet tanah lembut Era Keemasan Ilustrasi Inggris. Sumber: Wikimedia Commons (Public Domain).',
    image_path: 'artworks/rackham-mad-tea-party.jpg',
    tags: ['ilustrasi-buku', 'cat-air', 'fantasi', 'ilustrasi-klasik'],
    hoursAgo: 468,
  },
  {
    username: 'pieter_bruegel',
    category_slug: 'lukisan',
    title: 'The Hunters in the Snow — Pemburu di Salju (1565)',
    description:
      'Lukisan cat minyak di atas panel kayu ek (117 × 162 cm) karya Pieter Bruegel the Elder tahun 1565 dari siklus enam lukisan musim. Membentangkan perspektif panoramik pemburu dan anjingnya yang pulang menuruni bukit bersalju menghadap desa, danau beku tempat warga bermain seluncur, serta pegunungan Alpen di kejauhan. Koleksi Kunsthistorisches Museum, Wina (Public Domain).',
    image_path: 'artworks/bruegel-hunters-snow.jpg',
    tags: ['renaisans-utara', 'lanskap', 'cat-minyak', 'musim-dingin'],
    hoursAgo: 460,
  },
  {
    username: 'raden_saleh',
    category_slug: 'lukisan',
    title: 'Berburu Rusa — The Deer Hunt (1846)',
    description:
      'Lukisan cat minyak di atas kanvas karya Raden Saleh tahun 1846 yang memadukan drama perburuan berkuda di padang tropis dengan pencahayaan atmosferik Romantisisme. Gerakan kuda, pemburu Jawa, dan rusa yang melompat membentuk ritme diagonal penuh ketegangan. Sumber: Wikimedia Commons (Public Domain).',
    image_path: 'artworks/raden-saleh-deer-hunt.jpg',
    tags: ['romantisisme', 'sejarah-nusantara', 'cat-minyak', 'satwa'],
    hoursAgo: 452,
  },
  {
    username: 'diego_velazquez',
    category_slug: 'lukisan',
    title: 'Las Meninas (1656)',
    description:
      'Mahakarya cat minyak monumental di atas kanvas (318 × 276 cm) karya Diego Velázquez tahun 1656. Dikenal sebagai studi perspektif dan realitas paling kompleks dalam sejarah seni rupa Barat: menampilkan Infanta Margarita dikelilingi dayang, Velázquez sendiri di depan kanvas besar, dan pantulan Raja Felipe IV bersama Ratu di cermin latar belakang. Koleksi Museo del Prado, Madrid (Public Domain).',
    image_path: 'artworks/velazquez-las-meninas.jpg',
    tags: ['barok', 'cat-minyak', 'perspektif', 'prado'],
    hoursAgo: 444,
  },
  {
    username: 'caspar_friedrich',
    category_slug: 'lukisan',
    title: 'Wanderer above the Sea of Fog (c. 1818)',
    description:
      'Lukisan cat minyak di atas kanvas (94,8 × 74,8 cm) karya Caspar David Friedrich sekitar tahun 1818, ikon utama gerakan Romantisisme Jerman. Sosok pengembara yang membelakangi penonton (Rückenfigur) di puncak karang menghadap lautan kabut mengajak penikmat turut merasakan keagungan sekaligus misteri alam. Koleksi Hamburger Kunsthalle (Public Domain).',
    image_path: 'artworks/friedrich-wanderer-fog.jpg',
    tags: ['romantisisme', 'lanskap', 'cat-minyak', 'kabut'],
    hoursAgo: 436,
  },
  {
    username: 'georges_seurat',
    category_slug: 'lukisan',
    title: 'A Sunday on La Grande Jatte (1884–1886)',
    description:
      'Lukisan cat minyak monumental di atas kanvas (207,5 × 308,1 cm) karya Georges Seurat yang dikerjakan selama dua tahun menggunakan jutaan titik warna murni bersebelahan (pointilisme/divisionisme) agar mata penonton mencampur warna secara optis. Menggambarkan warga Paris bersantai di tepi Sungai Seine. Koleksi Art Institute of Chicago (Public Domain).',
    image_path: 'artworks/seurat-grande-jatte.jpg',
    tags: ['pointilisme', 'pasca-impresionisme', 'cat-minyak', 'optik-warna'],
    hoursAgo: 428,
  },
  {
    username: 'michelangelo_b',
    category_slug: 'lainnya',
    title: 'Winged Victory of Samothrace — Nike dari Samothraki (c. 190 SM)',
    description:
      'Patung marmer Helenistik dari Yunani Kuno (dibuat sekitar 190 SM dari marmer putih Parian di atas haluan kapal marmer Lartos; tinggi patung 275 cm, tinggi total 557 cm). Menggambarkan Dewi Kemenangan Nike yang mendarat di haluan kapal perang dengan lipatan kain basah tertiup angin laut yang sangat hidup. Koleksi Musée du Louvre, Paris (Lisensi foto dokumentasi: CC0).',
    image_path: 'artworks/nike-samothrace.jpg',
    tags: ['seni-patung', 'marmer', 'helenistik', 'louvre'],
    hoursAgo: 420,
  },
  {
    username: 'michelangelo_b',
    category_slug: 'lainnya',
    title: 'David — Patung Marmer Carrara (1501–1504)',
    description:
      'Mahakarya seni patung Renaisans Tinggi karya Michelangelo Buonarroti yang dipahat dari satu blok tunggal marmer putih Carrara (tinggi total 517 cm, lebar 199 cm) pada 1501–1504. Menampilkan pose contrapposto penuh ketegangan psikologis sesaat sebelum David menghadapi Goliat. Koleksi Galleria dell\'Accademia, Firenze (Lisensi foto dokumentasi: CC BY-SA 4.0).',
    image_path: 'artworks/michelangelo-david.jpg',
    tags: ['seni-patung', 'renaisans', 'marmer-carrara', 'anatomi'],
    hoursAgo: 408,
  },
  {
    username: 'open_design_lab',
    category_slug: 'ui-ux',
    title: 'GNOME Files 47 — Sistem Antarmuka Libadwaita Modern',
    description:
      'Tampilan antarmuka pengelola berkas nyata GNOME Files (Nautilus) versi 47 berbasis sistem desain Libadwaita. Memperlihatkan tata letak sidebar adaptif, bilah alamat terpadu, ikonografi konsisten, dan kontras tipografi yang bersih untuk alur kerja desktop modern. Sumber: Wikimedia Commons (Lisensi CC BY-SA 4.0).',
    image_path: 'artworks/gnome-files-47-ui.png',
    tags: ['ui-design', 'libadwaita', 'open-source-ui', 'desktop-ui'],
    hoursAgo: 396,
  },
  {
    username: 'blender_studio',
    category_slug: '3d-art',
    title: 'Watercolor Café — Render 3D Blender 4.0 (2023)',
    description:
      'Karya resmi splash screen Blender 4.0 yang diciptakan oleh seniman visual Gaku Tada (2023). Menggabungkan pemodelan 3D bergaya non-fotorealistis (NPR) dengan tekstur sapuan cat air lembut dan pencahayaan kafe sore yang hangat menggunakan shader Blender. Sumber: Wikimedia Commons (Lisensi CC BY-SA 3.0).',
    image_path: 'artworks/blender-40-cafe.png',
    tags: ['blender-cycles', 'npr-3d', 'render-3d', 'cat-air'],
    hoursAgo: 384,
  },
  {
    username: 'blender_studio',
    category_slug: '3d-art',
    title: 'Spring — Adegan Film Pendek Terbuka Blender 2.80 (2019)',
    description:
      'Karya render 3D produksi resmi Blender Studio dari film pendek animasi terbuka "Spring" (2019) arahan sutradara Andy Goralczyk. Menampilkan perpaduan desain karakter ekspresif, vegetasi pegunungan berkabut, dan tata cahaya puitis yang seluruh asetnya dirilis terbuka bagi komunitas 3D global. Sumber: Wikimedia Commons (Lisensi CC BY-SA 4.0).',
    image_path: 'artworks/blender-280-spring.png',
    tags: ['open-movie', 'render-3d', 'karakter-3d', 'blender-studio'],
    hoursAgo: 372,
  },
  {
    username: 'steinlen_art',
    category_slug: 'desain-grafis',
    title: 'Tournée du Chat Noir (1896)',
    description:
      'Poster litografi warna legendaris (~139 × 99 cm) karya Théophile-Alexandre Steinlen tahun 1896 untuk tur kabaret Le Chat Noir milik Rodolphe Salis di Montmartre, Paris. Siluet kucing hitam pekat berbingkai halo bergaya Jepang serta paduan merah, kuning, dan hitam menjadikannya ikon abadi desain grafis modern. Koleksi LACMA / Van Gogh Museum (Public Domain).',
    image_path: 'artworks/steinlen-chat-noir.jpg',
    tags: ['poster-klasik', 'litografi', 'art-nouveau', 'montmartre'],
    hoursAgo: 360,
  },
  {
    username: 'alphonse_mucha',
    category_slug: 'desain-grafis',
    title: 'Rêverie — Litografi Dekoratif Art Nouveau (1897)',
    description:
      'Panel dekoratif litografi warna karya Alphonse Mucha tahun 1897 yang awalnya dibuat untuk majalah La Plume di Paris. Menampilkan figur perempuan yang terhanyut dalam lamunan dengan lingkaran halo flora mozaik, palet hangat muted, dan ritme garis organik khas gaya Mucha. Sumber: Wikimedia Commons (Public Domain).',
    image_path: 'artworks/mucha-reverie-1897.jpg',
    tags: ['art-nouveau', 'litografi', 'ornamen', 'ilustrasi-klasik'],
    hoursAgo: 348,
  },
  {
    username: 'nasa_archive',
    category_slug: 'fotografi',
    title: 'Earthrise — Misi Apollo 8 (24 Desember 1968)',
    description:
      'Salah satu foto paling berpengaruh dalam sejarah manusia, dipotret oleh astronaut William Anders pada 24 Desember 1968 dari orbit Bulan dalam misi Apollo 8 menggunakan kamera Hasselblad 500EL. Menampilkan Bumi biru yang rapuh terbit di atas cakrawala tandus Bulan di tengah ruang hampa gelap. Arsip NASA (Public Domain).',
    image_path: 'artworks/apollo8-earthrise.jpg',
    tags: ['fotografi-antariksa', 'apollo-8', 'sejarah', 'nasa'],
    hoursAgo: 336,
  },
  {
    username: 'ansel_adams',
    category_slug: 'fotografi',
    title: 'Evening, McDonald Lake, Glacier National Park (1942)',
    description:
      'Fotografi lanskap hitam-putih karya Ansel Adams (koleksi proyek Departemen Dalam Negeri AS, 1933–1942) di Taman Nasional Glacier, Montana. Memotret keheningan senja di atas Danau McDonald dengan pantulan awan lembut dan siluet pegunungan berlapis melalui rentang tonal presisi tinggi. Arsip National Archives (NARA 519861, Public Domain).',
    image_path: 'artworks/adams-mcdonald-lake.jpg',
    tags: ['fotografi-alam', 'hitam-putih', 'zone-system', 'lanskap'],
    hoursAgo: 324,
  },
  {
    username: 'kassian_cephas',
    category_slug: 'fotografi',
    title: 'Relief Karmawibhangga Borobudur — Panel Arsip KITLV (1890–1891)',
    description:
      'Salah satu dari 160 pelat fotografi arkeologi legendaris karya Kassian Cephas pada 1890–1891 yang merekam secara utuh deretan relief Karmawibhangga di kaki tersembunyi Candi Borobudur. Dokumentasi ini menjadi referensi visual terpenting karena sebagian besar relief tersebut kembali ditutup batu penguat candi. Arsip KITLV 40091 / Leiden University Libraries (Public Domain).',
    image_path: 'artworks/cephas-borobudur-relief.jpg',
    tags: ['borobudur', 'fotografi-dokumenter', 'sejarah-nusantara', 'arsip'],
    hoursAgo: 312,
  },
  {
    username: 'ernst_haeckel',
    category_slug: 'ilustrasi',
    title: 'Kunstformen der Natur — Plate 99: Trochilidae (1904)',
    description:
      'Pelat ilustrasi litografi warna nomor 99 dari mahakarya Kunstformen der Natur (1904) karya Ernst Haeckel yang menampilkan beragam spesies burung kolibri (Trochilidae) dengan ketelitian anatomi bulu, ekor pita, dan komposisi radial yang simetris sekaligus puitis. Sumber: Wikimedia Commons (Public Domain).',
    image_path: 'artworks/haeckel-trochilidae.jpg',
    tags: ['ilustrasi-ilmiah', 'litografi', 'fauna', 'detail-tinggi'],
    hoursAgo: 300,
  },
  {
    username: 'utagawa_hiroshige',
    category_slug: 'ilustrasi',
    title: 'Sudden Shower over Shin-Ōhashi Bridge and Atake (1857)',
    description:
      'Cetak balok kayu polikrom ukiyo-e (ōban tate-e) karya Utagawa Hiroshige tahun 1857 dari seri terkenal "One Hundred Famous Views of Edo". Menggunakan garis hujan diagonal berlapis yang diukir pada dua blok kayu terpisah serta gradasi bokashi gelap untuk menghidupkan suasana hujan deras mendadak di Sungai Sumida. Koleksi Brooklyn Museum / The Met (Public Domain).',
    image_path: 'artworks/hiroshige-sudden-shower.jpg',
    tags: ['ukiyo-e', 'cetak-kayu', 'hujan', 'ilustrasi-klasik'],
    hoursAgo: 288,
  },
  {
    username: 'katsushika_hokusai',
    category_slug: 'ilustrasi',
    title: 'Gaifū Kaisei — Red Fuji (c. 1830–1832)',
    description:
      'Cetak balok kayu ukiyo-e (tinta dan warna di atas kertas, 25,7 × 38 cm) karya Katsushika Hokusai dari seri "Thirty-Six Views of Mount Fuji". Mengabadikan momen langka awal musim gugur saat matahari pagi menyinari lereng Gunung Fuji hingga membara merah tembaga di bawah langit biru berawan cirrus. Koleksi The Metropolitan Museum of Art (Public Domain).',
    image_path: 'artworks/hokusai-red-fuji.jpg',
    tags: ['ukiyo-e', 'cetak-kayu', 'gunung-fuji', 'ilustrasi-klasik'],
    hoursAgo: 276,
  },
  {
    username: 'raden_saleh',
    category_slug: 'lukisan',
    title: 'La Chasse au Lion — Perburuan Singa (1841)',
    description:
      'Lukisan cat minyak di atas kanvas (88,3 × 142,3 cm) karya Raden Saleh tahun 1841 yang menggambarkan dinamika perburuan singa dengan komposisi diagonal dramatis, pencahayaan kontras, serta studi anatomi kuda dan satwa liar yang terinspirasi aliran Romantisisme Eugène Delacroix. Koleksi Art Museum Riga Bourse, Latvia (Public Domain).',
    image_path: 'artworks/raden-saleh-lion-hunt.jpg',
    tags: ['romantisisme', 'sejarah-nusantara', 'cat-minyak', 'satwa'],
    hoursAgo: 264,
  },
  {
    username: 'vincent_vangogh',
    category_slug: 'lukisan',
    title: 'Sunflowers — Lima Belas Bunga Matahari (1888)',
    description:
      'Lukisan cat minyak di atas kanvas (92,1 × 73 cm) yang dilukis Vincent van Gogh pada Agustus 1888 di Arles, Prancis, untuk menghias kamar Paul Gauguin di Rumah Kuning. Menggunakan tiga spektrum pigmen kuning krom pekat dan sapuan impasto tebal guna menampilkan siklus mekar hingga layu bunga matahari. Koleksi National Gallery, London (Public Domain).',
    image_path: 'artworks/vangogh-sunflowers.jpg',
    tags: ['pasca-impresionisme', 'impasto', 'cat-minyak', 'still-life'],
    hoursAgo: 252,
  },
  {
    username: 'claude_monet',
    category_slug: 'lukisan',
    title: 'Nymphéas — Water Lilies (1906)',
    description:
      'Lukisan cat minyak di atas kanvas (89,9 × 94,1 cm) karya Claude Monet tahun 1906 dari seri kolam teratai di taman rumahnya di Giverny, Prancis. Menghilangkan garis cakrawala sepenuhnya sehingga penonton langsung tenggelam dalam pantulan langit, awan, dan kelopak teratai di permukaan air. Koleksi Art Institute of Chicago (Public Domain).',
    image_path: 'artworks/monet-water-lilies.jpg',
    tags: ['impresionisme', 'cat-minyak', 'giverny', 'alam'],
    hoursAgo: 240,
  },
  {
    username: 'edvard_munch',
    category_slug: 'lukisan',
    title: 'Skrik — The Scream (1893)',
    description:
      'Karya cat minyak, tempera, dan pastel di atas karton (91 × 73,5 cm) oleh Edvard Munch tahun 1893. Terinspirasi oleh langit senja merah darah di atas fjord Oslo, garis berombak dan perspektif jembatan yang tajam menjadikannya simbol ekspresionisme universal atas kegelisahan batin manusia modern. Koleksi Nasjonalmuseet, Oslo (Public Domain).',
    image_path: 'artworks/munch-the-scream.jpg',
    tags: ['ekspresionisme', 'simbolisme', 'senja', 'cat-minyak'],
    hoursAgo: 228,
  },
  {
    username: 'rembrandt_vanrijn',
    category_slug: 'lukisan',
    title: 'De Nachtwacht — The Night Watch (1642)',
    description:
      'Lukisan cat minyak monumental di atas kanvas (363 × 437 cm) karya Rembrandt van Rijn tahun 1642 yang menggambarkan kompi milisi Kapten Frans Banninck Cocq bersiap berbaris. Revolusioner pada zamannya karena mengubah potret kelompok kaku menjadi adegan penuh gerak, kedalaman teaterikal, dan chiaroscuro dramatis. Koleksi Rijksmuseum, Amsterdam (Public Domain).',
    image_path: 'artworks/rembrandt-night-watch.jpg',
    tags: ['zaman-keemasan-belanda', 'chiaroscuro', 'cat-minyak', 'barok'],
    hoursAgo: 216,
  },
  {
    username: 'sandro_botticelli',
    category_slug: 'lukisan',
    title: 'La Nascita di Venere — The Birth of Venus (c. 1484–1486)',
    description:
      'Lukisan tempera di atas kanvas berukuran besar (172,5 × 278,5 cm) karya Sandro Botticelli sekitar tahun 1484–1486 untuk keluarga Medici di Firenze. Menampilkan Dewi Venus berdiri di atas cangkang kerang raksasa yang ditiup angin Zephyrus menuju pantai Siprus dengan harmoni garis puitis khas Renaisans Awal. Koleksi Gallerie degli Uffizi, Firenze (Public Domain).',
    image_path: 'artworks/botticelli-birth-of-venus.jpg',
    tags: ['renaisans', 'tempera', 'mitologi', 'uffizi'],
    hoursAgo: 204,
  },
  {
    username: 'leonardo_davinci',
    category_slug: 'lukisan',
    title: 'Mona Lisa — La Gioconda (c. 1503–1519)',
    description:
      'Potret cat minyak di atas panel kayu poplar (77 × 53 cm) karya Leonardo da Vinci yang dikerjakan antara 1503 hingga sekitar 1519. Terkenal di seluruh dunia karena senyum enigmatis Lisa Gherardini, transisi bayangan tanpa garis tegas (sfumato), serta lanskap pegunungan berkabut perspektif udara di latar belakang. Koleksi Musée du Louvre, Paris (Public Domain).',
    image_path: 'artworks/davinci-mona-lisa.jpg',
    tags: ['renaisans', 'sfumato', 'potret', 'louvre'],
    hoursAgo: 192,
  },
  {
    username: 'auguste_rodin',
    category_slug: 'lainnya',
    title: 'Le Penseur — The Thinker (1904)',
    description:
      'Patung perunggu monumental karya Auguste Rodin (versi besar selesai dipamerkan tahun 1904; dimensi 189 × 98 × 140 cm, berat ~700 kg), koleksi Musée Rodin, Paris. Awalnya dirancang sebagai sosok penyair Dante di puncak gerbang "The Gates of Hell", karya ini menjadi simbol universal perenungan filosofis dan tenaga kreatif manusia. Sumber foto dokumentasi: Wikimedia Commons (Public Domain).',
    image_path: 'artworks/rodin-the-thinker.jpg',
    tags: ['patung-perunggu', 'seni-patung', 'musee-rodin', 'klasik'],
    hoursAgo: 180,
  },
  {
    username: 'open_design_lab',
    category_slug: 'ui-ux',
    title: 'elementary OS 8 — Sistem Desain Desktop Pantheon',
    description:
      'Tampilan antarmuka nyata sistem operasi sumber terbuka elementary OS 8 dengan lingkungan desktop Pantheon. Menonjolkan konsistensi tipografi sistem, hierarki panel atas yang tenang, tata letak dock minimalis, serta dukungan penuh sesi Wayland yang ramah aksesibilitas. Sumber: Wikimedia Commons (Lisensi GPLv3).',
    image_path: 'artworks/elementary-os-8-ui.png',
    tags: ['ui-design', 'sistem-desain', 'open-source-ui', 'desktop-ui'],
    hoursAgo: 168,
  },
  {
    username: 'open_design_lab',
    category_slug: 'ui-ux',
    title: 'Penpot — Ruang Kerja Desain & Prototipe Sumber Terbuka',
    description:
      'Antarmuka nyata Penpot, platform desain UI/UX dan prototipe berbasis web dan standar terbuka SVG/CSS Grid. Memperlihatkan integrasi kanvas vektor, inspektor properti tata letak fleksibel, dan kolaborasi desainer-pengembang dalam satu ruang kerja. Sumber: Wikimedia Commons (Lisensi CC BY-SA 4.0).',
    image_path: 'artworks/penpot-ui-workspace.webp',
    tags: ['penpot', 'prototyping', 'ui-ux', 'open-source-ui'],
    hoursAgo: 156,
  },
  {
    username: 'blender_studio',
    category_slug: '3d-art',
    title: 'Interior Arsitektur 3D — Splash Render Blender 4.1 (2024)',
    description:
      'Render 3D resolusi tinggi dari adegan resmi splash screen Blender 4.1 yang dirancang oleh Lynxsdesign (Jon) dan dirender ulang beresolusi tinggi dengan Cycles. Menampilkan komposisi arsitektur interior yang kaya detail material kayu, pencahayaan global alami, serta refleksi presisi. Sumber: Wikimedia Commons (Lisensi CC BY 4.0).',
    image_path: 'artworks/blender-41-interior.jpg',
    tags: ['blender-cycles', 'arsitektur-3d', 'render-3d', 'pencahayaan'],
    hoursAgo: 144,
  },
  {
    username: 'toulouse_lautrec',
    category_slug: 'desain-grafis',
    title: 'Moulin Rouge: La Goulue (1891)',
    description:
      'Poster litografi warna tiga lembar (191 × 117 cm) karya Henri de Toulouse-Lautrec tahun 1891 untuk kabaret Moulin Rouge di Paris. Diakui sebagai tonggak lahirnya desain poster modern melalui penyederhanaan bentuk, bidang warna datar, siluet kontras di latar depan, dan tipografi berulang yang ritmis. Koleksi Art Institute of Chicago / The Met (Public Domain).',
    image_path: 'artworks/lautrec-moulin-rouge.jpg',
    tags: ['poster-klasik', 'litografi', 'tipografi', 'montmartre'],
    hoursAgo: 132,
  },
  {
    username: 'alphonse_mucha',
    category_slug: 'desain-grafis',
    title: 'Poster Litografi "JOB" Art Nouveau (1896)',
    description:
      'Poster iklan litografi warna karya Alphonse Mucha (1896) yang menjadi ikon gerakan Art Nouveau di Paris. Memadukan garis kontur mengalir ("whiplash curve"), ornamen bingkai geometris-floral, rambut ikal berirama, dan monogram tipografi di latar belakang untuk menciptakan komposisi grafis yang harmonis. Sumber: Wikimedia Commons (Public Domain).',
    image_path: 'artworks/mucha-job-1896.jpg',
    tags: ['art-nouveau', 'litografi', 'poster-klasik', 'ornamen'],
    hoursAgo: 120,
  },
  {
    username: 'dorothea_lange',
    category_slug: 'fotografi',
    title: 'Migrant Mother, Nipomo, California (1936)',
    description:
      'Foto dokumenter hitam-putih ikonik karya Dorothea Lange yang dipotret pada Maret 1936 di Nipomo, California, menampilkan Florence Owens Thompson (32 tahun) bersama anak-anaknya di masa Depresi Besar. Arsip Farm Security Administration, Library of Congress (LCCN 93506674, Public Domain).',
    image_path: 'artworks/lange-migrant-mother.jpg',
    tags: ['fotografi-dokumenter', 'potret', 'hitam-putih', 'sejarah'],
    hoursAgo: 108,
  },
  {
    username: 'ansel_adams',
    category_slug: 'fotografi',
    title: 'The Tetons and the Snake River (1942)',
    description:
      'Fotografi lanskap hitam-putih karya Ansel Adams tahun 1942 di Grand Teton National Park, Wyoming, untuk Departemen Dalam Negeri AS. Memperlihatkan lekuk Sungai Snake yang memandu mata menuju barisan puncak salju Teton dengan kontras dramatis khas Zone System. Koleksi National Archives (NARA, Public Domain).',
    image_path: 'artworks/adams-tetons-snake-river.jpg',
    tags: ['fotografi-alam', 'zone-system', 'hitam-putih', 'lanskap'],
    hoursAgo: 96,
  },
  {
    username: 'kassian_cephas',
    category_slug: 'fotografi',
    title: 'Relief Kaki Tersembunyi Candi Borobudur (1890–1891)',
    description:
      'Dokumentasi fotografi bersejarah karya Kassian Cephas (1845–1912), fotografer pribumi pertama Indonesia. Dipotret pada 1890–1891 saat pembongkaran sementara kaki tersembunyi sisi timur Candi Borobudur yang memperlihatkan panel relief Karmawibhangga sebelum ditutup kembali demi menjaga kestabilan candi. Arsip KITLV / Leiden University Libraries (Public Domain).',
    image_path: 'artworks/cephas-borobudur.jpg',
    tags: ['borobudur', 'fotografi-dokumenter', 'sejarah-nusantara', 'arsip'],
    hoursAgo: 84,
  },
  {
    username: 'ernst_haeckel',
    category_slug: 'ilustrasi',
    title: 'Kunstformen der Natur — Plate 8: Discomedusae (1904)',
    description:
      'Ilustrasi litografi ilmiah karya Ernst Haeckel dari buku Kunstformen der Natur (1899–1904), menampilkan keindahan struktur simetri dan tentakel ubur-ubur Desmonema annasethe. Ketajaman detail botanis dan biologisnya menjadi sumber inspirasi besar bagi seniman dan arsitek Art Nouveau awal abad ke-20. Sumber: Wikimedia Commons (Public Domain).',
    image_path: 'artworks/haeckel-discomedusae.jpg',
    tags: ['ilustrasi-ilmiah', 'litografi', 'biologi-laut', 'detail-tinggi'],
    hoursAgo: 72,
  },
  {
    username: 'gustav_klimt',
    category_slug: 'lukisan',
    title: 'Der Kuss — The Kiss (1907–1908)',
    description:
      'Lukisan cat minyak dan lapisan daun emas di atas kanvas berbentuk bujur sangkar sempurna (180 × 180 cm) karya Gustav Klimt pada puncak "Fase Emas"-nya. Memadukan pola mosaik persegi tegas dan spiral organik yang terinspirasi seni Bizantium Ravenna. Koleksi Österreichische Galerie Belvedere, Wina (Public Domain).',
    image_path: 'artworks/klimt-the-kiss.jpg',
    tags: ['simbolisme', 'cat-minyak', 'daun-emas', 'vienna-secession'],
    hoursAgo: 60,
  },
  {
    username: 'claude_monet',
    category_slug: 'lukisan',
    title: 'Impression, Soleil Levant (1872)',
    description:
      'Lukisan cat minyak di atas kanvas (48 × 63 cm) karya Claude Monet tahun 1872 yang menggambarkan pelabuhan Le Havre pada pagi berkabut. Saat dipamerkan tahun 1874, judul lukisan ini melahirkan nama gerakan Impresionisme. Sorotan oranye matahari yang kontras terhadap biru dingin air memperlihatkan kekuatan sapuan kuas spontan. Koleksi Musée Marmottan Monet, Paris (Public Domain).',
    image_path: 'artworks/monet-impression-sunrise.jpg',
    tags: ['impresionisme', 'cat-minyak', 'cahaya-pagi', 'pelabuhan'],
    hoursAgo: 48,
  },
  {
    username: 'johannes_vermeer',
    category_slug: 'lukisan',
    title: 'Girl with a Pearl Earring (c. 1665)',
    description:
      'Lukisan cat minyak di atas kanvas (44,5 × 39 cm) karya Johannes Vermeer sekitar tahun 1665 di Delft, Belanda. Bukan potret formal melainkan "tronie" (studi karakter berpakaian eksotis) yang terkenal akan tata cahaya lembut pada wajah, sorban biru ultramarine, dan kilau tunggal pada anting mutiara. Koleksi Mauritshuis, Den Haag (Public Domain).',
    image_path: 'artworks/vermeer-pearl-earring.jpg',
    tags: ['zaman-keemasan-belanda', 'tronie', 'cat-minyak', 'potret'],
    hoursAgo: 36,
  },
  {
    username: 'raden_saleh',
    category_slug: 'lukisan',
    title: 'Boschbrand — Kebakaran Hutan (1849)',
    description:
      'Lukisan cat minyak monumental di atas kanvas (300 × 396 cm) karya Raden Saleh tahun 1849, salah satu mahakarya terbesar Romantisisme Asia Tenggara. Menggambarkan drama harimau, banteng, dan satwa liar Jawa yang terdesak ke tepi jurang oleh kobaran api hutan di malam hari dengan pencahayaan kontras yang dahsyat. Koleksi National Gallery Singapore (Public Domain).',
    image_path: 'artworks/raden-saleh-boschbrand.jpg',
    tags: ['romantisisme', 'sejarah-nusantara', 'cat-minyak', 'satwa'],
    hoursAgo: 24,
  },
  // 4 KARYA TERBARU YANG TAMPIL LANGSUNG DI BERANDA + HERO:
  {
    username: 'blender_studio',
    category_slug: '3d-art',
    title: 'Gold — Render 3D Blender 4.2 LTS (2024)',
    description:
      'Karya resmi splash screen "Gold" untuk rilis Blender 4.2 LTS oleh Blender Studio (2024). Menunjukkan kekuatan pipeline 3D sumber terbuka melalui komposisi sinematik, shader permukaan realistis, kedalaman atmosfer, dan pencahayaan volumetrik berpresisi tinggi. Sumber: Wikimedia Commons / Blender Studio (Lisensi CC BY 4.0).',
    image_path: 'artworks/blender-42-gold.jpg',
    tags: ['blender-cycles', 'render-3d', 'open-movie', 'sinematik'],
    hoursAgo: 12,
  },
  {
    username: 'katsushika_hokusai',
    category_slug: 'ilustrasi',
    title: 'The Great Wave off Kanagawa (c. 1831)',
    description:
      'Cetak balok kayu polikrom ukiyo-e (tinta dan warna di atas kertas, 25,7 × 37,9 cm) karya Katsushika Hokusai sekitar tahun 1830–1831, pembuka seri "Thirty-Six Views of Mount Fuji". Menggunakan pigmen biru Prusia yang mencolok untuk membingkai Gunung Fuji di kejauhan melalui lengkungan ombak raksasa yang mencengkeram tiga perahu nelayan. Koleksi The Metropolitan Museum of Art, New York (Public Domain).',
    image_path: 'artworks/hokusai-great-wave.jpg',
    tags: ['ukiyo-e', 'cetak-kayu', 'gunung-fuji', 'ilustrasi-klasik'],
    hoursAgo: 8,
  },
  {
    username: 'vincent_vangogh',
    category_slug: 'lukisan',
    title: 'The Starry Night — Malam Berbintang (1889)',
    description:
      'Lukisan cat minyak di atas kanvas (73,7 × 92,1 cm) karya Vincent van Gogh yang dilukis pada Juni 1889 dari jendela menghadap timur di Saint-Rémy-de-Provence, Prancis. Pusaran langit malam bercahaya, bintang berbinar, pohon cemara gelap di latar depan, serta sapuan impasto ritmis menjadikannya salah satu karya paling dikenal dalam sejarah seni rupa dunia. Koleksi Museum of Modern Art (MoMA), New York (Public Domain).',
    image_path: 'artworks/vangogh-starry-night.jpg',
    tags: ['pasca-impresionisme', 'impasto', 'cat-minyak', 'langit-malam'],
    hoursAgo: 4,
  },
  {
    username: 'raden_saleh',
    category_slug: 'lukisan',
    title: 'Penangkapan Pangeran Diponegoro (1857)',
    description:
      'Mahakarya sejarah beraliran Romantisisme (cat minyak di atas kanvas, 112 × 178 cm) karya Raden Saleh Sjarif Bustaman tahun 1857. Dilukis sebagai tanggapan kritis terhadap lukisan Nicolaas Pieneman (1835), Raden Saleh memotret peristiwa 28 Maret 1830 di Magelang dengan menempatkan Pangeran Diponegoro berdiri tegak penuh wibawa di sisi kanan berhadapan dengan Letjen De Kock. Koleksi Istana Kepresidenan Republik Indonesia (Public Domain).',
    image_path: 'artworks/raden-saleh-diponegoro.jpg',
    tags: ['romantisisme', 'sejarah-nusantara', 'cat-minyak', 'diponegoro'],
    hoursAgo: 1,
  },
];

async function cleanupLegacyDummyData(client, uploadRoot) {
  const legacyUsersRes = await client.query(
    `SELECT user_id FROM users WHERE username = ANY($1::text[])`,
    [LEGACY_DUMMY_USERNAMES]
  );
  const legacyUserIds = legacyUsersRes.rows.map((r) => r.user_id);

  // Hapus tantangan fiktif lama beserta winners & submissions
  const legacyChallengesRes = await client.query(
    `SELECT challenge_id FROM challenges
     WHERE title = ANY($1::text[]) OR curator_id = ANY($2::int[])`,
    [LEGACY_DUMMY_CHALLENGE_TITLES, legacyUserIds.length ? legacyUserIds : [-1]]
  );
  const legacyChallengeIds = legacyChallengesRes.rows.map((r) => r.challenge_id);

  if (legacyChallengeIds.length > 0) {
    await client.query(`DELETE FROM winners WHERE challenge_id = ANY($1::int[])`, [legacyChallengeIds]);
    await client.query(`DELETE FROM submissions WHERE challenge_id = ANY($1::int[])`, [legacyChallengeIds]);
    await client.query(`DELETE FROM challenges WHERE challenge_id = ANY($1::int[])`, [legacyChallengeIds]);
  }

  if (legacyUserIds.length > 0) {
    const legacyArtRes = await client.query(
      `SELECT artwork_id FROM artworks WHERE user_id = ANY($1::int[])`,
      [legacyUserIds]
    );
    const legacyArtIds = legacyArtRes.rows.map((r) => r.artwork_id);

    if (legacyArtIds.length > 0) {
      await client.query(
        `DELETE FROM winners WHERE submission_id IN (SELECT submission_id FROM submissions WHERE artwork_id = ANY($1::int[]))`,
        [legacyArtIds]
      );
      await client.query(`DELETE FROM submissions WHERE artwork_id = ANY($1::int[])`, [legacyArtIds]);
      await client.query(`DELETE FROM reports WHERE artwork_id = ANY($1::int[])`, [legacyArtIds]);
      await client.query(`DELETE FROM comments WHERE artwork_id = ANY($1::int[])`, [legacyArtIds]);
      await client.query(`DELETE FROM likes WHERE artwork_id = ANY($1::int[])`, [legacyArtIds]);
      await client.query(`DELETE FROM favorites WHERE artwork_id = ANY($1::int[])`, [legacyArtIds]);
      await client.query(`DELETE FROM artwork_tags WHERE artwork_id = ANY($1::int[])`, [legacyArtIds]);
      await client.query(`DELETE FROM artworks WHERE artwork_id = ANY($1::int[])`, [legacyArtIds]);
    }

    await client.query(`DELETE FROM comments WHERE user_id = ANY($1::int[])`, [legacyUserIds]);
    await client.query(`DELETE FROM reports WHERE reporter_id = ANY($1::int[])`, [legacyUserIds]);
    await client.query(`DELETE FROM users WHERE user_id = ANY($1::int[])`, [legacyUserIds]);
  }

  // Bersihkan file dummy prosedural lama dari disk
  for (const rel of LEGACY_DUMMY_FILES) {
    const full = path.resolve(uploadRoot, rel);
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
    }
  }
}

async function runDummySeed() {
  loadEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL belum diatur di environment atau .env.local');
  }

  const uploadRoot = getUploadRoot();
  for (const item of REAL_ARTWORKS) {
    const filePath = path.resolve(uploadRoot, item.image_path);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File gambar karya nyata tidak ditemukan: ${filePath}`);
    }
  }
  for (const u of REAL_USERS) {
    const filePath = path.resolve(uploadRoot, u.avatar_path);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File avatar tidak ditemukan: ${filePath}`);
    }
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Bersihkan data dummy fiktif versi lama
    await cleanupLegacyDummyData(client, uploadRoot);

    // 2. Pastikan seluruh kategori (aktif & nonaktif) tersedia
    const categoryBySlug = new Map();
    for (const cat of CATEGORIES) {
      const isActive = cat.is_active !== false;
      await client.query(
        `INSERT INTO categories (name, slug, description, is_active)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE
         SET description = EXCLUDED.description, is_active = EXCLUDED.is_active`,
        [cat.name, cat.slug, cat.description, isActive]
      );
      const res = await client.query(
        `SELECT category_id FROM categories WHERE slug = $1 LIMIT 1`,
        [cat.slug]
      );
      categoryBySlug.set(cat.slug, res.rows[0].category_id);
    }

    // Ambil user_id admin (untuk reviewed_by & handled_by)
    const adminRes = await client.query(
      `SELECT user_id FROM users WHERE role = 'admin' ORDER BY user_id ASC LIMIT 1`
    );
    const adminId = adminRes.rows[0]?.user_id || null;

    // 3. Seed akun seniman, studio terbuka, & kurator beserta profil & verifikasi
    const passwordHash = await bcrypt.hash('ArtivaDummy2026!', 10);
    const userByUsername = new Map();
    const nowMs = Date.now();

    for (const u of REAL_USERS) {
      const userStatus = u.status || 'active';
      await client.query(
        `INSERT INTO users (username, email, password_hash, role, status)
         VALUES ($1, $2, $3, $4::user_role, $5::user_status)
         ON CONFLICT (username) DO UPDATE
         SET role = EXCLUDED.role, status = EXCLUDED.status`,
        [u.username, u.email, passwordHash, u.role, userStatus]
      );
      const userRes = await client.query(
        `SELECT user_id FROM users WHERE username = $1 LIMIT 1`,
        [u.username]
      );
      const userId = userRes.rows[0].user_id;
      userByUsername.set(u.username, userId);

      await client.query(
        `INSERT INTO profiles (user_id, display_name, bio, avatar_path, website)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) DO UPDATE
         SET display_name = EXCLUDED.display_name,
             bio = EXCLUDED.bio,
             avatar_path = EXCLUDED.avatar_path,
             website = EXCLUDED.website`,
        [userId, u.display_name, u.bio, u.avatar_path, u.website]
      );

      if (u.role === 'curator' && u.verification) {
        const v = u.verification;
        const existingVerif = await client.query(
          `SELECT verification_id FROM curator_verifications WHERE user_id = $1 ORDER BY verification_id DESC LIMIT 1`,
          [userId]
        );
        const submittedAt = new Date(nowMs - (v.submittedHoursAgo || 24) * 3600 * 1000);
        const reviewedAt =
          v.reviewedHoursAgo != null ? new Date(nowMs - v.reviewedHoursAgo * 3600 * 1000) : null;
        const reviewer = v.status === 'pending' ? null : adminId;

        if (existingVerif.rowCount === 0) {
          await client.query(
            `INSERT INTO curator_verifications (user_id, reviewed_by, status, note, submitted_at, reviewed_at)
             VALUES ($1, $2, $3::verification_status, $4, $5, $6)`,
            [userId, reviewer, v.status, v.note, submittedAt, reviewedAt]
          );
        } else {
          await client.query(
            `UPDATE curator_verifications
             SET reviewed_by = $1, status = $2::verification_status, note = $3, submitted_at = $4, reviewed_at = $5
             WHERE verification_id = $6`,
            [reviewer, v.status, v.note, submittedAt, reviewedAt, existingVerif.rows[0].verification_id]
          );
        }
      }
    }

    // 4. Seed seluruh karya seni nyata (published, hidden, removed) + tags
    const artworkByTitle = new Map();

    for (const art of REAL_ARTWORKS) {
      const userId = userByUsername.get(art.username);
      const categoryId = categoryBySlug.get(art.category_slug);
      const artStatus = art.status || 'published';
      const createdAt = new Date(nowMs - art.hoursAgo * 3600 * 1000);

      const existingArt = await client.query(
        `SELECT artwork_id FROM artworks WHERE user_id = $1 AND title = $2 LIMIT 1`,
        [userId, art.title]
      );

      let artworkId = existingArt.rows[0]?.artwork_id;
      if (!artworkId) {
        const inserted = await client.query(
          `INSERT INTO artworks (user_id, category_id, title, description, image_path, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6::artwork_status, $7, $7)
           RETURNING artwork_id`,
          [userId, categoryId, art.title, art.description, art.image_path, artStatus, createdAt]
        );
        artworkId = inserted.rows[0].artwork_id;
      } else {
        await client.query(
          `UPDATE artworks
           SET category_id = $1, description = $2, image_path = $3, status = $4::artwork_status, created_at = $5, updated_at = $5
           WHERE artwork_id = $6`,
          [categoryId, art.description, art.image_path, artStatus, createdAt, artworkId]
        );
      }
      artworkByTitle.set(art.title, artworkId);

      for (const tagName of art.tags) {
        await client.query(
          `INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
          [tagName]
        );
        const tagRes = await client.query(
          `SELECT tag_id FROM tags WHERE name = $1 LIMIT 1`,
          [tagName]
        );
        await client.query(
          `INSERT INTO artwork_tags (artwork_id, tag_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [artworkId, tagRes.rows[0].tag_id]
        );
      }
    }

    // 5. Seed interaksi komunitas (likes, favorites, comments substantif)
    const u = (name) => userByUsername.get(name);
    const a = (title) => artworkByTitle.get(title);

    const likeEntries = [
      ['vincent_vangogh', 'Penangkapan Pangeran Diponegoro (1857)'],
      ['claude_monet', 'Penangkapan Pangeran Diponegoro (1857)'],
      ['kassian_cephas', 'Penangkapan Pangeran Diponegoro (1857)'],
      ['katsushika_hokusai', 'Penangkapan Pangeran Diponegoro (1857)'],
      ['kurator_galeri', 'Penangkapan Pangeran Diponegoro (1857)'],
      ['raden_saleh', 'The Starry Night — Malam Berbintang (1889)'],
      ['claude_monet', 'The Starry Night — Malam Berbintang (1889)'],
      ['gustav_klimt', 'The Starry Night — Malam Berbintang (1889)'],
      ['blender_studio', 'The Starry Night — Malam Berbintang (1889)'],
      ['vincent_vangogh', 'The Great Wave off Kanagawa (c. 1831)'],
      ['claude_monet', 'The Great Wave off Kanagawa (c. 1831)'],
      ['alphonse_mucha', 'The Great Wave off Kanagawa (c. 1831)'],
      ['raden_saleh', 'Gold — Render 3D Blender 4.2 LTS (2024)'],
      ['open_design_lab', 'Gold — Render 3D Blender 4.2 LTS (2024)'],
      ['ansel_adams', 'Relief Kaki Tersembunyi Candi Borobudur (1890–1891)'],
      ['dorothea_lange', 'Relief Kaki Tersembunyi Candi Borobudur (1890–1891)'],
      ['raden_saleh', 'Relief Kaki Tersembunyi Candi Borobudur (1890–1891)'],
      ['kassian_cephas', 'The Tetons and the Snake River (1942)'],
      ['johannes_vermeer', 'Impression, Soleil Levant (1872)'],
      ['vincent_vangogh', 'Girl with a Pearl Earring (c. 1665)'],
      ['toulouse_lautrec', 'Poster Litografi "JOB" Art Nouveau (1896)'],
      ['alphonse_mucha', 'Moulin Rouge: La Goulue (1891)'],
      ['ernst_haeckel', 'Der Kuss — The Kiss (1907–1908)'],
      ['raden_saleh', 'Mona Lisa — La Gioconda (c. 1503–1519)'],
      ['vincent_vangogh', 'Mona Lisa — La Gioconda (c. 1503–1519)'],
      ['rembrandt_vanrijn', 'Mona Lisa — La Gioconda (c. 1503–1519)'],
      ['leonardo_davinci', 'De Nachtwacht — The Night Watch (1642)'],
      ['johannes_vermeer', 'De Nachtwacht — The Night Watch (1642)'],
      ['edvard_munch', 'Sunflowers — Lima Belas Bunga Matahari (1888)'],
      ['claude_monet', 'Sunflowers — Lima Belas Bunga Matahari (1888)'],
      ['vincent_vangogh', 'Sudden Shower over Shin-Ōhashi Bridge and Atake (1857)'],
      ['katsushika_hokusai', 'Sudden Shower over Shin-Ōhashi Bridge and Atake (1857)'],
      ['ansel_adams', 'Earthrise — Misi Apollo 8 (24 Desember 1968)'],
      ['kassian_cephas', 'Earthrise — Misi Apollo 8 (24 Desember 1968)'],
      ['toulouse_lautrec', 'Tournée du Chat Noir (1896)'],
      ['alphonse_mucha', 'Tournée du Chat Noir (1896)'],
      ['auguste_rodin', 'David — Patung Marmer Carrara (1501–1504)'],
      ['sandro_botticelli', 'David — Patung Marmer Carrara (1501–1504)'],
      ['open_design_lab', 'Watercolor Café — Render 3D Blender 4.0 (2023)'],
      ['blender_studio', 'GNOME Files 47 — Sistem Antarmuka Libadwaita Modern'],
    ];

    for (const [uname, title] of likeEntries) {
      const uid = u(uname);
      const aid = a(title);
      if (uid && aid) {
        await client.query(
          `INSERT INTO likes (user_id, artwork_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [uid, aid]
        );
      }
    }

    const favEntries = [
      ['kurator_galeri', 'Penangkapan Pangeran Diponegoro (1857)'],
      ['raden_saleh', 'The Starry Night — Malam Berbintang (1889)'],
      ['vincent_vangogh', 'The Great Wave off Kanagawa (c. 1831)'],
      ['kassian_cephas', 'The Tetons and the Snake River (1942)'],
      ['blender_studio', 'Kunstformen der Natur — Plate 8: Discomedusae (1904)'],
    ];
    for (const [uname, title] of favEntries) {
      const uid = u(uname);
      const aid = a(title);
      if (uid && aid) {
        await client.query(
          `INSERT INTO favorites (user_id, artwork_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [uid, aid]
        );
      }
    }

    const commentsData = [
      {
        artwork: 'Penangkapan Pangeran Diponegoro (1857)',
        username: 'kurator_galeri',
        content:
          'Perhatikan komposisi cahaya pagi dan proporsi kepala tokoh yang sengaja dibuat simbolis oleh Raden Saleh—sebuah kritik visual yang sangat tajam terhadap versi kolonial Pieneman.',
      },
      {
        artwork: 'Penangkapan Pangeran Diponegoro (1857)',
        username: 'kassian_cephas',
        content:
          'Detail busana Jawa, keris, dan ekspresi para pengikut Diponegoro direkam dengan empati historis yang luar biasa.',
      },
      {
        artwork: 'The Starry Night — Malam Berbintang (1889)',
        username: 'claude_monet',
        content:
          'Ritme sapuan kuas melingkar di langit biru kobalt dan kuning oker menciptakan ilusi aliran udara yang begitu hidup.',
      },
      {
        artwork: 'The Great Wave off Kanagawa (c. 1831)',
        username: 'vincent_vangogh',
        content:
          'Garis ombak yang menyerupai cakar dan kontras biru Prusia terhadap Gunung Fuji kecil di kejauhan adalah pelajaran komposisi terbaik.',
      },
      {
        artwork: 'Relief Kaki Tersembunyi Candi Borobudur (1890–1891)',
        username: 'ansel_adams',
        content:
          'Nilai arkeologis dan ketajaman tekstur batu andesit pada cetakan kolodion abad ke-19 ini sangat mengagumkan.',
      },
      {
        artwork: 'Gold — Render 3D Blender 4.2 LTS (2024)',
        username: 'open_design_lab',
        content:
          'Pencahayaan volumetrik dan refleksi materialnya membuktikan ekosistem kreatif open-source mampu mencapai standar sinematik.',
      },
      {
        artwork: 'Mona Lisa — La Gioconda (c. 1503–1519)',
        username: 'rembrandt_vanrijn',
        content:
          'Transisi bayangan sfumato di sekitar sudut mata dan bibir adalah pencapaian teknik cat minyak yang belum tertandingi.',
      },
      {
        artwork: 'Sudden Shower over Shin-Ōhashi Bridge and Atake (1857)',
        username: 'vincent_vangogh',
        content:
          'Garis hujan diagonal yang tajam dan suasana mendung di jembatan ini sangat menginspirasi studi sapuan garis saya.',
      },
      {
        artwork: 'Earthrise — Misi Apollo 8 (24 Desember 1968)',
        username: 'dorothea_lange',
        content:
          'Satu bingkai foto yang mengubah cara seluruh umat manusia memandang Bumi sebagai rumah bersama.',
      },
      {
        artwork: 'Tournée du Chat Noir (1896)',
        username: 'alphonse_mucha',
        content:
          'Kesederhanaan siluet hitam dengan aksen merah-kuning membuat poster ini langsung terbaca bahkan dari seberang jalan Paris.',
      },
      {
        artwork: 'A Sunday on La Grande Jatte (1884–1886)',
        username: 'claude_monet',
        content:
          'Kedisiplinan ribuan titik warna murni pada kanvas sebesar ini menciptakan getaran cahaya siang yang luar biasa.',
      },
      {
        artwork: 'Wanderer above the Sea of Fog (c. 1818)',
        username: 'raden_saleh',
        content:
          'Komposisi Rückenfigur di puncak kabut sangat kuat menghadirkan rasa kontemplatif khas Romantisisme.',
      },
      // Komentar berstatus deleted (untuk kelengkapan variasi status moderasi komentar)
      {
        artwork: 'Penangkapan Pangeran Diponegoro (1857)',
        username: 'akun_spam_bot',
        content: 'Cek promo jasa edit foto murah di tautan profil kami!',
        status: 'deleted',
      },
      {
        artwork: 'The Starry Night — Malam Berbintang (1889)',
        username: 'vandalis_komentar',
        content: 'Komentar tidak pantas yang telah dihapus oleh moderasi.',
        status: 'deleted',
      },
      {
        artwork: 'Gold — Render 3D Blender 4.2 LTS (2024)',
        username: 'reuploader_ilegal',
        content: 'Beli aset bajakan murah lewat pesan pribadi.',
        status: 'deleted',
      },
    ];

    for (const c of commentsData) {
      const aid = a(c.artwork);
      const uid = u(c.username);
      const cStatus = c.status || 'visible';
      if (!aid || !uid) continue;
      const exists = await client.query(
        `SELECT comment_id FROM comments WHERE artwork_id = $1 AND user_id = $2 AND content = $3 LIMIT 1`,
        [aid, uid, c.content]
      );
      if (exists.rowCount === 0) {
        await client.query(
          `INSERT INTO comments (artwork_id, user_id, content, status)
           VALUES ($1, $2, $3, $4::comment_status)`,
          [aid, uid, c.content, cStatus]
        );
      } else {
        await client.query(
          `UPDATE comments SET status = $1::comment_status WHERE comment_id = $2`,
          [cStatus, exists.rows[0].comment_id]
        );
      }
    }

    // 6. Seed 2 tantangan terkurasi (1 open, 1 announced lengkap dengan pemenang)
    const curatorId = u('kurator_galeri');

    const openTitle = 'Dialog Cahaya, Ruang & Narasi Lintas Era';
    let openChallengeId;
    const existingOpen = await client.query(
      `SELECT challenge_id FROM challenges WHERE title = $1 LIMIT 1`,
      [openTitle]
    );
    if (existingOpen.rowCount > 0) {
      openChallengeId = existingOpen.rows[0].challenge_id;
    } else {
      const inserted = await client.query(
        `INSERT INTO challenges (curator_id, category_id, title, description, rules, start_date, end_date, status)
         VALUES ($1, NULL, $2, $3, $4, $5, $6, 'open')
         RETURNING challenge_id`,
        [
          curatorId,
          openTitle,
          'Tantangan kurasi lintas disiplin yang mempertemukan seni lukis klasik, fotografi dokumenter, poster grafis, ilustrasi ukiyo-e, hingga render 3D modern dalam eksplorasi cahaya dan narasi visual.',
          '1. Karya dipublikasikan di portofolio ARTIVA dengan atribusi dan deskripsi teknik yang jelas.\n2. Terbuka untuk seluruh kategori kreatif.\n3. Penilaian mencakup kekuatan komposisi, pengolahan cahaya, dan kedalaman narasi.',
          formatDateOffset(-4),
          formatDateOffset(21),
        ]
      );
      openChallengeId = inserted.rows[0].challenge_id;
    }

    const openSubmissionTitles = [
      'Penangkapan Pangeran Diponegoro (1857)',
      'The Starry Night — Malam Berbintang (1889)',
      'The Great Wave off Kanagawa (c. 1831)',
      'The Tetons and the Snake River (1942)',
      'Poster Litografi "JOB" Art Nouveau (1896)',
      'Gold — Render 3D Blender 4.2 LTS (2024)',
      'Mona Lisa — La Gioconda (c. 1503–1519)',
      'Earthrise — Misi Apollo 8 (24 Desember 1968)',
      'Tournée du Chat Noir (1896)',
    ];
    for (const t of openSubmissionTitles) {
      const aid = a(t);
      if (aid) {
        await client.query(
          `INSERT INTO submissions (challenge_id, artwork_id, status)
           VALUES ($1, $2, 'submitted')
           ON CONFLICT (challenge_id, artwork_id) DO NOTHING`,
          [openChallengeId, aid]
        );
      }
    }

    // Tantangan terbuka ke-2: fokus Ilustrasi & Seni Grafis
    const openGraphicTitle = 'Eksplorasi Garis, Cetak & Komposisi Visual';
    let openGraphicId;
    const existingGraphic = await client.query(
      `SELECT challenge_id FROM challenges WHERE title = $1 LIMIT 1`,
      [openGraphicTitle]
    );
    if (existingGraphic.rowCount > 0) {
      openGraphicId = existingGraphic.rows[0].challenge_id;
    } else {
      const inserted = await client.query(
        `INSERT INTO challenges (curator_id, category_id, title, description, rules, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
         RETURNING challenge_id`,
        [
          curatorId,
          categoryBySlug.get('ilustrasi'),
          openGraphicTitle,
          'Wadah kurasi bagi karya ilustrasi cetak kayu, litografi botanis, dan narasi grafis yang menonjolkan kekuatan garis serta ritme bidang.',
          '1. Terbuka bagi karya kategori Ilustrasi.\n2. Sertakan konteks teknik cetak atau proses kreatif pada deskripsi.',
          formatDateOffset(-2),
          formatDateOffset(28),
        ]
      );
      openGraphicId = inserted.rows[0].challenge_id;
    }

    for (const t of [
      'Gaifū Kaisei — Red Fuji (c. 1830–1832)',
      'Sudden Shower over Shin-Ōhashi Bridge and Atake (1857)',
      'Kunstformen der Natur — Plate 99: Trochilidae (1904)',
    ]) {
      const aid = a(t);
      if (aid) {
        await client.query(
          `INSERT INTO submissions (challenge_id, artwork_id, status)
           VALUES ($1, $2, 'submitted')
           ON CONFLICT (challenge_id, artwork_id) DO NOTHING`,
          [openGraphicId, aid]
        );
      }
    }

    const announcedTitle = 'Kurasi Mahakarya Warna, Cahaya & Emosi';
    let announcedChallengeId;
    const existingAnnounced = await client.query(
      `SELECT challenge_id FROM challenges WHERE title = $1 LIMIT 1`,
      [announcedTitle]
    );
    if (existingAnnounced.rowCount > 0) {
      announcedChallengeId = existingAnnounced.rows[0].challenge_id;
    } else {
      const inserted = await client.query(
        `INSERT INTO challenges (curator_id, category_id, title, description, rules, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'announced')
         RETURNING challenge_id`,
        [
          curatorId,
          categoryBySlug.get('lukisan'),
          announcedTitle,
          'Program apresiasi khusus karya seni rupa yang menonjolkan drama pencahayaan, harmoni pigmen warna, dan daya gugah emosional lintas abad.',
          '1. Khusus kategori Lukisan.\n2. Dewan Kurasi memilih 3 karya terbaik berdasarkan pencapaian artistik dan signifikansi visual.',
          formatDateOffset(-35),
          formatDateOffset(-5),
        ]
      );
      announcedChallengeId = inserted.rows[0].challenge_id;
    }

    const announcedSubmissionTitles = [
      'Boschbrand — Kebakaran Hutan (1849)',
      'Girl with a Pearl Earring (c. 1665)',
      'Impression, Soleil Levant (1872)',
      'Der Kuss — The Kiss (1907–1908)',
    ];
    const winnerSubmissionIds = [];
    for (let i = 0; i < announcedSubmissionTitles.length; i++) {
      const aid = a(announcedSubmissionTitles[i]);
      if (!aid) continue;
      await client.query(
        `INSERT INTO submissions (challenge_id, artwork_id, status)
         VALUES ($1, $2, 'submitted')
         ON CONFLICT (challenge_id, artwork_id) DO NOTHING`,
        [announcedChallengeId, aid]
      );
      const subRes = await client.query(
        `SELECT submission_id FROM submissions WHERE challenge_id = $1 AND artwork_id = $2 LIMIT 1`,
        [announcedChallengeId, aid]
      );
      if (i < 3 && subRes.rows[0]?.submission_id) {
        winnerSubmissionIds.push(subRes.rows[0].submission_id);
      }
    }

    for (let i = 0; i < winnerSubmissionIds.length; i++) {
      await client.query(
        `INSERT INTO winners (challenge_id, submission_id, rank)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [announcedChallengeId, winnerSubmissionIds[i], i + 1]
      );
    }

    // Helper idempoten untuk tantangan tambahan (mencakup draft, open, closed, announced + withdrawn submissions)
    async function ensureChallenge({
      curatorUsername,
      categorySlug,
      title,
      description,
      rules,
      startOffset,
      endOffset,
      status,
      submissions = [],
      withdrawn = [],
      winners = [],
    }) {
      const cidCurator = u(curatorUsername);
      const catId = categorySlug ? categoryBySlug.get(categorySlug) : null;
      let chId;
      const existing = await client.query(
        `SELECT challenge_id FROM challenges WHERE title = $1 LIMIT 1`,
        [title]
      );
      if (existing.rowCount > 0) {
        chId = existing.rows[0].challenge_id;
      } else {
        const ins = await client.query(
          `INSERT INTO challenges (curator_id, category_id, title, description, rules, start_date, end_date, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::challenge_status)
           RETURNING challenge_id`,
          [
            cidCurator,
            catId,
            title,
            description,
            rules,
            formatDateOffset(startOffset),
            formatDateOffset(endOffset),
            status,
          ]
        );
        chId = ins.rows[0].challenge_id;
      }

      const subByTitle = new Map();
      for (const artTitle of submissions) {
        const aid = a(artTitle);
        if (!aid) continue;
        await client.query(
          `INSERT INTO submissions (challenge_id, artwork_id, status)
           VALUES ($1, $2, 'submitted')
           ON CONFLICT (challenge_id, artwork_id) DO NOTHING`,
          [chId, aid]
        );
        const sRes = await client.query(
          `SELECT submission_id FROM submissions WHERE challenge_id = $1 AND artwork_id = $2 LIMIT 1`,
          [chId, aid]
        );
        if (sRes.rows[0]) subByTitle.set(artTitle, sRes.rows[0].submission_id);
      }

      for (const artTitle of withdrawn) {
        const aid = a(artTitle);
        if (!aid) continue;
        await client.query(
          `INSERT INTO submissions (challenge_id, artwork_id, status, withdrawn_at)
           VALUES ($1, $2, 'withdrawn', now() - interval '1 day')
           ON CONFLICT (challenge_id, artwork_id) DO UPDATE
           SET status = 'withdrawn', withdrawn_at = COALESCE(submissions.withdrawn_at, now() - interval '1 day')`,
          [chId, aid]
        );
      }

      for (let i = 0; i < winners.length; i++) {
        const sid = subByTitle.get(winners[i]);
        if (!sid) continue;
        await client.query(
          `INSERT INTO winners (challenge_id, submission_id, rank)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [chId, sid, i + 1]
        );
      }
    }

    // Tantangan Open ke-3 (Kurator Fotografi) + 1 withdrawn submission
    await ensureChallenge({
      curatorUsername: 'kurator_fotografi',
      categorySlug: 'fotografi',
      title: 'Lensa Sejarah & Bentang Alam Abadi',
      description:
        'Kurasi fotografi dokumenter, lanskap hitam-putih, dan arsip visual yang merekam jejak peradaban serta keagungan alam lintas dekade.',
      rules:
        '1. Khusus kategori Fotografi.\n2. Cantumkan tahun pengambilan foto dan konteks arsip.\n3. Peserta dapat menarik pengajuan sebelum tenggat ditutup.',
      startOffset: -5,
      endOffset: 18,
      status: 'open',
      submissions: [
        'Relief Kaki Tersembunyi Candi Borobudur (1890–1891)',
        'The Tetons and the Snake River (1942)',
        'Earthrise — Misi Apollo 8 (24 Desember 1968)',
        'The Steerage (1907)',
      ],
      withdrawn: ['Evening, McDonald Lake, Glacier National Park (1942)'],
    });

    // Tantangan Closed ke-1 (siap ditetapkan pemenangnya oleh Kurator Seni Rupa)
    await ensureChallenge({
      curatorUsername: 'kurator_seni_rupa',
      categorySlug: 'lukisan',
      title: 'Simfoni Romantisisme & Cahaya Barok',
      description:
        'Tantangan yang telah menyelesaikan masa penerimaan karya dan saat ini memasuki tahap penjurian untuk memilih 3 pemenang utama.',
      rules:
        '1. Khusus kategori Lukisan.\n2. Dewan kurator memilih 3 pemenang berdasarkan dramatisasi cahaya dan kekuatan komposisi.',
      startOffset: -25,
      endOffset: -2,
      status: 'closed',
      submissions: [
        'De Nachtwacht — The Night Watch (1642)',
        'Las Meninas (1656)',
        'Wanderer above the Sea of Fog (c. 1818)',
        'Berburu Rusa — The Deer Hunt (1846)',
        'A Sunday on La Grande Jatte (1884–1886)',
      ],
      withdrawn: ['La Chasse au Lion — Perburuan Singa (1841)'],
    });

    // Tantangan Closed ke-2 (Kurator Digital & 3D)
    await ensureChallenge({
      curatorUsername: 'kurator_digital',
      categorySlug: '3d-art',
      title: 'Estetika Dunia 3D & Pencahayaan Terbuka',
      description:
        'Kompetisi render 3D sumber terbuka yang sedang dalam proses penilaian akhir oleh kurator sebelum pengumuman pemenang.',
      rules: '1. Khusus kategori 3D Art.\n2. Menilai teknik pencahayaan, shader material, dan narasi visual.',
      startOffset: -20,
      endOffset: -1,
      status: 'closed',
      submissions: [
        'Gold — Render 3D Blender 4.2 LTS (2024)',
        'Interior Arsitektur 3D — Splash Render Blender 4.1 (2024)',
        'Watercolor Café — Render 3D Blender 4.0 (2023)',
        'Sprite Fright — Render 3D Blender 3.0 (2021)',
      ],
      withdrawn: ['Spring — Adegan Film Pendek Terbuka Blender 2.80 (2019)'],
    });

    // Tantangan Draft ke-1 (Kurator Digital)
    await ensureChallenge({
      curatorUsername: 'kurator_digital',
      categorySlug: 'ui-ux',
      title: 'Rancangan Sistem Desain Aksesibel 2027',
      description:
        'Draf tantangan mendatang yang mengajak desainer UI/UX mengeksplorasi antarmuka inklusif dengan kontras tinggi dan alur kerja bersih.',
      rules: '1. Khusus kategori UI/UX.\n2. Sertakan penjelasan struktur komponen dan aksesibilitas.',
      startOffset: 5,
      endOffset: 35,
      status: 'draft',
    });

    // Tantangan Draft ke-2 (Kurator Seni Rupa)
    await ensureChallenge({
      curatorUsername: 'kurator_seni_rupa',
      categorySlug: 'desain-grafis',
      title: 'Pameran Poster Tipografi & Identitas Visual',
      description:
        'Draf kurasi poster bergaya Art Nouveau, Belle Époque, hingga tipografi editorial kontemporer.',
      rules: '1. Khusus kategori Desain Grafis.\n2. Format potret atau lanskap beresolusi tinggi.',
      startOffset: 7,
      endOffset: 40,
      status: 'draft',
    });

    // Tantangan Announced ke-2 (Kurator Fotografi — lengkap pemenang peringkat 1-3)
    await ensureChallenge({
      curatorUsername: 'kurator_fotografi',
      categorySlug: 'fotografi',
      title: 'Apresiasi Fotografi Dokumenter & Humanisme',
      description:
        'Program apresiasi yang menyoroti kekuatan fotografi dokumenter dalam mengabadikan martabat manusia dan memori sejarah.',
      rules: '1. Khusus kategori Fotografi.\n2. Kurator menetapkan 3 karya pemenang terbaik.',
      startOffset: -45,
      endOffset: -12,
      status: 'announced',
      submissions: [
        'Relief Kaki Tersembunyi Candi Borobudur (1890–1891)',
        'Migrant Mother, Nipomo, California (1936)',
        'The Steerage (1907)',
        'Relief Karmawibhangga Borobudur — Panel Arsip KITLV (1890–1891)',
      ],
      winners: [
        'Relief Kaki Tersembunyi Candi Borobudur (1890–1891)',
        'Migrant Mother, Nipomo, California (1936)',
        'The Steerage (1907)',
      ],
    });

    // 7. Seed Laporan Moderasi Karya (pending, resolved, dismissed) mencakup seluruh alasan laporan
    const reportsData = [
      // 4 Laporan PENDING (muncul di antrean aktif Admin)
      {
        reporter: 'vandalis_komentar',
        artwork: 'La Chasse au Lion — Perburuan Singa (1841)',
        reason: 'plagiarism',
        description: 'Klaim dugaan unggahan ulang tanpa mencantumkan museum asal secara terpisah.',
        status: 'pending',
        resolution_note: null,
        hoursAgo: 14,
      },
      {
        reporter: 'reuploader_ilegal',
        artwork: 'Gold — Render 3D Blender 4.2 LTS (2024)',
        reason: 'copyright',
        description: 'Mohon tinjau kembali status izin penggunaan ulang aset resmi Blender Studio.',
        status: 'pending',
        resolution_note: null,
        hoursAgo: 10,
      },
      {
        reporter: 'akun_spam_bot',
        artwork: 'GNOME Shell 42.2 — Tata Letak Ruang Kerja Aktivitas',
        reason: 'spam',
        description: 'Tangkapan layar antarmuka sistem operasi diduga konten promosi perangkat lunak.',
        status: 'pending',
        resolution_note: null,
        hoursAgo: 6,
      },
      {
        reporter: 'vandalis_komentar',
        artwork: 'Skrik — The Scream (1893)',
        reason: 'inappropriate',
        description: 'Ekspresi figur dalam lukisan dianggap terlalu mencekam bagi sebagian penonton.',
        status: 'pending',
        resolution_note: null,
        hoursAgo: 3,
      },
      // 4 Laporan RESOLVED (ditangani Admin, karya telah hidden/removed)
      {
        reporter: 'raden_saleh',
        artwork: 'Promo Jasa Desain Murah Kilat 50 Ribu!!! (Dihapus)',
        reason: 'spam',
        description: 'Unggahan berisi iklan promosi komersial berulang yang bukan karya portofolio.',
        status: 'resolved',
        resolution_note: 'Karya dihapus permanen dan akun pengunggah ditangguhkan karena pelanggaran spam berulang.',
        hoursAgo: 120,
      },
      {
        reporter: 'ansel_adams',
        artwork: 'Reupload Lanskap Pegunungan Tanpa Izin (Dihapus)',
        reason: 'plagiarism',
        description: 'Foto lanskap diunggah ulang dengan klaim sebagai karya pribadi tanpa sumber arsip.',
        status: 'resolved',
        resolution_note: 'Terbukti plagiarisme/klaim palsu. Karya dihapus dan akun pengunggah ditangguhkan.',
        hoursAgo: 100,
      },
      {
        reporter: 'alphonse_mucha',
        artwork: 'Unggahan Poster Promosi Ilegal & Menyesatkan (Dihapus)',
        reason: 'inappropriate',
        description: 'Poster disalahgunakan untuk tautan menyesatkan dan melanggar aturan komunitas.',
        status: 'resolved',
        resolution_note: 'Karya dihapus sesuai pedoman moderasi konten tidak pantas.',
        hoursAgo: 90,
      },
      {
        reporter: 'blender_studio',
        artwork: 'Uji Render Pencahayaan Kafe Tanpa Atribusi (Disembunyikan)',
        reason: 'copyright',
        description: 'Karya render CC BY diunggah ulang tanpa mencantumkan atribusi pencipta asli (Gaku Tada).',
        status: 'resolved',
        resolution_note: 'Karya disembunyikan dari publik sampai pelanggaran atribusi diselesaikan.',
        hoursAgo: 80,
      },
      // 2 Laporan DISMISSED (ditolak/diabaikan Admin setelah verifikasi)
      {
        reporter: 'akun_spam_bot',
        artwork: 'Penangkapan Pangeran Diponegoro (1857)',
        reason: 'other',
        description: 'Laporan tidak berdasar terhadap arsip lukisan sejarah.',
        status: 'dismissed',
        resolution_note: 'Karya merupakan arsip lukisan bersejarah Public Domain dengan atribusi akurat. Laporan diabaikan.',
        hoursAgo: 70,
      },
      {
        reporter: 'reuploader_ilegal',
        artwork: 'Earthrise — Misi Apollo 8 (24 Desember 1968)',
        reason: 'copyright',
        description: 'Mempertanyakan hak pakai foto luar angkasa NASA.',
        status: 'dismissed',
        resolution_note: 'Foto resmi arsip NASA berstatus Public Domain secara hukum AS. Tidak ditemukan pelanggaran.',
        hoursAgo: 60,
      },
    ];

    for (const rep of reportsData) {
      const reporterId = u(rep.reporter);
      const artworkId = a(rep.artwork);
      if (!reporterId || !artworkId) continue;
      const handledBy = rep.status === 'pending' ? null : adminId;
      const createdAt = new Date(nowMs - rep.hoursAgo * 3600 * 1000);

      await client.query(
        `INSERT INTO reports (reporter_id, artwork_id, handled_by, reason, description, status, resolution_note, created_at)
         VALUES ($1, $2, $3, $4, $5, $6::report_status, $7, $8)
         ON CONFLICT (reporter_id, artwork_id) DO UPDATE
         SET handled_by = EXCLUDED.handled_by,
             reason = EXCLUDED.reason,
             description = EXCLUDED.description,
             status = EXCLUDED.status,
             resolution_note = EXCLUDED.resolution_note`,
        [reporterId, artworkId, handledBy, rep.reason, rep.description, rep.status, rep.resolution_note, createdAt]
      );
    }

    await client.query('COMMIT');
    console.log('Seed data dummy nyata ARTIVA (variasi status lengkap) berhasil diterapkan!');
    console.log(`- Kategori: ${CATEGORIES.length} (${CATEGORIES.filter((c) => c.is_active !== false).length} aktif, ${CATEGORIES.filter((c) => c.is_active === false).length} nonaktif)`);
    console.log(`- Akun kreator & kurator: ${REAL_USERS.length} (password: ArtivaDummy2026!)`);
    console.log(`- Karya seni: ${REAL_ARTWORKS.length} (${REAL_ARTWORKS.filter((x) => (x.status || 'published') === 'published').length} published, ${REAL_ARTWORKS.filter((x) => x.status === 'hidden').length} hidden, ${REAL_ARTWORKS.filter((x) => x.status === 'removed').length} removed)`);
    console.log(`- Laporan moderasi: ${reportsData.length} (4 pending, 4 resolved, 2 dismissed)`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runDummySeed().catch((err) => {
  console.error('Gagal menjalankan seed data nyata:', err);
  process.exit(1);
});
