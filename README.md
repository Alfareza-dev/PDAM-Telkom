<div align="center">
  <img src="public/logo.jpeg" alt="PDAM Smart Logo" width="150" />
  <h1>💧 PDAM SMART</h1>
  <p><strong>Sistem Manajemen Utilitas Air Terpadu & Berkelanjutan</strong></p>
  <p>Platform enterprise berbasis <i>Dark Glassmorphism</i> untuk manajemen pelanggan, pemantauan tagihan real-time, dan tata kelola pembayaran air digital secara menyeluruh.</p>

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![React PDF](https://img.shields.io/badge/React_PDF-Renderer-E34F26?style=for-the-badge&logo=pdf)](https://react-pdf.org/)
</div>

<br />

## 🚀 Ikhtisar Proyek

**PDAM Smart** adalah solusi arsitektur *frontend* generasi baru yang didesain secara spesifik untuk memodernisasi ekosistem penyediaan air minum. Dibangun di atas fondasi **Next.js App Router**, sistem ini secara brilian mengintegrasikan panel operasional bagi Administrator dengan portal swadaya (self-service) interaktif bagi Pelanggan.

## 🛠️ Tech Stack & Ekosistem

Aplikasi ini mendayagunakan ekosistem modern dengan standar *best-practice* tertinggi:
* **Core Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
* **Styling Engine:** [Tailwind CSS v4](https://tailwindcss.com/) terintegrasi dengan utilitas kustom.
* **Component Icons:** [Lucide React](https://lucide.dev/) (Vektor ringan, estetik, dan *scalable*).
* **Document Generator:** `@react-pdf/renderer` (Pembuatan dokumen PDF secara *native* dan asinkron di sisi klien).
* **State & API Handling:** `Axios` untuk *data-fetching* RESTful API, dan `js-cookie` untuk manajemen token enkripsi berbasis *cookie*.
* **UI Interactions:** `Framer Motion` dan `React Toastify` untuk animasi transisi dan notifikasi *toast* yang mulus.

---

## 🌟 Key Features (Dashboard Admin)

Panel khusus eksekutif dan staf PDAM dengan antarmuka analitik terpusat:

- 👥 **Manajemen Terpadu (Admin & Pelanggan):** Registrasi, perubahan data, dan otorisasi kontrol akses dengan antarmuka tabel interaktif.
- 🚰 **Manajemen Kategori Layanan:** Penentuan kelas tarif air (m³) secara fleksibel sesuai kebijakan area.
- 💳 **Sistem Penagihan (Billing) Real-time:** Sinkronisasi pemakaian bulanan meteran air dan perhitungan akumulasi biaya secara otomatis.
- 🛡️ **Verifikasi Pembayaran:** Modul peninjauan khusus untuk menyetujui atau menolak bukti transfer secara proaktif.
- 📄 **Ekspor Nota Tagihan PDF:** Men-generate dan mencetak dokumen *Invoice* PDF berkualitas korporat tanpa bergantung pada render *browser native*.

## 📱 Key Features (Portal Pelanggan)

Akses eksklusif, mandiri, dan transparan bagi pelanggan PDAM:

- 📊 **Dashboard Monitoring Pemakaian:** Visualisasi *insight* penggunaan air bulanan yang komprehensif.
- 💸 **Sistem Pembayaran Mandiri:** Portal untuk mengunggah (upload) bukti transaksi secara aman dan terpantau (*Status: Menunggu Verifikasi*).
- 📜 **Riwayat & Cetak Nota Digital:** Arsip tagihan masa lalu (Lunas) dan pengunduhan kuitansi pembayaran resmi dalam format PDF yang siap dicetak sewaktu-waktu.

---

## 🎨 UI/UX Aesthetic

Fokus utama proyek ini tidak hanya pada performa, melainkan juga pada kenyamanan visual jangka panjang *(Eye-strain reduction)*:

1. **Dark Glassmorphism:** Implementasi kanvas layar gelap dengan palet warna `slate`, cyan/emerald *neon accents*, serta elemen semi-transparan (`backdrop-blur`) untuk memberikan efek kedalaman (*depth*) layaknya kaca buram.
2. **Responsive Universal Modals:** Seluruh *pop-up* form atau detail data dibungkus dalam arsitektur "Scrollable Overlay". Modal akan secara dinamis membatasi tinggi maksimal ke viewport (`max-h-full`) dan hanya menggulung area konten (Body), memastikan tombol navigasi tidak pernah terpotong pada berbagai resolusi layar ponsel maupun monitor lebar.
3. **Typography & Hierarchy:** Penggunaan *font* modern yang ramping dengan kontras warna teks strategis untuk memisahkan metrik analitik dari data pelengkap.

---

## 📂 Project Structure

Pohon direktori menggunakan konvensi Next.js *App Router* berbasis peran (Role-based Layout):

```text
my-app-name/
├── app/
│   ├── (customer)/           # Area eksklusif Pelanggan
│   │   ├── customer/
│   │   │   ├── bills/        # Portal unggah bukti transfer tagihan
│   │   │   ├── dashboard/    # Metrik & insight pelanggan
│   │   │   └── payments/     # Riwayat Lunas
│   │   └── components/       # Layout sidebar/header spesifik pelanggan
│   │
│   ├── (dashboard)/          # Area eksklusif Administrator
│   │   ├── dashboard/
│   │   │   ├── admins/       # Tata kelola pegawai
│   │   │   ├── bills/        # Manajemen tagihan aktif
│   │   │   ├── customers/    # Direktori pelanggan
│   │   │   ├── payments/     # Modul verifikasi pembayaran
│   │   │   ├── profile/      # Profil Admin
│   │   │   └── services/     # Tarif dasar & kategori
│   │   └── components/       # Layout Sidebar, Header & StatCards
│   │
│   ├── components/           # Komponen UI Global
│   │   ├── InvoicePDF.tsx    # Blueprint komponen React-PDF
│   │   └── PDFActionButtons  # Client-wrapper anti SSR
│   │
│   ├── globals.css           # Utilitas Tailwind & Token Warna
│   └── icon.jpeg             # Next.js Native Favicon (Auto-Optimized)
│
├── lib/
│   └── api.ts                # Axios interceptor instance
├── public/                   # Static files (logo)
├── middleware.ts             # Lapisan penjaga rute (Route Guards)
└── package.json              # Daftar Dependensi
```

---

## ⚙️ Installation & Setup

Ikuti instruksi berikut untuk menjalankan aplikasi secara lokal di sistem Anda:

### 1. Kloning Repositori
```bash
git clone https://github.com/Alfareza-dev/PDAM-Telkom.git
cd PDAM-Telkom/my-app-name
```

### 2. Instalasi Dependensi
Pastikan Node.js (versi 18.x atau lebih baru) sudah terpasang.
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env` di *root* direktori proyek dan tentukan *endpoint* API:
```env
# Alamat lengkap ke API Backend yang aktif
NEXT_PUBLIC_BASE_API_URL=http://localhost:8080/api/v1
# Aplikasi Key (Jika menggunakan otentikasi tambahan)
NEXT_PUBLIC_APP_KEY=secret_key_anda
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Aplikasi kini berjalan dan dapat diakses melalui `http://localhost:3000`.

---

## 👨‍💻 Author

**Alfareza.site**  
[![Website](https://img.shields.io/badge/Website-Alfareza.site-0891B2?style=for-the-badge&logo=vercel)](https://alfareza.site)  