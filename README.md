# ARUNIKA

**Catat yang dibaca. Simpan yang dipelajari. Tumbuh setiap hari.**

Arunika adalah PWA reading journal & learning tracker yang dibangun dengan Next.js dan pendekatan local-first. Versi ini sengaja belum terhubung ke Supabase/backend lisensi.

## Fitur

- Landing page + Demo Mode
- Reading Log lengkap: status, progress, rating, harga, jenis, kepemilikan, review, cover
- Learning Log: video, podcast, webinar, course, source, durasi, rating, highlight
- Reading Session: halaman awal/akhir, menit, notes, highlight
- Habit Tracker bulanan
- Wishlist / waiting list
- Knowledge Vault
- Insights: monthly reads/watch, genre, author, channel
- Onboarding + target halaman harian dan buku tahunan
- IndexedDB local-first
- Backup/restore JSON (Pro)
- PWA manifest + service worker + install flow
- Demo vs Pro UI, harga Rp25.000
- Aktivasi kode lisensi + PIN (local placeholder; siap diganti backend universal)
- Responsive mobile + desktop

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Rute

- `/` Landing page
- `/app` Aplikasi / Demo Mode
- `/pro` Arunika Pro
- `/activate` Aktivasi kode + PIN

## Data & backend

Semua data journal pengguna tersimpan di IndexedDB pada perangkat. Supabase belum digunakan pada fase ini. Integrasi berikutnya cukup mengganti proses aktivasi/pembelian ke universal licensing backend tanpa memindahkan data personal journal ke server.
