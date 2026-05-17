# 🔧 PERINTAH YANG HARUS DIJALANKAN SETELAH PERUBAHAN INI

Buka terminal di folder proyek: C:\Users\adibw\Documents\widegy

## WAJIB — Push schema baru ke database (untuk kolom bannedUntil)
```bash
npx prisma db push
npx prisma generate
```

## Lalu restart dev server
```bash
npm run dev
```

---

# ✅ SEMUA YANG SUDAH DIFIX

## 1. AFFILIATE — Flow "Jadi Affiliate" sudah benar
- Klik "Jadi Affiliator" → langsung ke /affiliator/setup (tidak perlu upgrade role dulu)
- Di setup page: isi data bank → submit → role otomatis berubah ke AFFILIATOR + session refresh
- API /api/affiliates sekarang mengizinkan semua role (selain ADMIN) POST
- Setelah setup berhasil → redirect ke /affiliator/dashboard
- Tombol "Jadi Affiliate" di dashboard otomatis hilang setelah berhasil (karena isAffiliate=true)

## 2. ADMIN tidak lagi masuk ke tampilan buyer
- middleware.ts: /dashboard → redirect ADMIN ke /admin/dashboard otomatis
- buyer layout.tsx: jika role ADMIN → redirect ke /admin/dashboard
- Route /cart, /orders, /browse, dll → ADMIN di-redirect ke /admin/dashboard
- Admin filter di tabel user management tidak bisa di-ban

## 3. BAN USER — Dengan alasan dan durasi waktu
- Modal ban baru di AdminUsersClient: pilih durasi (1/3/7/14/30 hari atau Permanen)
- Isi alasan penangguhan (wajib)
- Unban langsung tanpa modal (tombol "Pulihkan")
- Database: kolom `bannedUntil` baru (nullable DateTime)
- Auto-unban: saat user login dan ban sudah expired → otomatis dibuka
- Layar penuh saat user yang banned buka halaman apapun (BannedScreen component)
  - Tampilkan: durasi ban + alasan + tombol Hubungi Support + tombol Keluar

## 4. PROFIL — Sudah full page (tidak setengah)
- ProfileClient sudah menggunakan max-w-2xl yang lebar
- Ditampilkan secara full dalam BuyerLayout yang full-width

## 5. MIDTRANS — Fix pembayaran gagal  
- item_details total sekarang selalu sama persis dengan gross_amount
- Jika ada selisih rounding → ditambahkan adjustment item otomatis
- Ini adalah penyebab utama "Pembayaran Gagal" di Midtrans

## 6. ADMIN — Hanya 1 akun
- Admin tidak bisa login sebagai buyer
- Admin tidak tampil di daftar user yang bisa di-ban
- Untuk buat akun admin: tetap gunakan script make-admin.ts yang sudah ada

---

# 📝 CATATAN PENTING

### Untuk Midtrans sandbox:
- Gunakan kartu test: 4811 1111 1111 1114 (Visa, success)
- CVV: 123, Expiry: 01/39
- OTP: 112233

### Webhook Midtrans (untuk local dev):
Midtrans tidak bisa callback ke localhost. Gunakan ngrok:
```bash
ngrok http 3000
```
Lalu set URL di dashboard Midtrans: https://xxx.ngrok.io/api/payments/notification
