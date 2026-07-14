# Dokumen Persyaratan Produk (PRD)
## Direktori Tempat Ibadah Amerika Serikat – Platform Berbasis AI

---

## 1. Ringkasan Eksekutif

Produk ini adalah sebuah platform direktori tempat ibadah di Amerika Serikat (masjid, gereja, sinagoge, kuil, dll.) yang menggabungkan data terstruktur, konten kaya hasil generasi AI (DeepSeek), manajemen acara berbasis kontributor, serta CMS blog dan halaman kustom. Sistem dirancang untuk memberikan pengalaman pencarian yang superior bagi pengguna yang mencari tempat ibadah terdekat, informasi akses transportasi, jadwal, dan acara komunitas. Bagi admin, platform menyediakan kendali penuh, termasuk kemampuan mengimpor ribuan data dari CSV dan memanfaatkan AI untuk menghasilkan konten panjang anti *thin content*, otomatisasi moderasi acara, serta pengelolaan konten editorial. Teknologi inti: Next.js, Supabase (PostgreSQL + Storage + Auth), dan DeepSeek API.

---

## 2. Visi & Tujuan Produk

**Visi:** Menjadi direktori tempat ibadah paling lengkap, mudah diakses, dan informatif bagi penduduk, imigran, dan wisatawan di Amerika Serikat, yang tidak hanya mencantumkan alamat tetapi juga kaya informasi kontekstual, akses transportasi, dan aktivitas komunitas.

**Tujuan:**
- Menyediakan data ribuan tempat ibadah dengan konten minimal 1.500 kata per halaman.
- Memudahkan pencarian berdasarkan lokasi, agama, bahasa, dan fasilitas.
- Menyediakan alur kontributor yang aman untuk memperbarui acara tanpa mengganggu integritas data inti.
- Memberikan admin alat yang efisien untuk mengelola direktori, konten blog, dan halaman.
- Mencapai performa SEO tinggi dengan konten orisinil, terstruktur, dan dinamis.

---

## 3. Persona Pengguna

| Persona | Deskripsi | Kebutuhan Utama |
|---------|-----------|-----------------|
| **Pencari Tempat Ibadah** | Individu atau keluarga yang baru pindah, pendatang, atau wisatawan yang ingin menemukan tempat ibadah sesuai keyakinan, bahasa, atau lokasi. | Cari tempat ibadah terdekat, lihat jadwal, akses rute transportasi, baca ulasan. |
| **Kontributor (Pengurus)** | Pengurus tempat ibadah atau anggota komunitas terverifikasi yang ingin mengumumkan acara. | Submit acara, pastikan informasi terkini, tanpa bisa mengubah data pokok. |
| **User (Umum)** | Pengunjung biasa yang ingin menyimpan referensi tempat. | Bookmark, tidak ada akses kontribusi data. |
| **Admin** | Operator utama platform, bertanggung jawab atas data, konten, dan moderasi. | Import massal, kelola konten AI, moderasi acara, tulis blog, atur halaman CMS. |

---

## 4. User Flow (Alur Pengguna)

### 4.1 Pencari Tempat Ibadah (Guest / User)

1. **Entry point:**
   - *Google Search* → landing pada halaman `/near-me`, halaman kota/agama, atau halaman detail tempat.
   - *Direct / bookmark* → homepage atau halaman yang disimpan.

2. **Pencarian & Filter:**
   - Di halaman `/near-me`: browser minta izin lokasi → deteksi koordinat → tampilkan daftar + peta tempat terdekat (radius default 10 km).
   - Di halaman lokasi: daftar tempat sesuai kota/kategori, bisa filter agama, bahasa, fasilitas, jarak.
   - Pencarian teks: memasukkan nama tempat, alamat, atau kode pos.

3. **Evaluasi:**
   - Klik tempat dari daftar → masuk halaman detail.
   - Halaman detail berisi: informasi dasar, konten panjang (1500+ kata) termasuk akses transportasi, fasilitas, tips, jadwal tetap, upcoming events, past events, peta interaktif, galeri foto.
   - Pengguna dapat membaca, melihat peta, dan mendapatkan rute (klik "Dapatkan Rute" → terbuka di Google Maps/Apple Maps).

