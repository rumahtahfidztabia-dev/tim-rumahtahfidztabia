# 12 - Functional Specification
## Sistem "Tabia Ops" — KPI & Manajemen Kerja

---

## 1. Modul KPI

### 1.1 Konsep

- KPI didefinisikan sebagai `KpiMetric` per tim (Konten/Fundraising), dengan target
  (`KpiTarget`) per periode, dan realisasi (`KpiEntry`) yang diinput tim
- Contoh metrik tim Konten: jumlah post terupload sesuai jadwal, ketepatan waktu
  upload (on-time vs telat), jumlah artikel/kegiatan published per bulan
- Contoh metrik tim Fundraising: jumlah follow-up donatur per hari/minggu, jumlah
  prospek yang closing, nominal yang berhasil di-follow-up
- Realisasi (`KpiEntry`) bisa diinput manual oleh masing-masing user, atau otomatis
  ter-generate saat `Task` berstatus `SELESAI` dalam kategori terkait (opsional,
  bisa dikembangkan di fase lanjutan — lihat `09-PRD.md` bagian 7)

### 1.2 Alur Kerja

1. `SUPERADMIN` mendefinisikan `KpiMetric` baru (nama, satuan, periode, tim)
2. `SUPERADMIN` menetapkan `KpiTarget` untuk periode berjalan (mis. target mingguan)
3. Anggota tim (`EDITOR`/`KEUANGAN`) menginput `KpiEntry` — realisasi harian/mingguan
   sesuai metrik yang relevan dengan timnya
4. Sistem menghitung progress (realisasi vs target) secara real-time di dashboard

### 1.3 Tampilan

- Dashboard KPI per tim: target vs realisasi (progress bar/gauge), tren mingguan
- Dashboard KPI per individu: riwayat entry, achievement rate
- `SUPERADMIN`: bisa lihat semua tim, kelola target KPI baru

## 2. Modul Task Board (Kanban)

### 2.1 Struktur Kolom

Kolom board mengikuti alur kerja yang sudah berjalan secara manual:

**Brief → Dalam Proses → Review → Selesai**

Selaras dengan pola produksi konten yang sudah ada: brief H-3, desain/draft H-2,
review H-1, upload H-0.

### 2.2 Field Task

| Field | Keterangan |
|---|---|
| Judul | Judul singkat task |
| Deskripsi | Opsional, detail pekerjaan |
| Tim | `KONTEN` atau `FUNDRAISING` |
| Tipe | `KONTEN_CAMPAIGN`, `KONTEN_KEGIATAN`, `FUNDRAISING_FOLLOWUP`, `LAINNYA` |
| Status | `BRIEF`, `DALAM_PROSES`, `REVIEW`, `SELESAI` |
| Due date | Tanggal target selesai |
| Assignee | Anggota tim yang bertanggung jawab |
| Terhubung ke kalender | Opsional, mengaitkan ke satu `ContentCalendarItem` |

### 2.3 Interaksi

- Filter per tim, per assignee, per tipe task
- Drag-and-drop antar kolom status (atau dropdown status di board sederhana)
- Saat status berubah menjadi `SELESAI`, `completedAt` tercatat otomatis

## 3. Modul Kalender Konten

### 3.1 Konsep

- Tampilan kalender bulanan/mingguan berisi `ContentCalendarItem`
- Bisa di-generate otomatis untuk slot recurring (rotasi mingguan tetap), lalu
  di-assign task per item
- Selaras dengan pola konten yang sudah disepakati: campaign spotlight harian per
  hari (Senin=Makan Santri, Selasa=Beras, Rabu=Honor Pengajar, Kamis=Beasiswa SPP,
  Jumat=Operasional+Wakaf Quran, Sabtu=Pembangunan, Minggu=Sewa Tempat Tinggal)
  + konten kegiatan santri di hari-hari tertentu (Selasa, Kamis, Sabtu, Minggu)

### 3.2 Field Item Kalender

| Field | Keterangan |
|---|---|
| Tanggal terjadwal | Tanggal konten akan tayang |
| Channel | `IG_FEED`, `IG_STORY`, `THREADS`, `FACEBOOK`, `WHATSAPP`, `WEBSITE` |
| Topik | Judul/tema konten, misal "Makan Santri", "Kegiatan Belajar Mengajar" |
| Recurring | Toggle — true untuk slot rotasi tetap, false untuk konten one-off |
| Catatan | Opsional |
| Task terkait | Task produksi yang terhubung ke slot ini |

### 3.3 Interaksi

- Generate slot recurring untuk periode ke depan (mis. sebulan sekali generate
  slot bulan berikutnya berdasarkan pola rotasi yang sudah disimpan)
- Klik slot kalender → buat/lihat task terkait langsung dari situ

## 4. Modul Wiki / Dokumen Internal

### 4.1 Konsep

- Struktur halaman bertingkat (`parentId` → `children`)
- Tempat resmi menyimpan SOP: struktur cerita campaign 6 bagian, gaya judul
  campaign, design system, aturan SEO/metadata, dsb — yang saat ini hanya "hidup"
  secara informal di percakapan tim
- Rich text editor (bisa pakai `TipTap`, konsisten dengan web utama) + sanitasi HTML

### 4.2 Field Halaman

| Field | Keterangan |
|---|---|
| Judul | Judul halaman |
| Slug | URL-friendly, unik |
| Konten | Rich text |
| Parent | Opsional, untuk struktur bertingkat |
| Tim | Opsional — null berarti halaman umum lintas tim |
| Penulis | Otomatis dari user yang login |

### 4.3 Interaksi

- Sidebar navigasi berupa tree (mengikuti struktur `parent`/`children`)
- Pencarian judul/isi halaman
- Riwayat edit dasar (opsional fase lanjutan)

## 5. Modul Tabel Custom

### 5.1 Konsep

- User (`EDITOR`/`KEUANGAN` ke atas) bisa membuat `CustomTable` baru, definisikan
  kolom sendiri (`CustomTableField`), isi barisnya (`CustomTableRow`)
- Contoh pemakaian: daftar platform crowdfunding eksternal & status pendaftaran,
  daftar ide konten yang belum dijadwalkan, checklist onboarding donatur besar

### 5.2 Tipe Field yang Didukung

`TEXT`, `NUMBER`, `DATE`, `SELECT`, `MULTI_SELECT`, `CHECKBOX`, `USER`

### 5.3 Interaksi

- Tampilan grid seperti spreadsheet — tambah kolom, tambah baris, edit inline
- Filter & sort sederhana per kolom (fase lanjutan)

## 6. Ringkasan Alur Kerja Harian (Contoh)

1. Login (sesi sudah aktif jika baru saja login di web utama, atau login langsung
   di Tabia Ops)
2. Cek dashboard KPI ringkas — progress minggu berjalan
3. Buka **Task Board** tim masing-masing, cek task hari ini
4. Update status task seiring pekerjaan berjalan (Brief → Dalam Proses → Review →
   Selesai)
5. Input `KPI Entry` untuk aktivitas yang relevan (mis. jumlah follow-up hari ini)
6. Cek **Kalender Konten** untuk slot minggu depan, buat task baru bila belum ada
