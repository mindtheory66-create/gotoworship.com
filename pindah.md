# Panduan Pindah Next.js 16 + Supabase dari VPS ke cPanel A2 Hosting

Panduan generic untuk memindahkan project **Next.js 16** dengan **App Router**, **Server Actions**, **ISR**, dan database **Supabase** dari VPS (dengan PM2 worker) ke shared hosting **cPanel A2 Hosting** yang memiliki fitur **Setup Node.js App / Phusion Passenger**.

> Ganti semua placeholder seperti `<domain.com>`, `<username>`, `<project-folder>`, dan nilai Supabase sesuai project masing-masing.

---

## 1. Prasyarat Hosting

Pastikan cPanel menyediakan:

- **Setup Node.js App** (biasanya di menu Software)
- Node.js versi **18.17+**, lebih disarankan **20.x** atau **22.x**
- Akses **Terminal** atau **SSH**
- Addon Domain (jika domain yang dipakai bukan domain utama cPanel)

> Next.js 16 membutuhkan Node.js **>= 20.9.0**.

---

## 2. Persiapan Project Sebelum Upload

Project Next.js harus disiapkan supaya bisa berjalan di lingkungan cPanel/Passenger.

### 2.1 Buat `server.js` di root project

File ini menjadi entry point yang dijalankan Passenger.

```js
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const { createServer } = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  const port = parseInt(process.env.PORT, 10) || 3000;

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
```

### 2.2 Ubah script `start` di `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "node server.js"
  }
}
```

### 2.3 Tambahkan konfigurasi worker di `next.config.js`

cPanel shared hosting membatasi jumlah proses. Batasi Next.js agar tidak spawn banyak worker saat build.

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    workerThreads: false,
    cpus: 1,
  },
};

module.exports = nextConfig;
```

### 2.4 Tambahkan `.npmrc`

Jika ada konflik peer dependency, misalnya antara `eslint` dan `eslint-config-next`, buat file `.npmrc`:

```ini
legacy-peer-deps=true
```

---

## 3. Upload Project ke cPanel

Upload seluruh project ke folder aplikasi, contoh:

```
/home/<username>/<project-folder>/
```

File/folder yang wajib ada:

```
.next/
public/
scripts/
src/
server.js
next.config.js
package.json
package-lock.json
.env.local
```

Yang **tidak perlu** di-upload:

- `node_modules/` → akan di-install ulang di server
- `.git/`
- File log, cache, hasil build sementara

---

## 4. Buat File `.env.local`

Buat di root project di server:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SITE_URL=https://<domain.com>
DEEPSEEK_API_KEY=
```

> Jangan commit file `.env.local` ke repository. Pastikan sudah masuk `.gitignore`.

---

## 5. Install Dependencies

Masuk ke Terminal cPanel dan jalankan:

```bash
cd /home/<username>/<project-folder>
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
npm install --legacy-peer-deps
```

> Sesuaikan path Node 22 kalau di hosting kamu berbeda. Cek dengan `find /opt -name node -type f 2>/dev/null | grep nodejs22`.

---

## 6. Build Project

### Build normal

```bash
cd /home/<username>/<project-folder>
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
rm -rf .next
npm run build
```

### Build fallback jika error memori / EAGAIN

Jika muncul error `spawn ... EAGAIN`, pakai Webpack dengan batasan memori:

```bash
cd /home/<username>/<project-folder>
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
rm -rf .next
NODE_OPTIONS='--max-old-space-size=4096' npm run build -- --webpack
```

---

## 7. Setup Node.js App di cPanel

Buka **cPanel → Software → Setup Node.js App → Create Application**.

Isi form:

| Field | Nilai |
|---|---|
| Node.js version | `22.x` atau `20.x` |
| Application mode | `Production` |
| Application root | `/home/<username>/<project-folder>` |
| Application URL | `<domain.com>` |
| Application startup file | `server.js` |

Tambahkan Environment Variables yang sama dengan isi `.env.local`, minimal:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Klik **Create**, lalu **Restart**.

---

## 8. Buat File `.htaccess` untuk Passenger

Masuk ke document root domain, biasanya:

```
/home/<username>/public_html/<domain.com>/
```

Buat file `.htaccess` dengan isi:

```apache
PassengerAppRoot /home/<username>/<project-folder>
PassengerBaseURI /
PassengerAppType node
PassengerStartupFile server.js
PassengerAppEnv production
PassengerNodejs /opt/alt/alt-nodejs22/root/usr/bin/node
```

Sesuaikan path `PassengerNodejs` dengan lokasi binary Node di server.

Setelah itu, **Restart** aplikasi di cPanel Setup Node.js App.

---

## 9. Setting DNS

Arahkan A record domain ke IP shared hosting:

```
<domain.com>    A    <ip-cpanel>
www             A    <ip-cpanel>
```

Jika pakai Cloudflare:

- Edit A record ke IP cPanel
- Saat testing, ubah Proxy Status menjadi **DNS only** sementara

Tunggu propagasi DNS, bisa beberapa menit sampai 24 jam.

---

## 10. Background Worker

Di VPS, worker biasanya dijalankan dengan PM2. Di cPanel shared hosting, gunakan **Cron Job** sebagai gantinya.

Buka **cPanel → Advanced → Cron Jobs**, tambahkan job:

```bash
cd /home/<username>/<project-folder> && /opt/alt/alt-nodejs22/root/usr/bin/node scripts/<worker-file>.js
```

Atur frekuensi, misalnya setiap 5 menit:

```
*/5 * * * *
```

Sesuaikan `<worker-file>.js` dengan nama file worker project masing-masing.

---

## 11. Troubleshooting Umum

### 403 Forbidden

- Pastikan file `.htaccess` Passenger sudah ada di document root domain
- Pastikan aplikasi Node.js sudah Running di cPanel
- Pastikan domain sudah pointing ke IP cPanel

### `spawn EAGAIN`

Terjadi karena batas proses CloudLinux. Pastikan `next.config.js` sudah ada:

```js
experimental: {
  workerThreads: false,
  cpus: 1,
}
```

Dan build dengan:

```bash
NODE_OPTIONS='--max-old-space-size=4096' npm run build -- --webpack
```

### `ERESOLVE unable to resolve dependency tree`

Pastikan `.npmrc` sudah ada:

```ini
legacy-peer-deps=true
```

Atau install dengan:

```bash
npm install --legacy-peer-deps
```

### `Node.js version >=20.9.0 is required`

Terminal masih memakai Node bawaan sistem. Pastikan menggunakan path Node 22:

```bash
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
npm run build
```

---

## 12. Catatan Penting

- **Resource shared hosting terbatas**: Entry Processes dan Number of Processes rendah. Website bisa jalan untuk traffic kecil, tapi rawan error saat traffic tinggi.
- **Inode usage**: Pantau penggunaan file. `node_modules` dan `.next` bisa menghabiskan banyak inode.
- **Build lebih lambat**: Karena dibatasi 1 worker, build banyak halaman statis bisa memakan waktu beberapa menit.
- **Native modules**: Jika build dilakukan di lokal lalu `.next` di-upload, library native seperti `sharp` bisa bermasalah. Disarankan build langsung di server.

---

## Ringkasan Perintah Build

```bash
cd /home/<username>/<project-folder>
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
rm -rf .next
npm install --legacy-peer-deps
NODE_OPTIONS='--max-old-space-size=4096' npm run build -- --webpack
```

Setelah build selesai, restart aplikasi di cPanel Setup Node.js App.