4. **Aksi lanjutan:**
   - Telepon langsung (click-to-call di mobile).
   - Kunjungi website resmi tempat ibadah.
   - Bagikan halaman via media sosial/pesan.
   - **User login**: bisa bookmark tempat (simpan ke daftar favorit pribadi).
   - Tulis ulasan (jika fitur diaktifkan di masa depan).

### 4.2 Kontributor (Login)

1. **Registrasi / Login:**
   - Pilih peran "Contributor" saat daftar.
   - Isi nama, email, password, nama organisasi, jabatan, alasan menjadi kontributor.
   - Admin/AI verifikasi; jika diterima, akun aktif.

2. **Dashboard Kontributor (terbatas):**
   - **Tambah Acara Baru:** pilih tempat ibadah (auto-complete dari database yang sudah diklaim atau diizinkan), isi judul acara, tanggal, waktu, deskripsi, kategori.
   - **Riwayat Acara:** lihat acara yang pernah diajukan beserta status (pending/approved/rejected).
   - **Edit Profil:** ubah informasi kontak (tidak bisa ubah peran).

3. **Proses Submit Acara:**
   - Setelah submit, status "pending" → AI Agent melakukan moderasi otomatis (cek spam, konten negatif) → jika lolos, otomatis approved dan acara tampil di halaman tempat ibadah (Upcoming Events) → jika tidak lolos, status "rejected" atau "needs_review", admin dapat intervensi.
   - Setelah tanggal acara lewat, sistem otomatis memindahkan ke "Past Events".

### 4.3 Admin (Full Access)

1. **Login ke Admin Dashboard** (`/admin`).
2. **Manajemen Direktori:**
   - Lihat semua tempat, filter, cari, edit manual, hapus.
   - **Import CSV:** upload file, lihat antrean AI, review konten hasil AI, publish massal.
   - **Review Konten AI:** daftar halaman dengan status `draft`/`ai_generated`, bisa sunting langsung atau approve.
3. **Manajemen Acara:**
   - Lihat semua acara, filter status.
   - **Moderasi:** approve/reject manual acara yang ditunda AI.
4. **Manajemen Pengguna:**
   - Daftar user dan kontributor, setujui pendaftaran kontributor, nonaktifkan akun.
5. **CMS Blog:**
   - Buat, edit, hapus artikel blog.
   - Kategori, tag, jadwal publish.
   - Editor teks kaya, bisa gunakan AI Assistant (DeepSeek) untuk generate draft artikel.
6. **CMS Halaman:**
   - Kelola halaman statis (Tentang, Kebijakan Privasi, FAQ, dll).
7. **Pengaturan:**
   - Konfigurasi prompt AI, API keys, threshold moderasi, radius pencarian stasiun.

---

## 5. Fitur & Fungsionalitas (Functional Requirements)

### 5.1 Direktori & Pencarian

- **Halaman `/near-me`:** Dinamis, deteksi lokasi pengguna (JavaScript Geolocation API + fallback IP geolocation). Tampilkan daftar + peta (Mapbox/Google Maps). Konten fallback untuk bot: daftar kota besar.
- **Halaman kota/kategori:** URL struktur `/[state]/[city]/[religion]` atau `/[city]/[religion]`. Tampilkan daftar dengan pagination, sorting (rating, jarak), filter sidebar.
- **Pencarian teks:** Autocomplete dengan Algolia/Debounce internal. Hasil langsung menuju detail atau halaman pencarian.
- **Peta interaktif** di halaman hasil dan detail.

### 5.2 Halaman Detail Tempat Ibadah

