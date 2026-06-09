const URL_DATABASE = "https://script.google.com/macros/s/AKfycbw8FRySGsbOspS-OtiTTESfSyJcDbYMOLFXSBynKAY34BS-hIAtQEM3pE0H0yOKknc-/exec";
let jumlahPesanLama = 0;

// Pasang Service Worker
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
  // Jalankan pengecekan background secara periodik
  setInterval(cekPesanLatarBelakang, 6000); 
});

async function cekPesanLatarBelakang() {
  try {
    const res = await fetch(`${URL_DATABASE}?action=getPesan`);
    const data = await res.json();
    
    if (data && data.length > 0) {
      // Jika mendeteksi pertama kali berjalan, samakan jumlah data agar tidak berondong spam
      if (jumlahPesanLama === 0) {
        jumlahPesanLama = data.length;
        return;
      }

      if (data.length > jumlahPesanLama) {
        const pesanTerakhir = data[data.length - 1];
        
        // Hanya kirim notif jika pengirimnya bukan admin
        if (pesanTerakhir && pesanTerakhir.dari !== "admin") {
          const namaNotif = pesanTerakhir.nama ? pesanTerakhir.nama.replace(" :", "") : "Pelanggan Baru";
          const isiNotif = pesanTerakhir.jenis === 'foto' ? "📷 Mengirimkan sebuah foto." : pesanTerakhir.isi;
          
          self.registration.showNotification(namaNotif, {
            body: isiNotif,
            icon: 'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/png/headphones.png',
            vibrate: [200, 100, 200],
            tag: 'pesan-baru-bg'
          });
        }
        jumlahPesanLama = data.length;
      }
    }
  } catch (err) {
    console.log("Gagal mengecek pesan di background:", err);
  }
}
