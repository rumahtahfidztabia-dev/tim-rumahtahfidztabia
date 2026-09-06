# 14 - Engineering Guidelines
## Sistem "Tabia Ops" — KPI & Manajemen Kerja

---

## 1. Tech Stack Tetap

| Layer | Teknologi |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| ORM | Prisma (project/schema terpisah dari web utama) |
| Database | PostgreSQL (Supabase, database sama dengan web utama) |
| Auth | NextAuth.js/Lucia (instance terpisah, validasi ke tabel `AdminUser` yang sama, `NEXTAUTH_SECRET` identik dengan web utama) |
| Validasi | Zod |
| Process manager | PM2 (process terpisah dari web utama) |
| Reverse proxy | Nginx (routing berdasarkan subdomain) |
| Rich text editor | `TipTap` (wiki) — konsisten dengan web utama |
| Alert/konfirmasi | `sweetalert2` + `sweetalert2-react-content` — konsisten dengan web utama |
| Toast notification | `sonner` |
| Form management | `react-hook-form` + `@hookform/resolvers` |
| Data fetching | `@tanstack/react-query` |
| Chart dashboard | `recharts` — konsisten dengan dashboard web utama |
| Icon set | `lucide-react` |
| Utility className | `clsx`, `tailwind-merge` |
| Sanitasi HTML | `isomorphic-dompurify` (wajib untuk output TipTap di wiki) |
| Date handling | `dayjs` |
| Drag-and-drop kanban | `@dnd-kit/core` (atau library setara) |

> Stack dipilih konsisten dengan web utama (lihat `07-Engineering-Guidelines.md`
> web utama) supaya developer yang sama bisa bekerja di kedua codebase tanpa
> banyak context-switching tooling.

## 2. Konvensi Penamaan

Mengikuti konvensi yang sama dengan web utama:

- **File & folder:** `kebab-case`
- **Komponen React:** `PascalCase`
- **Fungsi & variabel:** `camelCase`
- **Konstanta global:** `UPPER_SNAKE_CASE`
- **Model Prisma:** `PascalCase` singular
- **Enum Prisma:** `UPPER_SNAKE_CASE` untuk value — **wajib identik** dengan enum
  yang sudah ada di web utama untuk tipe yang dipakai bersama (`AdminRole`)
- **Route API:** `kebab-case`, plural untuk collection

## 3. Struktur Data & Identitas

- **UUID** wajib untuk seluruh primary key tabel baru
- Tabel `AdminUser` **tidak boleh** dimigrasikan/diubah strukturnya dari project
  ini — hanya dibaca/dipetakan (`@@map`)
- Tidak ada slug publik untuk entitas Tabia Ops — seluruh modul ada di balik
  autentikasi admin, tidak ada halaman publik

## 4. Validasi & Keamanan

- Setiap API route **wajib** validasi input dengan `zod`
- Setiap route wajib dicek sesi login via middleware, dengan role-check tambahan
  di level route handler untuk aksi sensitif (kelola `KpiMetric`/`KpiTarget`,
  kelola task tim lain)
- `NEXTAUTH_SECRET` **wajib sama** dengan web utama — perubahan di satu sisi harus
  disinkronkan ke sisi lain, idealnya disimpan di satu secret manager/vault yang
  dibagikan ke kedua deployment
- Sanitasi input rich text (wiki) untuk mencegah XSS sebelum disimpan atau saat
  dirender

## 5. Penanganan Migrasi Database (Kritikal)

- **Jangan pernah** menjalankan `prisma migrate dev/deploy` dari project Tabia Ops
  terhadap model yang bukan miliknya (`AdminUser`, `Donation`, `Campaign`, dst)
- Sebelum menambah field baru ke model `AdminUser` di schema Tabia Ops (untuk
  keperluan relasi), pastikan field tersebut memang sudah ada secara fisik di
  tabel (via `prisma db pull`) — jangan menambah field yang berarti membuat kolom
  baru di tabel milik web utama
- Setiap migration baru dari Tabia Ops harus di-review agar tidak menyentuh tabel
  di luar daftar model barunya (`Task`, `KpiMetric`, `KpiTarget`, `KpiEntry`,
  `ContentCalendarItem`, `WikiPage`, `CustomTable`, `CustomTableField`,
  `CustomTableRow`)

## 6. Penanganan Status & Business Logic

- Perubahan status `Task` (`BRIEF` → `DALAM_PROSES` → `REVIEW` → `SELESAI`)
  sebaiknya melalui satu fungsi terpusat (service layer), agar efek samping
  (mis. auto-generate `KpiEntry` di fase lanjutan) tetap konsisten
- Perhitungan progress KPI (target vs realisasi) dihitung di level aplikasi,
  bukan trigger database

## 7. Testing & Quality

- Unit test untuk business logic kritikal: perhitungan progress KPI, generate
  slot kalender recurring
- Validasi manual sebelum deploy: alur task board end-to-end, alur input KPI,
  shared session lintas subdomain (login di web utama → cek status login di
  Tabia Ops, dan sebaliknya)
- Linting wajib (ESLint + Prettier) sebelum commit
- Gunakan conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)

## 8. Environment Variables (Contoh)

```env
DATABASE_URL=postgresql://user:password@<supabase-host>:5432/tabia_db   # sama dgn web utama
NEXTAUTH_SECRET=                      # HARUS identik dengan web utama
NEXTAUTH_URL=https://ops.rumahtahfidztabia.com
NEXT_PUBLIC_MAIN_SITE_URL=https://rumahtahfidztabia.com
```

## 9. Deployment Checklist (VPS)

1. Clone repository Tabia Ops ke server (folder terpisah dari web utama)
2. Set environment variables di `.env` — pastikan `DATABASE_URL` menunjuk ke
   database yang sama dengan web utama, dan `NEXTAUTH_SECRET` identik
3. Jalankan `prisma db pull` untuk introspeksi tabel `AdminUser`, lalu
   `prisma migrate deploy` untuk tabel baru
4. Build aplikasi (`npm run build`)
5. Jalankan lewat PM2 dengan nama process berbeda (`pm2 start npm --name
   "tabia-ops" -- start`)
6. Tambahkan block `server_name ops.rumahtahfidztabia.com` baru di konfigurasi
   Nginx, arahkan ke port Tabia Ops
7. Verifikasi: login di web utama lalu buka Tabia Ops (harus sudah ter-login),
   dan sebaliknya