Blok Konten (minimal 1500 kata):
1. **Header:** Nama, alamat, agama, rating (jika ada), foto utama.
2. **Tentang [Nama]:** Sejarah, suasana, arsitektur (AI-generated).
3. **Akses & Transportasi:** Stasiun/terminal terdekat, rute berjalan kaki/mengemudi, bus, parkir.
4. **Jadwal Ibadah Tetap:** Tabel waktu salat/Misa/kebaktian reguler.
5. **Bahasa & Komunitas:** Bahasa pengantar, etnis dominan.
6. **Fasilitas:** Daftar dengan ikon (wudu, AC, akses kursi roda, penitipan anak).
7. **Tips Pengunjung:** Saran untuk pertama kali datang (AI-generated).
8. **Upcoming Events:** Daftar acara mendatang yang sudah disetujui.
9. **Past Events:** Riwayat acara (otomatis).
10. **Galeri Foto:** Grid gambar, lightbox.
11. **Peta detail** + tombol "Dapatkan Rute".
12. **Tombol Telepon, Website, Share.**
13. **Schema.org:** `Place`, `Organization`, `Event` (untuk acara) terintegrasi.

### 5.3 Modul Acara (Events)

- **Form Submit oleh Kontributor:** Judul, deskripsi, tanggal mulai/selesai, waktu, kategori, tempat terkait.
- **Moderasi AI Otomatis:** Analisis konten, deteksi spam/unsur negatif → auto-approve/reject. Parameter konfigurasi dari admin.
- **Penjadwalan Tampil:** Upcoming events diurutkan tanggal; setelah lewat pindah ke Past Events secara otomatis (cron job / serverless function harian).
- **Notifikasi (opsional):** Email ke admin jika ada acara baru yang perlu review manual.

### 5.4 Manajemen Pengguna & Kontributor

- **Registrasi dengan pilihan peran:** User / Contributor.
- **Verifikasi Contributor:** Admin dapat menyetujui/menolak. Bisa juga AI cek email domain (prioritaskan domain organisasi).
- **Login:** Supabase Auth (email/password, bisa tambah OAuth nanti).
- **Profil User:** Bookmark tempat (simpan relasi user_id – place_id).
- **Profil Contributor:** Dapat melihat dan mengelola acara yang diajukan, tapi tidak bisa mengedit halaman tempat ibadah atau konten lainnya.

### 5.5 Dashboard Admin & CMS

- **Manajemen Tempat:** CRUD manual, import CSV, status kontrol (draft, ai_generated, published).
- **AI Content Review:** Tampilkan halaman yang dihasilkan AI, preview, sunting, publish masal.
- **Moderasi Acara:** List acara pending, approve/reject manual.
- **Manajemen Kategori Agama & Fasilitas:** CRUD taxonomy.
- **Blog:** Post CRUD, kategori, tag, media library (unggah gambar).
- **Halaman:** CRUD halaman statis.
- **Pengaturan:** AI prompts, API keys, radius, dll.

### 5.6 Import CSV & AI Content Generation

**Format CSV Minimal:**
```
name, address, city, state, zip, latitude, longitude, religion, denomination, phone, website, email, language, facilities, image_url1, image_url2, schedule_notes
```
**Proses:**
1. Admin unggah CSV.
2. Sistem validasi kolom, parsing.
3. Setiap baris dibuat menjadi record di tabel `places` dengan status `draft`, data mentah disimpan.
4. **Queue Worker** mengambil satu per satu:
   - Untuk setiap tempat, panggil API geospasial (Google Maps/Mapbox) untuk mendapatkan stasiun terdekat & jarak berjalan kaki/mengemudi. (Simpan hasil sebagai data tambahan, tidak harus di tabel terpisah, bisa di JSON field atau kolom tertentu.)
   - Jika ada `image_url`, unduh gambar, kompres, upload ke Supabase Storage, simpan URL di tabel `place_images`.
   - Susun prompt untuk DeepSeek dengan data tersebut, minta hasil konten 1500+ kata.
   - Simpan konten di kolom `content_long` (atau `ai_content`) dan ubah status menjadi `ai_generated`.
   - Admin melakukan review (bisa otomatis langsung publish jika yakin, setelan admin).

