# 10 - Software Architecture
## Sistem "Tabia Ops" — KPI & Manajemen Kerja

---

## 1. Prinsip Utama

- **Dua project/codebase Next.js terpisah**, masing-masing di-deploy sendiri:
  - Website utama → `rumahtahfidztabia.com`
  - Tabia Ops → subdomain, mis. `ops.rumahtahfidztabia.com`
- **Satu database Postgres yang sama**, di-hosting di Supabase (Supabase dipakai
  sebagai hosting Postgres, bukan Supabase Auth) — kedua project connect lewat
  `DATABASE_URL` masing-masing ke database yang sama
- **Tabel baru untuk Tabia Ops ditambahkan langsung di database yang sama** (skema
  `public` yang sama dipakai website utama), bukan schema Postgres terpisah
- **Akun admin sama** — Tabia Ops tidak punya tabel user sendiri; ia membaca &
  memvalidasi ke tabel `AdminUser` milik website utama

## 2. Diagram Deployment

```
[Browser Admin]
     |
     +----> rumahtahfidztabia.com  ---> [ Next.js App: Web Utama ]  ---+
     |                                                                  |
     +----> ops.rumahtahfidztabia.com ---> [ Next.js App: Tabia Ops ] -+
                                                                        |
                                                                        v
                                                          [ PostgreSQL (Supabase) ]
                                                           - tabel lama (AdminUser, dst)
                                                           - tabel baru (Task, Kpi, dst)
```

Kedua aplikasi berjalan sebagai proses terpisah (masing-masing PM2 process/port
sendiri), di-reverse-proxy oleh Nginx yang sama, dibedakan lewat `server_name`
(subdomain).

## 3. Komponen Utama

| Komponen | Teknologi | Fungsi |
|---|---|---|
| Reverse proxy | Nginx | SSL termination, routing berdasarkan subdomain ke masing-masing app |
| Process manager | PM2 | Menjaga kedua aplikasi Next.js tetap berjalan (2 process terpisah) |
| Aplikasi | Next.js (App Router) + TypeScript | Task board, kalender, KPI, wiki, tabel custom |
| ORM | Prisma (project/schema terpisah dari web utama) | Query builder & migrasi tabel baru |
| Database | PostgreSQL (Supabase, sama dengan web utama) | Penyimpanan data bersama |
| Auth | NextAuth.js/Lucia (instance terpisah, validasi ke tabel `AdminUser` yang sama) | Autentikasi admin, shared session lintas subdomain |

## 4. Strategi Auth: Shared Session, Auth Terpisah per App

Pendekatan yang dipakai — **NextAuth/Lucia tetap berjalan di masing-masing app**,
tidak dipindah ke Supabase Auth. Yang membuat "akun admin tetap sama" terasa mulus:

1. Kedua app membaca & memvalidasi credential dari tabel `AdminUser` yang sama
   (query langsung via Prisma masing-masing app ke database yang sama)
2. Session cookie di-set dengan `domain: ".rumahtahfidztabia.com"` (bukan
   `ops.rumahtahfidztabia.com` saja) — supaya cookie yang sama terbaca oleh kedua
   subdomain
3. **Rekomendasi:** pindahkan session strategy ke **JWT session** (bukan database
   session) di kedua app, dengan `NEXTAUTH_SECRET` yang **sama** di kedua `.env` —
   supaya token yang di-sign oleh satu app bisa diverifikasi oleh app lain tanpa
   perlu shared session store tambahan
4. Efeknya: login di salah satu subdomain (web utama atau Tabia Ops) akan membuat
   user otomatis "sudah login" di subdomain satunya, selama cookie domain & secret
   sama

> **Catatan penting:** perubahan yang dibutuhkan di **web utama** hanyalah dua hal —
> (a) set `cookie.domain` ke domain induk, (b) pastikan `NEXTAUTH_SECRET` konsisten
> dan dibagikan sebagai env var ke Tabia Ops. Tidak perlu migrasi auth besar-besaran.

## 5. Strategi Migrasi Database (Prisma di Project Terpisah)

Karena dua Prisma project akan menunjuk ke satu database yang sama, ada risiko
migration saling tabrakan. Aturan yang dipakai:

- Tabel milik website utama (`AdminUser`, `Donation`, `Campaign`, dst) **tidak pernah
  dimigrasikan dari project Tabia Ops** — Tabia Ops hanya melakukan `prisma db pull`
  (introspeksi) untuk memetakan tabel `AdminUser` sebagai model *read-mostly* di
  schema-nya sendiri (`@@map("AdminUser")`), tanpa menjalankan `prisma migrate` di
  atasnya
- Tabel baru milik Tabia Ops (`Task`, `KpiTarget`, dst) **hanya dimigrasikan dari
  project Tabia Ops** — website utama tidak perlu tahu-menahu soal tabel ini
- Enum `AdminRole` (`SUPERADMIN`, `EDITOR`, `KEUANGAN`) sudah ada sebagai tipe enum
  Postgres dari migrasi web utama — schema Prisma Tabia Ops cukup mendeklarasikan
  enum yang sama (nama & value harus identik persis) supaya Prisma memetakannya ke
  tipe enum yang sudah ada, bukan membuat enum baru

## 6. Keamanan

- Session/JWT sama dengan mekanisme web utama, di-share lewat cookie domain induk
- Semua ID entitas Tabia Ops menggunakan UUID v4
- Validasi input di setiap API route (`zod`)
- Rate limiting pada endpoint yang berpotensi disalahgunakan (jika ada endpoint
  publik/semi-publik di fase lanjutan)
- Environment variable untuk seluruh secret — tidak pernah hardcode di source code,
  `NEXTAUTH_SECRET` wajib identik dengan web utama

## 7. Skalabilitas (Pertimbangan Masa Depan)

- Notifikasi Telegram untuk task/KPI dapat ditambahkan mengikuti pola yang sudah
  ada di web utama (`telegram.ts`), tanpa perubahan struktur data
- KPI otomatis dari data donasi (agregasi `Donation`/`Campaign`) dapat ditambahkan
  di fase lanjutan tanpa mengubah struktur `KpiMetric`/`KpiEntry` yang sudah ada —
  cukup menambah job terjadwal yang menulis `KpiEntry` otomatis
- Jika kebutuhan tabel custom berkembang jauh melampaui pola EAV sederhana, dapat
  dipertimbangkan migrasi ke pendekatan dynamic table generation di fase lanjutan
