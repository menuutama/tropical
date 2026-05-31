// Gantikan teks di bawah dengan URL Web App yang anda salin dari Google Apps Script (GAS)
const GAS_WEB_APP_URL = "MASUKKAN_URL_WEB_APP_GAS_ANDA_DI_SINI";

// Fungsi untuk menarik data dari Google Sheets
async function fetchPinkAwardData() {
  const mainArea = document.getElementById('mainGalleryArea');
  mainArea.innerHTML = '<p style="text-align:center; width:100%; color:#666;">Sedang memuatkan gambar dari Google Sheets...</p>';

  try {
    const response = await fetch(GAS_WEB_APP_URL);
    const data = await response.json();
    
    // Hantar data terus ke fungsi utama yang anda buat tadi
    initializeGallery(data); 
  } catch (error) {
    console.error("Gagal dapatkan data:", error);
    mainArea.innerHTML = '<p style="color:red; text-align:center; width:100%;">Gagal memuatkan data. Sila semak sambungan API anda.</p>';
  }
}

// 5. Sambungkan Event Listener Utama Selepas Muat Halaman
document.addEventListener('DOMContentLoaded', () => {
  // PANGGIL FUNGSI AMBIL DATA DI SINI APABILA HALAMAN DI-LOAD
  fetchPinkAwardData(); 

  // Pasang kawalan carian input & dropdown
  document.getElementById('searchBar').addEventListener('input', filterData);
  document.getElementById('categoryDropdown').addEventListener('change', filterData);
  
  // Pasang fungsi butang pop-up di bawah sekali

      companyItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'banner-card';
      
      // Ditambah perlindungan (item.name || '') supaya jika nama kosong, sistem tidak crash
      const empName = item.name ? item.name.toLowerCase() : '';
      const compName = item.company ? item.company : '';
      const bannerUrl = item.bannerUrl ? item.bannerUrl : '';

      card.setAttribute('data-name', empName);
      card.setAttribute('data-company', compName);
      card.setAttribute('data-url', bannerUrl);

      card.innerHTML = `
        <input type="checkbox" class="item-checkbox" data-company="${company}">
        <div class="image-wrapper">
          <img src="${bannerUrl}" alt="Banner" onerror="this.src='https://placehold.co'">
        </div>
      `;
      gridDiv.appendChild(card);
    });

  document.getElementById('openPopupBtn').addEventListener('click', openSelectedInPopup);
});
