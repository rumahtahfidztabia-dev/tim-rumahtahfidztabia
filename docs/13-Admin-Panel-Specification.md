# 13 - Admin Panel Specification
## Sistem "Tabia Ops" — KPI & Manajemen Kerja

---

## 1. Struktur Navigasi

### 1.1 Sidebar (Modul Utama)

1. Dashboard/Overview (ringkasan KPI + task jatuh tempo)
2. Task Board (Kanban)
3. Kalender Konten
4. KPI — Target & Realisasi
5. Wiki / Dokumen Internal
6. Tabel Custom
7. Pengaturan Akun Pribadi (navbar, bukan sidebar — konsisten dengan web utama)

### 1.2 Navbar (Elemen Tetap)

| Item | Posisi | Fungsi |
|---|---|---|
| 👁 Lihat Web Utama | Kanan | Buka tab baru ke `rumahtahfidztabia.com` |
| 👤 Avatar Admin | Kanan (paling ujung) | Dropdown: Pengaturan Akun Pribadi, Logout — logout di sini idealnya juga mengakhiri sesi di web utama karena cookie di-share |

## 2. Role & Hak Akses

| Role | Akses |
|---|---|
| `SUPERADMIN` | Akses penuh ke seluruh tim (Konten & Fundraising), kelola `KpiMetric`/`KpiTarget`, kelola task semua tim, akses semua wiki & tabel custom |
| `EDITOR` | Task board & kalender konten tim **Konten**, input KPI entry sendiri, akses wiki (baca semua, tulis sesuai tim), tabel custom |
| `KEUANGAN` | Task board tim **Fundraising**, input KPI entry sendiri, akses wiki (baca semua, tulis sesuai tim), tabel custom |

> Role di sini **dipakai ulang** dari sistem web utama (bukan role baru) —
> `EDITOR` dipetakan ke tim Konten, `KEUANGAN` ke tim Fundraising.

## 3. Detail per Modul

### 3.1 Dashboard/Overview
**Akses:** semua role (data ditampilkan sesuai tim masing-masing; `SUPERADMIN`
lihat semua)
- Ringkasan progress KPI minggu/bulan berjalan (target vs realisasi)
- Task jatuh tempo hari ini/minggu ini (milik user yang login)
- Shortcut ke Task Board dan Kalender Konten

### 3.2 Task Board
**Akses:** semua role (scope sesuai tim; `SUPERADMIN` bisa lihat & kelola semua tim)
- Tampilan kanban 4 kolom (`BRIEF`, `DALAM_PROSES`, `REVIEW`, `SELESAI`)
- CRUD task: judul, deskripsi, tim, tipe, due date, assignee
- Filter per assignee, per tipe task
- Update status via drag-and-drop atau dropdown

### 3.3 Kalender Konten
**Akses:** semua role (scope sesuai tim; `SUPERADMIN` lihat semua)
- Tampilan kalender bulanan/mingguan
- CRUD `ContentCalendarItem`: tanggal, channel, topik, recurring, catatan
- Generate slot recurring untuk periode ke depan berdasarkan pola rotasi yang
  sudah disimpan
- Buat task langsung dari slot kalender

### 3.4 KPI — Target & Realisasi
**Akses:**
- `SUPERADMIN` — CRUD `KpiMetric`, CRUD `KpiTarget` per periode
- `EDITOR`/`KEUANGAN` — lihat metrik & target tim sendiri, input `KpiEntry` sendiri
- Tabel/list metrik aktif per tim
- Form input realisasi harian/mingguan
- Grafik tren progress (menggunakan `recharts`, konsisten dengan dashboard donasi
  web utama)

### 3.5 Wiki / Dokumen Internal
**Akses:** semua role (baca semua halaman; tulis sesuai tim, `SUPERADMIN` bebas)
- CRUD halaman wiki dengan rich text editor
- Struktur bertingkat (parent/child) ditampilkan sebagai tree navigasi
- Pencarian judul/isi

### 3.6 Tabel Custom
**Akses:** `EDITOR`, `KEUANGAN`, `SUPERADMIN` (semua bisa buat tabel baru)
- CRUD `CustomTable` beserta `CustomTableField` (kolom) dan `CustomTableRow` (baris)
- Tampilan grid, tambah/edit/hapus kolom dan baris

### 3.7 Pengaturan Akun Pribadi
**Akses:** semua role
- Sama seperti web utama — edit profil dasar, preferensi tampilan
- Perubahan password sebaiknya tetap dilakukan lewat web utama (karena `AdminUser`
  sama), Tabia Ops cukup redirect ke halaman tersebut agar tidak ada dua tempat
  yang mengubah password secara terpisah

## 4. Alur Kerja Harian Admin (Contoh)

1. Login → cek Dashboard/Overview untuk ringkasan KPI & task jatuh tempo
2. Buka **Task Board** tim masing-masing, cek task hari ini
3. Update status task seiring progres pekerjaan
4. Buka **KPI** → input realisasi kerja hari ini (mis. jumlah follow-up donatur)
5. Cek **Kalender Konten** untuk slot minggu depan, siapkan task baru bila perlu
6. `SUPERADMIN`: sesekali cek dashboard lintas tim, evaluasi target KPI periode
   berikutnya
