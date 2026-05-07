# 🌟 Sokong - Web3 Time Capsule Platform

Selamat datang di proyek **Sokong**! Ini adalah platform donasi interaktif bergaya Web3 yang dibangun di atas jaringan Solana. Melalui platform ini, pendukung dapat mengirimkan donasi beserta pesan kenangan (Time Capsule) yang akan ditampilkan sebagai kartu 3D holografik yang keren secara langsung dari blockchain!

Panduan ini dibuat khusus untuk pemula. Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di komputermu sendiri dari nol. 🚀

---

## 🛠️ Langkah 1: Persiapan dan Unduh Proyek (Download)

Pertama, kamu perlu mengunduh kode proyek ini dari repositori tim kita di GitHub.

1. Buka halaman GitHub proyek kita: [bintang7714/web-giftplease](https://github.com/bintang7714/web-giftplease)
2. Klik tombol hijau bertuliskan **"Code"**.
3. Pilih **"Download ZIP"**.
4. Setelah terunduh, ekstrak (unzip) folder tersebut ke dalam komputermu.

*(Alternatif untuk pengguna Terminal/Git: Kamu bisa langsung menjalankan perintah `git clone https://github.com/bintang7714/web-giftplease.git` di terminalmu).*

---

## 👻 Langkah 2: Menyiapkan Dompet Phantom (Solana Wallet)

Karena proyek ini berjalan di atas teknologi blockchain Solana, kamu membutuhkan dompet digital (wallet) khusus bernama **Phantom**.

1. Buka browser (disarankan Google Chrome atau Brave) dan kunjungi [https://phantom.app/](https://phantom.app/).
2. Klik **"Download"** dan pasang ekstensi Phantom di browsermu.
3. Ikuti instruksi di layar untuk **"Create a New Wallet"** (Buat Dompet Baru). *Simpan kata sandi dan frasa rahasia (Secret Recovery Phrase) kamu di tempat yang aman!*
4. **PENTING: Aktifkan Jaringan Devnet!**
   - Buka ekstensi Phantom.
   - Klik ikon **Pengaturan (Settings/Gear)** di pojok kiri atas.
   - Pilih menu **"Developer Settings"** (Pengaturan Pengembang).
   - Aktifkan / nyalakan tombol **"Testnet Mode"**.
   - Pilih jaringan **"Solana Devnet"**.

*Catatan: Pastikan dompet Devnet kamu sudah terisi saldo koin SOL bohongan (Devnet SOL) agar bisa mencoba fitur donasi. Kamu dapat melakukan airdrop secara gratis di website Solana Faucet.*

---

## 💻 Langkah 3: Menginstal Kebutuhan Sistem (Dependencies)

Sekarang, mari kita siapkan mesinnya agar website bisa berjalan. Sebelum memulai, pastikan kamu sudah menginstal [Node.js](https://nodejs.org/) di komputermu.

1. Buka aplikasi **Terminal** (Mac) atau **Command Prompt / PowerShell** (Windows).
2. Arahkan terminal ke dalam folder proyek yang sudah kamu ekstrak sebelumnya, lalu masuk ke dalam folder `client`:
   ```bash
   cd path/menuju/folder/web-giftplease/client
   ```
3. Ketik perintah berikut lalu tekan **Enter** untuk mengunduh semua sistem yang dibutuhkan:
   ```bash
   npm install
   ```
   *(Tunggu beberapa saat sampai proses instalasi selesai 100%).*

---

## 🚀 Langkah 4: Menjalankan Website Secara Lokal

Setelah semua sistem terinstal, kita siap untuk meluncurkan website!

1. Masih di dalam terminal yang sama (di dalam folder `client`), ketik perintah berikut:
   ```bash
   npm run dev
   ```
2. Terminal akan menampilkan tautan server lokal, biasanya berupa: `http://localhost:5173/` (atau port lain seperti 5174/5175).
3. Buka browser kamu dan salin tautan tersebut, lalu tekan **Enter**.
4. *Voila!* Dashboard Sokong yang memukau dengan desain neon Solana akan tampil di layarmu.

---

## 💎 Langkah 5: Mulai Menjelajah dan Berdonasi!

**Kabar Baik!** 🎉 
Kamu tidak perlu pusing mengatur konfigurasi smart contract awal. Status global blockchain (*Vault State*) proyek ini **sudah diinisialisasi oleh Gilang**! 

Artinya, kamu bisa **langsung mencoba fitur utama**:
- Hubungkan dompet Phantom kamu menggunakan tombol "Select Wallet".
- Masukkan jumlah donasi dan tuliskan pesan spesial di form "Time Capsule Message".
- Klik **"Send Sokong"** dan setujui transaksi di dompet Phantom yang muncul.
- Lihat pesanmu langsung muncul secara ajaib di *Time Capsule Gallery* dalam bentuk kartu 3D holografik bergaya Pokémon! ✨

Selamat bersenang-senang dan selamat berkreasi! Jika ada kendala, jangan ragu untuk bertanya pada tim. 🚀