**Queue Implementation:** Bisa menggunakan Supabase Edge Functions dengan pg-boss, atau serverless queue seperti Inngest/QStash yang terintegrasi dengan Next.js.

### 5.7 Pengolahan Gambar (Auto-compress & Store)

- **Download:** Menggunakan `fetch` atau `axios` dengan timeout.
- **Kompresi:** Library `sharp` (Node.js) – resize max width 1200px, format JPEG (jika bukan transparan) atau WebP, kualitas 80%.
- **Upload ke Supabase Storage:** Bucket `place-images`. Nama file: `{place_id}/{uuid}.jpg`. Dapatkan public URL.
- **Database:** Simpan di tabel `place_images` (place_id, url, alt_text, is_primary).
- **Error handling:** Jika gambar gagal diunduh (404), lewati dan catat log.

### 5.8 AI Agent untuk Acara (DeepSeek)

- Trigger: Setelah kontributor submit acara → webhook ke Next.js API route → panggil DeepSeek API untuk moderasi teks.
- Prompt moderasi: “Klasifikasikan apakah teks acara berikut mengandung spam, ujaran kebencian, atau tidak pantas untuk ditampilkan di direktori tempat ibadah. Jawab dengan JSON {approved: true/false, reason: '...'}. Teks: [deskripsi]”.
- Jika `approved: true`, ubah status event jadi `approved` dan tampilkan.
- Jika `false`, status `rejected`, beri alasan, notifikasi ke kontributor (opsional).
- Admin dapat mengubah keputusan di dashboard.

---

## 6. Non-Functional Requirements

- **Performa:** Halaman harus dimuat dalam <2 detik (LCP). Gunakan SSG/ISR untuk halaman statis kota dan detail (karena data tidak sering berubah), CSR untuk halaman `/near-me`.
- **Keamanan:**
  - Row Level Security (RLS) di Supabase: user hanya bisa baca/menulis data miliknya. Admin punya akses penuh via service role di server-side.
  - Validasi input ketat.
  - Rate limiting di API routes (terutama kontributor submit).
- **SEO:**
  - Struktur URL ramah: `/[state]/[city]/[slug]`.
  - Meta tag dinamis, Open Graph, Twitter Cards.
  - Sitemap otomatis (SSR/ISR).
  - Schema.org lengkap.
- **Aksesibilitas:** Memenuhi WCAG 2.1 AA (kontras, alt text, navigasi keyboard).
- **Skalabilitas:** Supabase dapat menangani jutaan baris; Next.js di Vercel dapat auto-scale.

---

## 7. Arsitektur Teknis

### 7.1 Teknologi Utama
- **Frontend:** Next.js 14+ (App Router), React 18, Tailwind CSS, Mapbox GL JS (atau Google Maps).
- **Backend/API:** Next.js API Routes/Route Handlers, Server Actions.
- **Database:** Supabase (PostgreSQL).
- **Storage:** Supabase Storage (gambar, file statis).
- **Authentication:** Supabase Auth (email/password, OAuth opsional).
- **Queue/Job Processing:** Inngest, QStash, atau custom dengan Supabase Edge Functions + pg-boss. (Pilih salah satu yang paling ringan).
- **AI API:** DeepSeek API (via fetch dari server-side).
- **Image Processing:** Sharp (library) di API route saat upload/import.
- **Hosting:** Vercel (frontend+serverless) + Supabase (database terkelola). Bisa juga self-host Next.js.

### 7.2 Environment Variables
```
DEEPSEEK_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MAPBOX_ACCESS_TOKEN=
```

### 7.3 Struktur Proyek Next.js (usulan)
```
/app
  /(frontend)
    /[state]/[city]/[slug]       # halaman detail tempat
    /near-me                     # halaman dinamis lokasi
    /locations                   # indeks kota
    /blog/[slug]                 # artikel
    /page                        # homepage
  /admin
    /dashboard
    /places
    /import
    /events
    /users
    /blog
    /pages
    /settings
  /api
    /import/process-csv          # endpoint upload CSV
    /ai/generate-content         # trigger AI per place (bisa internal queue)
    /events/moderate             # webhook moderasi acara
    /auth/...                    # Supabase auth callback
  /components
  /lib
  ...
```

