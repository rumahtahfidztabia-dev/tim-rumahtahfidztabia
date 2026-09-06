# 15 - Next.js Project Blueprint
## Sistem "Tabia Ops" — KPI & Manajemen Kerja

---

## 1. Struktur Folder Proyek

```
tabia-ops/
├── prisma/
│   ├── schema.prisma          # model di 11-Database-Architecture.md (termasuk AdminUser read-mostly)
│   └── seed.ts                # KpiMetric contoh, ContentCalendarItem recurring awal
├── src/
│   ├── app/
│   │   ├── (ops)/                     # route group utama, di balik middleware auth
│   │   │   ├── layout.tsx             # sidebar + navbar
│   │   │   ├── page.tsx               # Dashboard/Overview
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx           # Task Board (Kanban)
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx           # Kalender Konten
│   │   │   ├── kpi/
│   │   │   │   ├── page.tsx           # Overview target vs realisasi
│   │   │   │   ├── metrics/           # Kelola KpiMetric & KpiTarget (SUPERADMIN)
│   │   │   │   └── entries/           # Input & riwayat KpiEntry
│   │   │   ├── wiki/
│   │   │   │   ├── page.tsx           # Landing wiki (tree navigasi)
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── tables/
│   │   │   │   ├── page.tsx           # List CustomTable
│   │   │   │   └── [id]/page.tsx      # Grid view satu tabel custom
│   │   │   └── account/               # Pengaturan Akun Pribadi
│   │   │
│   │   ├── api/
│   │   │   ├── auth/                  # NextAuth config, cookie domain induk
│   │   │   ├── tasks/
│   │   │   ├── calendar-items/
│   │   │   ├── kpi/
│   │   │   │   ├── metrics/
│   │   │   │   ├── targets/
│   │   │   │   └── entries/
│   │   │   ├── wiki/
│   │   │   └── tables/
│   │   │
│   │   └── layout.tsx                 # root layout
│   │
│   ├── components/
│   │   ├── kanban/
│   │   │   ├── TaskBoard.tsx
│   │   │   └── TaskCard.tsx
│   │   ├── calendar/
│   │   │   └── ContentCalendar.tsx
│   │   ├── kpi/
│   │   │   ├── KpiProgressCard.tsx
│   │   │   └── KpiEntryForm.tsx
│   │   ├── wiki/
│   │   │   ├── WikiEditor.tsx
│   │   │   └── WikiTree.tsx
│   │   ├── tables/
│   │   │   └── CustomTableGrid.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navbar.tsx
│   │   └── ui/                        # komponen generik (button, input, modal, dll)
│   │
│   ├── lib/
│   │   ├── prisma.ts                  # Prisma client singleton
│   │   ├── auth.ts                    # konfigurasi NextAuth, cookie domain induk, secret sama dgn web utama
│   │   ├── kpi-service.ts             # perhitungan progress target vs realisasi
│   │   ├── calendar-service.ts        # generate slot recurring
│   │   └── validators/                # skema zod per entitas
│   │
│   ├── middleware.ts                  # proteksi seluruh route, role-check per modul
│   └── types/
│
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 2. Modul Inti (`src/lib`)

| File | Tanggung Jawab |
|---|---|
| `auth.ts` | Konfigurasi NextAuth (credentials provider ke tabel `AdminUser` yang sama), JWT session, cookie domain `.rumahtahfidztabia.com` |
| `kpi-service.ts` | Hitung progress `KpiEntry` vs `KpiTarget` per periode, per tim, per individu |
| `calendar-service.ts` | Generate `ContentCalendarItem` recurring untuk periode ke depan berdasarkan pola rotasi mingguan |
| `prisma.ts` | Prisma client singleton, connect ke `DATABASE_URL` yang sama dengan web utama |

## 3. Dependencies Tambahan (di luar yang sudah dipakai web utama)

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.x",
    "@dnd-kit/sortable": "^8.x"
  }
}
```

Dependencies lain (Next.js, Prisma, NextAuth, Zod, TipTap, dompurify, sweetalert2,
sonner, react-hook-form, react-query, dayjs, recharts, lucide-react, clsx,
tailwind-merge) mengikuti versi yang sama seperti di `08-Next.JS-Project-Blueprint.md`
web utama, untuk konsistensi antar codebase.

## 4. Middleware Proteksi

Konsep alur sama seperti web utama, tapi seluruh route (bukan hanya `/admin/*`)
berada di balik proteksi karena Tabia Ops memang aplikasi internal tanpa halaman
publik:

```
Request masuk (semua route kecuali /api/auth/*)
        |
        v
Cek session (NextAuth, cookie domain induk)
        |
   +----+----+
   |         |
 Tidak login  Sudah login
   |         |
   v         v
Redirect   Cek role (jika modul butuh role spesifik, mis. kelola KpiMetric)
ke /login       |
           +----+----+
           |         |
        Role cocok  Role tidak cocok
           |         |
           v         v
        Lanjut    403 Forbidden
```

## 5. Rencana Rendering per Halaman

| Halaman | Strategi Rendering | Alasan |
|---|---|---|
| Seluruh halaman `(ops)/*` | Client-side rendering (CSR) di balik auth | Tidak perlu SEO, interaktivitas tinggi (kanban, grid, kalender) |

## 6. Setup Awal (Urutan Kerja)

1. `npx create-next-app@latest tabia-ops --typescript --tailwind --app`
2. Install dependencies inti (`prisma`, `next-auth`, `zod`, `@dnd-kit/core`, dll)
3. `npx prisma init`, set `DATABASE_URL` ke database Supabase yang sama dengan web
   utama
4. `npx prisma db pull` untuk introspeksi tabel `AdminUser` yang sudah ada
5. Tempel model baru dari `11-Database-Architecture.md` ke `schema.prisma`
6. `npx prisma migrate dev --name init` (hanya membuat tabel baru)
7. Setup NextAuth dengan `NEXTAUTH_SECRET` yang identik dengan web utama, cookie
   domain `.rumahtahfidztabia.com`
8. Bangun layout utama (`src/app/(ops)/layout.tsx`) — sidebar + navbar dulu
9. Bangun modul satu per satu, disarankan urutan: KPI (metric & target dulu) →
   Task Board → Kalender Konten → Wiki → Tabel Custom
10. Uji shared session: login di web utama, buka Tabia Ops tanpa login ulang
