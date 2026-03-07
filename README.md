# PDAM Smart Admin Panel

## Deskripsi
PDAM Smart 

## Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS, CSS Grid, UI Glassmorphism
- **HTTP Client**: Axios untuk integrasi API eksternal
- **Icons**: Lucide React

## Fitur Utama
- **Authentication**: Keamanan berbasis JWT (JSON Web Token) khusus manajemen Admin.
- **Manajemen Admin**: CRUD (Create, Read, Update, Delete) hak akses profil internal pengelola sistem.
- **Katalog Pelanggan (Customer)**: Registrasi dan sinkronisasi data identitas pelanggan beserta jenis layanan air mereka.
- **Manajemen Layanan (Service)**: Mengatur kategori rumah tangga, tarif dasar per meter kubik (m³), dan batasan pamakaian air.
- **Optimasi Pemrosesan Data**: Mengimplementasikan sistem Server-side Pagination & fitur search engine statis tersentral.
- **UI/UX Modern (Glassmorphism)**: Sistem tata letak sepenuhnya adaptif mencakup pergerakan sidebar dan model popup di layar mobile maupun desktop tanpa overlap.

## Getting Started (Cara Instalasi & Menjalankan)

Ikuti langkah-langkah instalasi berikut untuk menjalankan project ini di komputer lokal Anda:

1. **Clone repository ini**
   ```bash
   git clone https://github.com/Alfareza-dev/PDAM-Telkom.git
   ```

2. **Install seluruh library dependencies**
   ```bash
   cd my-app-name
   npm install
   ```

3. **Konfigurasi Environment Variables (.env)**
   Buatlah sebuah file baru bernama `.env.local` di root folder proyek ini. Kemudian, isikan variabel referensi kredensial endpoint API Anda di dalamnya (jangan cantumkan token asli di dalam repository GitHub).
   
   Contoh parameter:
   ```env
   NEXT_PUBLIC_BASE_API_URL="URL_API_BACKEND_ANDA_DI_SINI"
   NEXT_PUBLIC_APP_KEY="SECRET_KEY_APLIKASI_DI_SINI"
   ```

4. **Jalankan local development server**
   ```bash
   npm run dev
   ```
   > Terakhir, buka `http://localhost:3000` di peramban web Anda untuk memulai simulasi sistem.

## Author
**Alfareza**