---

## 8. Desain Database (Supabase PostgreSQL)

### Tabel `places`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | uuid (PK) | |
| name | text | |
| slug | text unique | auto-generated dari name+city |
| address | text | |
| city | text | |
| state | text | |
| zip | text | |
| latitude | float8 | |
| longitude | float8 | |
| religion | text | (Islam, Kristen, Yahudi, Hindu, dll) |
| denomination | text | opsional |
| phone | text | |
| website | text | |
| email | text | |
| language | text[] | bahasa pengantar, array |
| facilities | text[] | |
| schedule_notes | jsonb | jadwal tetap (struktur bebas) |
| transport_info | jsonb | hasil perhitungan stasiun, jarak, rute (tersimpan dari enrichment) |
| content_long | text | konten AI 1500+ kata |
| status | text | 'draft', 'ai_generated', 'published' |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Tabel `place_images`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | uuid | |
| place_id | uuid (FK) | |
| url | text | public URL dari Supabase Storage |
| alt_text | text | |
| is_primary | boolean | |
| created_at | timestamptz | |

### Tabel `events`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | uuid | |
| place_id | uuid | |
| user_id | uuid (FK ke auth.users) | kontributor |
| title | text | |
| description | text | |
| start_datetime | timestamptz | |
| end_datetime | timestamptz | |
| category | text | |
| status | text | 'pending', 'approved', 'rejected' |
| ai_reason | text | alasan moderasi |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Tabel `user_bookmarks`
| Kolom | Tipe |
|-------|------|
| user_id | uuid |
| place_id | uuid |

### Tabel `blog_posts`
| Kolom | Tipe |
|-------|------|
| id | uuid |
| title | text |
| slug | text unique |
| content | text |
| excerpt | text |
| featured_image | text |
| category_id | uuid FK |
| status | 'draft','published' |
| published_at | timestamptz |

### Tabel `pages`
| Kolom | Tipe |
|-------|------|
| id | uuid |
| title | text |
| slug | text unique |
| content | text |
| status | 'published','draft' |
| updated_at | timestamptz |

### Tabel lain: `categories` (blog), `tags`, `post_tags`.

**Supabase Auth** menyediakan tabel `auth.users`, kita bisa menambahkan tabel `public.profiles` dengan relasi, berisi role ('user','contributor','admin'), nama organisasi, dll.

---

## 9. Alur Import CSV & AI Processing (Detail Teknis)

1. Admin akses halaman `/admin/import`.
2. Upload file CSV → API route `/api/import/process-csv` terima file.
3. Server membaca CSV menggunakan library `papaparse` atau `csv-parse`.
4. Untuk setiap baris:
   - Validasi kolom wajib (name, latitude, longitude, dll).
   - Insert ke tabel `places` dengan data dasar, status `draft`, dapatkan `place_id`.
   - Kirim job ke queue (Inngest: `events.place.imported`), payload `{placeId}`.
5. Worker (Inngest function atau API route yang dipanggil queue) melakukan:
   - Ambil data place dari DB.
   - Panggil Mapbox Directions API atau Google Distance Matrix API dengan koordinat untuk mencari stasiun/terminal terdekat. Parameter: `type=transit_station`, radius 2000m, mode walking/driving. Dapatkan nama stasiun, jarak, durasi.
   - Jika ada `image_url` di CSV (mungkin beberapa kolom), lakukan loop:
     - Unduh gambar (stream).
     - Pipa ke Sharp: resize, kompres.
     - Upload ke Supabase Storage dengan client SDK Supabase (service role) ke bucket `place-images`, path `{placeId}/{randomUUID}.webp`.
     - Insert ke `place_images`.
   - Buat prompt untuk DeepSeek (seperti contoh sebelumnya), termasuk data transport yang baru didapat.
   - Panggil DeepSeek Chat Completion API (model `deepseek-chat`), dapatkan konten.
   - Update `places` set `content_long = hasil`, `transport_info = jsonb`, `status = 'ai_generated'`.
   - Tangani error: jika gagal, status tetap `draft`, log error, admin bisa trigger ulang.

