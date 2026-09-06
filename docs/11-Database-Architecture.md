# 11 - Database Architecture
## Sistem "Tabia Ops" — KPI & Manajemen Kerja

**Database:** PostgreSQL (Supabase, sama dengan website utama)
**ORM:** Prisma (project/schema terpisah)

---

## 1. Prinsip Desain

- Tabel baru Tabia Ops ditambahkan di database yang sama dengan website utama,
  skema `public` yang sama — bukan schema Postgres terpisah
- Tabel `AdminUser` dan enum `AdminRole` milik website utama **tidak dimigrasikan
  ulang** dari sini — hanya dipetakan (`@@map`) sebagai referensi read-mostly
  (lihat `10-Software-Architecture.md` bagian 5)
- Setiap tabel baru menggunakan UUID sebagai primary key, konsisten dengan
  konvensi web utama
- Pola *EAV ringan* (`CustomTable`/`CustomTableField`/`CustomTableRow`) dipakai
  untuk modul tabel custom ala Notion, agar user bisa membuat tabel sendiri tanpa
  generate tabel Postgres baru tiap kali

## 2. Skema Prisma (`schema.prisma` — project Tabia Ops)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // menunjuk ke database yang sama dengan web utama
}

// ==========================================
// REFERENSI KE TABEL WEB UTAMA (read-mostly, tanpa migrate dari sini)
// ==========================================

enum AdminRole {
  SUPERADMIN
  EDITOR
  KEUANGAN
}

model AdminUser {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  role      AdminRole @default(EDITOR)
  avatarUrl String?
  isActive  Boolean   @default(true)

  // relasi ke tabel baru Tabia Ops
  tasksAssigned     Task[]        @relation("AssignedTo")
  tasksCreated      Task[]        @relation("CreatedBy")
  kpiEntries        KpiEntry[]
  wikiPagesAuthored WikiPage[]

  @@map("AdminUser") // menunjuk ke tabel fisik yang sama dengan web utama
}

// ==========================================
// TIM
// ==========================================

enum Team {
  KONTEN
  FUNDRAISING
}

// ==========================================
// TASK BOARD (KANBAN)
// ==========================================

enum TaskStatus {
  BRIEF        // brief/ide masuk
  DALAM_PROSES // desain/pengerjaan
  REVIEW
  SELESAI
}

enum TaskType {
  KONTEN_CAMPAIGN     // sesuai rotasi mingguan campaign
  KONTEN_KEGIATAN     // dokumentasi kegiatan santri
  FUNDRAISING_FOLLOWUP
  LAINNYA
}

model Task {
  id           String     @id @default(uuid())
  title        String
  description  String?
  team         Team
  type         TaskType   @default(LAINNYA)
  status       TaskStatus @default(BRIEF)
  dueDate      DateTime?
  assignedToId String?
  assignedTo   AdminUser? @relation("AssignedTo", fields: [assignedToId], references: [id])
  createdById  String
  createdBy    AdminUser  @relation("CreatedBy", fields: [createdById], references: [id])
  contentCalendarItemId String?
  contentCalendarItem   ContentCalendarItem? @relation(fields: [contentCalendarItemId], references: [id])
  completedAt  DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([team, status])
  @@index([assignedToId])
}

// ==========================================
// KALENDER KONTEN
// ==========================================

enum ContentChannel {
  IG_FEED
  IG_STORY
  THREADS
  FACEBOOK
  WHATSAPP
  WEBSITE
}

