# Panduan Pindah GoToWorship dari VPS ke cPanel A2 Hosting

Panduan ini merangkum langkah-langkah memindahkan project Next.js 16 + Supabase dari VPS ke shared hosting cPanel (A2 Hosting) dengan Node.js Selector / Phusion Passenger.

---

## 1. Persyaratan Hosting

Pastikan cPanel memiliki fitur berikut:

- **Setup Node.js App** (terlihat di menu Software)
- Versi Node.js **18.17+** atau lebih baik **20.x / 22.x**
- Akses **Terminal** atau **SSH**
- Addon Domain (kalau domain utama bukan yang akan dipakai)

> Catatan: Next.js 16 butuh Node.js **>= 20.9.0**.

---

## 2. File Project yang Harus Ada di Repo

Project sudah disiapkan supaya kompatibel dengan cPanel:

- `server.js` — startup file untuk Passenger
- `next.config.js` — sudah ditambahkan `workerThreads: false` dan `cpus: 1`
- `.npmrc` — `legacy-peer-deps=true`
- `package.json` — script `start` menjalankan `node server.js`

Kalau file-file ini belum ada, pastikan repo sudah di-pull dari GitHub:

```bash
https://github.com/mindtheory66-create/gotoworship.com.git
```

---

## 3. Upload Project ke cPanel

Upload seluruh file project ke folder aplikasi, misalnya:

```
/home/cekganah/gotoworship.com/
```

File dan folder yang wajib ada:

```
.next/
public/
scripts/
src/
supabase/
.env.local
next.config.js
package.json
package-lock.json
server.js
```

Yang **tidak perlu** di-upload:

- `node_modules/` → akan di-install di server
- `.git/` → tidak dibutuhkan untuk production
- `deploy*.tar.gz`, log file, `.playwright-cli/`

---

## 4. Setup Environment Variables

Buat file `.env.local` di root project dengan isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vjtpnprrcabgouvfvogp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_anon_key_disini
SUPABASE_SERVICE_ROLE_KEY=isi_service_role_key_disini
NEXT_PUBLIC_SITE_URL=https://gotoworship.com
DEEPSEEK_API_KEY=
```

Ganti `gotoworship.com` dengan domain yang sebenarnya digunakan.

---

## 5. Install Dependencies

Masuk ke Terminal cPanel, lalu jalankan:

```bash
cd /home/cekganah/gotoworship.com
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` diperlukan karena ada konflik peer dependency antara `eslint` dan `eslint-config-next`.

---

## 6. Build Project

### Build normal

```bash
cd /home/cekganah/gotoworship.com
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
rm -rf .next
npm run build
```

### Build jika terjadi error memori / EAGAIN

cPanel shared hosting membatasi jumlah proses. Kalau muncul error `spawn EAGAIN`, gunakan build Webpack dengan 1 worker:

```bash
cd /home/cekganah/gotoworship.com
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
rm -rf .next
NODE_OPTIONS='--max-old-space-size=4096' npm run build -- --webpack
```

> Konfigurasi `workerThreads: false` dan `cpus: 1` di `next.config.js` sudah membatasi concurrency agar tidak kena batas proses CloudLinux.

---

## 7. Konfigurasi Node.js App di cPanel

Buka **cPanel → Software → Setup Node.js App → Create Application**.

Isi form dengan:

| Field | Nilai |
|---|---|
| Node.js version | `22.22.3` (atau versi 20+ yang tersedia) |
| Application mode | `Production` |
| Application root | `gotoworship.com` atau `/home/cekganah/gotoworship.com` |
| Application URL | `gotoworship.com` |
| Application startup file | `server.js` |

Tambahkan Environment Variables yang sama dengan `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `DEEPSEEK_API_KEY` (bisa dikosongkan)

Klik **Create**, lalu **Restart**.

---

## 8. Buat File `.htaccess` untuk Passenger

Buka File Manager, masuk ke document root domain (biasanya):

```
/home/cekganah/public_html/gotoworship.com/
```

Buat file baru bernama `.htaccess` dengan isi:

```apache
PassengerAppRoot /home/cekganah/gotoworship.com
PassengerBaseURI /
PassengerAppType node
PassengerStartupFile server.js
PassengerAppEnv production
PassengerNodejs /opt/alt/alt-nodejs22/root/usr/bin/node
```

Kalau document root berbeda, sesuaikan path-nya.

Setelah itu, klik **Restart** aplikasi di Setup Node.js App.

---

## 9. Setting DNS

Arahkan A record domain ke IP cPanel:

```
gotoworship.com A 103.227.176.13
www             A 103.227.176.13
```

Kalau pakai Cloudflare:

- Edit A record ke IP cPanel
- Saat testing, matikan sementara Proxy Status (orange cloud) menjadi **DNS only**

Tunggu propagasi DNS beberapa menit sampai 24 jam.

---

## 10. Background Worker (Cron Job)

Di VPS, worker berjalan dengan PM2. Di cPanel shared hosting tidak bisa pakai PM2. Ganti dengan **Cron Job**.

Buka **cPanel → Advanced → Cron Jobs**, tambahkan job:

```bash
cd /home/cekganah/gotoworship.com && /opt/alt/alt-nodejs22/root/usr/bin/node scripts/run-queue-worker.js
```

Atur frekuensi, misalnya setiap 5 menit:

```
*/5 * * * *
```

---

## 11. Troubleshooting

### 403 Forbidden

- Pastikan file `.htaccess` Passenger sudah ada di document root domain.
- Pastikan aplikasi Node.js sudah di-start dan statusnya Running.
- Pastikan domain sudah pointing ke IP cPanel.

### `spawn EAGAIN`

Terjadi karena batas proses CloudLinux. Pastikan `next.config.js` sudah ada:

```js
experimental: {
  workerThreads: false,
  cpus: 1,
}
```

Dan build pakai Webpack:

```bash
NODE_OPTIONS='--max-old-space-size=4096' npm run build -- --webpack
```

### `ERESOLVE unable to resolve dependency tree`

Pastikan `.npmrc` ada di root project dengan isi:

```ini
legacy-peer-deps=true
```

Atau install pakai:

```bash
npm install --legacy-peer-deps
```

### `Node.js version >=20.9.0 is required`

Terminal masih pakai Node 16 default. Gunakan path Node 22:

```bash
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
npm run build
```

---

## 12. Catatan Penting

- **cPanel shared hosting punya batasan resource**: Entry Processes dan Number of Processes rendah. Website bisa jalan untuk traffic kecil, tapi rawan error kalau traffic tinggi.
- **Inode usage**: Pantau penggunaan file/inode. `node_modules` dan `.next` bisa memakan banyak inode.
- **Build lebih lambat**: Karena dibatasi 1 worker, build 1738 halaman statis bisa memakan waktu beberapa menit.
- **Native modules**: Kalau build dilakukan di lokal lalu upload `.next`, library native seperti `sharp` bisa bermasalah. Disarankan build langsung di server.

---

## Ringkasan Perintah Build

```bash
cd /home/cekganah/gotoworship.com
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
rm -rf .next
npm install --legacy-peer-deps
NODE_OPTIONS='--max-old-space-size=4096' npm run build -- --webpack
```

Setelah build selesai, restart aplikasi di cPanel Setup Node.js App.
