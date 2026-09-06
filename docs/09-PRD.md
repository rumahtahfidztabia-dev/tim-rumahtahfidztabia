# 09 - Product Requirements Document (PRD)
## Sistem "Tabia Ops" — KPI & Manajemen Kerja (Subdomain Rumah Tahfidz Tabia)

---

## 1. Latar Belakang

Rumah Tahfidz Tabia sudah memiliki website publik + admin dashboard (compro, donasi,
CRM donatur, konten) sebagaimana dijabarkan di dokumen `01`–`08`. Namun operasional
internal tim — terutama **tim konten** dan **tim fundraising** — masih berjalan manual:
jadwal rotasi konten, alur brief→desain→review→upload, follow-up donatur, dan progres
kerja harian belum punya sistem pencatatan. Akibatnya, KPI kinerja tim tidak terukur
secara sistematis.

Dibutuhkan sebuah sistem tambahan — **"Tabia Ops"** — berupa:
1. **Sistem KPI** — target vs realisasi kerja tim konten & fundraising
2. **Sistem manajemen kerja ala Notion** — task board, kalender konten, wiki/dokumen
   internal, dan tabel data custom

Sistem ini berjalan sebagai **aplikasi terpisah** (project/codebase berbeda) yang
diakses lewat **subdomain** dari website utama, namun **berbagi database Postgres
yang sama (di Supabase)** dan **berbagi akun admin yang sama**.

## 2. Tujuan Produk

- Memberi tim konten & fundraising satu tempat kerja terpusat (task, kalender, wiki)
  yang mencerminkan alur kerja yang sudah mereka jalani secara manual
- Mengukur KPI tim secara objektif dan berkelanjutan (bukan estimasi/ingatan manual)
- Menjadikan SOP & referensi kerja (struktur cerita campaign 6 bagian, design system,
  kalender rotasi konten) sebagai dokumen hidup yang bisa diakses tim, bukan terserak
  di chat/percakapan personal
- Tidak mengubah sistem login admin yang sudah ada — satu akun, dua aplikasi

## 3. Ruang Lingkup (Scope)

### 3.1 Termasuk dalam scope
- Task board / kanban (per tim: Konten, Fundraising)
- Kalender konten (mapping ke rotasi mingguan campaign & kegiatan santri yang sudah ada)
- Wiki / dokumen internal (SOP, referensi gaya, struktur konten)
- Tabel data custom (fleksibel, ala Notion database) untuk kebutuhan tim yang belum
  terwadahi modul di atas
- Modul KPI: target & realisasi, per tim, per periode (harian/mingguan/bulanan)
- Autentikasi terhubung ke akun admin website utama (`AdminUser` yang sama)

### 3.2 Tidak termasuk dalam scope (fase ini)
- KPI otomatis dari data donasi (`Donation`, `Campaign`) — KPI fase ini murni berbasis
  input & aktivitas kerja tim, bukan agregasi data donasi
- Integrasi real-time dua arah dengan modul CRM Donatur website utama (fase ini hanya
  *membaca* tabel `AdminUser` untuk keperluan login; tidak menulis balik ke data donasi)
- Notifikasi Telegram (bisa menyusul di fase berikut, mengikuti pola yang sudah ada
  di website utama)
- Mobile app terpisah — cukup responsif web

## 4. Target Pengguna

| Peran | Deskripsi |
|---|---|
| `SUPERADMIN` | Akses penuh ke seluruh tim, kelola target KPI, kelola task semua tim |
| `EDITOR` | Anggota tim **Konten** — task board & kalender konten, input KPI sendiri |
| `KEUANGAN` | Anggota tim **Fundraising** — task board fundraising, input KPI sendiri |

> Role dipakai ulang dari sistem admin website utama (bukan role baru) — `EDITOR`
> dipetakan ke tim Konten, `KEUANGAN` ke tim Fundraising.

## 5. Fitur Utama (High-Level)

1. **Task Board (Kanban)** — kolom Brief → Dalam Proses → Review → Selesai, per tim
2. **Kalender Konten** — jadwal konten harian/mingguan, terhubung ke task
3. **Modul KPI** — target vs realisasi per tim/individu, per periode
4. **Wiki/Dokumen Internal** — SOP & referensi kerja tersimpan terstruktur
5. **Tabel Custom** — database fleksibel ala Notion untuk kebutuhan tim di luar 4 modul di atas
6. **Auth Terhubung** — satu akun admin dipakai di dua aplikasi (web utama & Tabia Ops)

Detail arsitektur, skema data, dan fungsional lengkap ada di dokumen `10`–`15`.

## 6. Batasan & Asumsi

- Database Postgres yang sama (di Supabase) dipakai bersama website utama — tabel
  baru untuk Tabia Ops ditambahkan langsung di skema yang sama (`public`), bukan
  schema terpisah
- Tabel `AdminUser` milik website utama tidak dimigrasikan ulang dari project Tabia
  Ops — hanya dibaca/divalidasi (lihat `10-Software-Architecture.md`)
- Fase ini belum mengintegrasikan KPI dengan data donasi — murni KPI aktivitas kerja
  tim (lihat `12-Functional-Specification.md`)

## 7. Hal yang Masih Perlu Diputuskan (Belum Difinalkan)

- Nama subdomain resmi (usulan: `ops.rumahtahfidztabia.com`)
- Apakah `KpiEntry` diinput manual penuh, atau sebagian otomatis dari `Task` yang
  `SELESAI` (fase lanjutan)
- Apakah notifikasi (Telegram/in-app) untuk task/KPI menyusul di fase berikutnya
- Detail daftar `KpiMetric` final per tim (baru dijelaskan sebagai contoh di dokumen
  ini — perlu difinalkan bersama tim Konten & Fundraising)

## 8. Dokumen Terkait

| Dokumen | Isi |
|---|---|
| 01–08 (existing) | PRD, arsitektur, functional spec, database, admin panel, API, engineering guidelines, blueprint website utama |
| 09 (dokumen ini) | PRD sistem Tabia Ops |
| 10-Software-Architecture.md | Arsitektur sistem, deployment, strategi auth & migrasi database |
| 11-Database-Architecture.md | Skema Prisma tambahan (Task, KPI, Wiki, Tabel Custom) |
| 12-Functional-Specification.md | Detail fungsional modul KPI & manajemen kerja |
| 13-Admin-Panel-Specification.md | Detail modul & navigasi dashboard Tabia Ops |
| 14-Engineering-Guidelines.md | Standar coding & konvensi proyek Tabia Ops |
| 15-Project-Blueprint.md | Struktur folder & setup proyek Next.js Tabia Ops |