model ContentCalendarItem {
  id            String         @id @default(uuid())
  scheduledDate DateTime
  channel       ContentChannel
  topic         String         // misal "Makan Santri", "Kegiatan Belajar Mengajar"
  isRecurring   Boolean        @default(true) // true untuk slot rotasi mingguan tetap
  notes         String?
  tasks         Task[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([scheduledDate])
}

// ==========================================
// KPI
// ==========================================

enum KpiPeriod {
  HARIAN
  MINGGUAN
  BULANAN
}

model KpiMetric {
  id        String      @id @default(uuid())
  team      Team
  name      String      // misal "Jumlah Post Terupload Sesuai Jadwal", "Jumlah Follow-up Donatur"
  unit      String      // misal "post", "follow-up", "closing"
  period    KpiPeriod   @default(MINGGUAN)
  isActive  Boolean     @default(true)
  targets   KpiTarget[]
  entries   KpiEntry[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model KpiTarget {
  id          String    @id @default(uuid())
  metricId    String
  metric      KpiMetric @relation(fields: [metricId], references: [id])
  periodStart DateTime
  periodEnd   DateTime
  targetValue Decimal   @db.Decimal(10, 2)
  createdAt   DateTime  @default(now())

  @@index([metricId, periodStart])
}

model KpiEntry {
  id        String    @id @default(uuid())
  metricId  String
  metric    KpiMetric @relation(fields: [metricId], references: [id])
  userId    String
  user      AdminUser @relation(fields: [userId], references: [id])
  entryDate DateTime  // tanggal realisasi dicatat
  value     Decimal   @db.Decimal(10, 2)
  note      String?
  createdAt DateTime  @default(now())

  @@index([metricId, entryDate])
  @@index([userId, entryDate])
}

// ==========================================
// WIKI / DOKUMEN INTERNAL
// ==========================================

model WikiPage {
  id        String     @id @default(uuid())
  slug      String     @unique
  title     String
  content   String     // rich text (HTML/Markdown), sanitasi sebelum simpan
  parentId  String?
  parent    WikiPage?  @relation("WikiTree", fields: [parentId], references: [id])
  children  WikiPage[] @relation("WikiTree")
  team      Team?      // null = umum/lintas tim
  authorId  String
  author    AdminUser  @relation(fields: [authorId], references: [id])
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

// ==========================================
// DATABASE / TABEL CUSTOM (ALA NOTION)
// ==========================================

enum CustomFieldType {
  TEXT
  NUMBER
  DATE
  SELECT
  MULTI_SELECT
  CHECKBOX
  USER
}

model CustomTable {
  id        String             @id @default(uuid())
  name      String             // misal "Daftar Platform Crowdfunding Eksternal"
  team      Team?
  fields    CustomTableField[]
  rows      CustomTableRow[]
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt
}

model CustomTableField {
  id      String          @id @default(uuid())
  tableId String
  table   CustomTable     @relation(fields: [tableId], references: [id])
  name    String          // nama kolom
  type    CustomFieldType
  options Json?           // untuk SELECT/MULTI_SELECT: daftar pilihan
  order   Int             @default(0)
}

model CustomTableRow {
  id        String      @id @default(uuid())
  tableId   String
  table     CustomTable @relation(fields: [tableId], references: [id])
  data      Json        // { fieldId: value, ... } — fleksibel per baris
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}
```

## 3. Relasi Kunci

| Relasi | Keterangan |
|---|---|
| `Task.assignedToId` → `AdminUser.id` | Nullable — task bisa belum di-assign |
| `Task.createdById` → `AdminUser.id` | Wajib — pencatat siapa yang buat task |
| `Task.contentCalendarItemId` → `ContentCalendarItem.id` | Nullable — task tidak selalu terikat slot kalender |
| `KpiEntry.metricId` → `KpiMetric.id` | Wajib |
| `KpiEntry.userId` → `AdminUser.id` | Wajib — realisasi dicatat per individu |
| `KpiTarget.metricId` → `KpiMetric.id` | Wajib — target berlaku per periode |
| `WikiPage.parentId` → `WikiPage.id` | Self-relation, struktur halaman bertingkat |
| `CustomTableRow.data` | JSON key-value mengacu ke `CustomTableField.id` sebagai key |

## 4. Catatan Desain

- `CustomTable`/`CustomTableField`/`CustomTableRow` memakai pola *EAV ringan* (kolom
  didefinisikan sebagai data, isi baris disimpan sebagai `Json`) — ini cara paling
  praktis meniru "database custom" Notion tanpa generate tabel Postgres baru tiap
  kali user bikin tabel baru di UI
- `Task.type` dan `ContentCalendarItem` dirancang agar bisa langsung memetakan pola
  rotasi mingguan yang sudah berjalan (Senin=Makan Santri, Selasa=Beras/Belajar
  Mengajar, dst) tanpa perlu redesain proses tim
- Agregasi progress KPI (`target vs realisasi`) dihitung di level aplikasi (service
  layer), bukan trigger database, mengikuti prinsip yang sama seperti web utama
  (`Campaign.collectedAmount`)

## 5. Indexing yang Disarankan

```prisma
@@index([team, status])        // pada model Task, untuk filter board per tim
@@index([assignedToId])        // pada model Task, untuk filter "task saya"
@@index([scheduledDate])       // pada model ContentCalendarItem, untuk tampilan kalender
@@index([metricId, entryDate]) // pada model KpiEntry, untuk laporan tren
@@index([userId, entryDate])   // pada model KpiEntry, untuk riwayat per individu
```

## 6. Migrasi & Seeding

- Jalankan `prisma db pull` di awal setup untuk introspeksi tabel `AdminUser` yang
  sudah ada, sebelum menambahkan model baru
- Gunakan `prisma migrate dev` selama development **hanya untuk tabel baru**
  (`Task`, `KpiMetric`, dst), `prisma migrate deploy` untuk produksi
- Buat seed script (`prisma/seed.ts`) untuk data awal: beberapa `KpiMetric` contoh
  per tim, slot `ContentCalendarItem` recurring sesuai rotasi mingguan yang sudah
  disepakati