6. Admin di dashboard dapat melihat daftar `ai_generated`, review, lalu publish masal atau individual (ubah status ke `published`). Bisa juga set auto-publish.

---

## 10. Pengelolaan Gambar dan Auto-compress

**Implementasi:**
- Gunakan `fetch` untuk mendownload gambar, periksa Content-Type.
- Stream langsung ke Sharp.
- Output WebP (atau JPEG jika preferensi), dengan opsi `{ width: 1200, withoutEnlargement: true }`, kualitas 80.
- Simpan buffer hasil ke Supabase Storage: `supabase.storage.from('place-images').upload(path, buffer, { contentType: 'image/webp' })`.
- Dapatkan URL publik dengan `getPublicUrl`.
- Catatan: Pastikan bucket `place-images` bersifat public (untuk baca), tetapi upload hanya via server side (service role key).

---

## 11. SEO & Performance

- **Static Generation (ISR):** Halaman detail tempat menggunakan `generateStaticParams` + `revalidate` (misal setiap 24 jam) karena konten tidak sering berubah. Untuk `/near-me` dinamis sepenuhnya (CSR). Halaman kota juga ISR.
- **Struktur URL:** `/[state]/[city]/[slug]` dengan slug unik, misal `al-hidayah-mosque-chicago`.
- **Meta tags:** Judul unik: "[Nama] - [Kota], [State] | Direktori Ibadah". Deskripsi diambil dari excerpt konten.
- **Schema.org:** Di halaman detail, masukkan JSON-LD: `Place`, dengan `address`, `geo`, `aggregateRating` (jika ada), dan `event` untuk upcoming events.
- **Sitemap:** Endpoint `/sitemap.xml` yang menghasilkan daftar semua halaman detail, kota, blog.
- **Canonical URL:** Selalu merujuk ke halaman tanpa parameter.

---

## 12. Monetisasi (Opsional, Disiapkan)

- Siapkan kolom `featured_until` di `places` untuk listing premium.
- Siapkan metadata untuk Google AdSense.
- Siapkan slot iklan di halaman detail dan blog.

---

## 13. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| AI halusinasi fakta | Enrichment data nyata (stasiun, jarak) sebelum prompt, review admin. |
| Biaya AI membengkak | Cache konten, regenerate hanya jika data berubah. Queue agar tidak serentak. DeepSeek sangat murah. |
| Gambar dari sumber eksternal mati | Simpan salinan di storage sendiri saat import. |
| Spam acara | AI moderasi + admin override. Rate limiting submit. |
| Pelanggaran hukum scraping | Gunakan sumber legal (OpenStreetMap, API publik resmi). Cantumkan syarat dan kebijakan. |

---

## 14. Rencana Pengembangan (Milestone)

1. **MVP (2-3 bulan):**
   - Setup Next.js + Supabase.
   - Modul import CSV dengan AI content generator (tanpa queue dulu, proses sync untuk batch kecil).
   - Halaman detail statis, `/near-me` dinamis.
   - Modul kontributor (submit acara, moderasi manual admin).
   - Dashboard admin dasar.
2. **Fase 2 (1-2 bulan):**
   - Queue system untuk import massal.
   - CMS Blog & Halaman.
   - Auto-compress gambar.
   - SEO optimization (sitemap, schema).
3. **Fase 3:**
   - Ulasan pengguna, notifikasi, dll.

---

## Penutup

PRD ini dirancang sebagai cetak biru yang komprehensif untuk memastikan tim pengembang (manusia atau AI) dapat membangun platform dengan pemahaman yang jelas tentang alur, fitur, dan arsitektur. Dengan fondasi Next.js dan Supabase, serta integrasi DeepSeek yang cerdas, direktori ini akan menjadi produk yang sangat kompetitif dan bermanfaat.

---
