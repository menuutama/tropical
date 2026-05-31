// ⚠️ GANTIKAN URL DI BAWAH DENGAN URL WEB APP GAS ANDA YANG SEBENAR
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwiwat_Cxk3Rnr_PEVHJhJQ6MBIBKs0bgMWfh_3DdbdEUH03ILnfLx27gyaMQKt7oP4/exec";

let pinkAwardData = []; 

const targetCompanies = [
  "Tropical Consolidated",
  "Tropical Canning",
  "TC Boy",
  "NamHeng Brothers",
  "TC Venture"
];

// Fungsi Ambil Data dari Google Sheets melalui GAS
async function fetchPinkAwardData() {
  const mainArea = document.getElementById('mainGalleryArea');
  mainArea.innerHTML = '<p style="text-align:center; width:100%; color:#aaa; font-size:16px;">Sedang memuatkan gambar dari Google Sheets...</p>';

  try {
    const response = await fetch(GAS_WEB_APP_URL);
    const data = await response.json();
    
    if (data.error) {
      mainArea.innerHTML = `<p style="color:red; text-align:center; width:100%;">${data.error}</p>`;
      return;
    }
    
    // Simpan data dan terus buat grid susunan gambar
    initializeGallery(data); 
  } catch (error) {
    console.error("Gagal dapatkan data:", error);
    mainArea.innerHTML = '<p style="color:red; text-align:center; width:100%;">Gagal memuatkan data. Sila semak deployment GAS anda atau ralat CORS.</p>';
  }
}

// Fungsi Membina Struktur Galeri Gambar (Mengekalkan Sorting Baris Asal Sheets)
function initializeGallery(data) {
  const mainArea = document.getElementById('mainGalleryArea');
  mainArea.innerHTML = ''; 

  pinkAwardData = data;

  targetCompanies.forEach(company => {
    // Tapis data mengikut syarikat secara tersusun
    const companyItems = pinkAwardData.filter(item => item.company === company);
    
    if (companyItems.length === 0) return; 

    const groupDiv = document.createElement('div');
    groupDiv.className = 'company-group';
    groupDiv.id = `group-${company.replace(/\s+/g, '')}`;

    groupDiv.innerHTML = `
      <div class="company-header">
        <span class="company-label">${company}</span>
        <label class="select-all-wrapper">
          <input type="checkbox" class="company-select-all" data-company="${company}">
          Select All
        </label>
      </div>
      <div class="gallery-container" id="grid-${company.replace(/\s+/g, '')}"></div>
    `;
    mainArea.appendChild(groupDiv);

    const gridDiv = document.getElementById(`grid-${company.replace(/\s+/g, '')}`);
    
    companyItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'banner-card';
      
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
  });

  setupCheckboxListeners();
}

// Kawalan Fungsi Checkbox 'Select All' mengikut Kumpulan Syarikat
function setupCheckboxListeners() {
  const selectAllCheckboxes = document.querySelectorAll('.company-select-all');
  
  selectAllCheckboxes.forEach(mainCheckbox => {
    mainCheckbox.addEventListener('change', (e) => {
      const targetCompany = e.target.getAttribute('data-company');
      const groupDiv = document.getElementById(`group-${targetCompany.replace(/\s+/g, '')}`);
      if (!groupDiv) return;

      const cards = groupDiv.querySelectorAll('.banner-card');
      
      cards.forEach(card => {
        // Hanya tick gambar yang sedang kelihatan sahaja (tidak tersembunyi akibat search)
        if (card.style.display !== 'none') {
          const cb = card.querySelector('.item-checkbox');
          if (cb) cb.checked = e.target.checked;
        }
      });
    });
  });
}

// Fungsi Tapis Carian (Search Bar) & Dropdown Kategori (Tiada Kesan Berkelip/Blinking)
function filterData() {
  const searchText = document.getElementById('searchBar').value.toLowerCase();
  const selectedCategory = document.getElementById('categoryDropdown').value;
  
  targetCompanies.forEach(company => {
    const groupDiv = document.getElementById(`group-${company.replace(/\s+/g, '')}`);
    if (!groupDiv) return;

    const cards = groupDiv.querySelectorAll('.banner-card');
    let visibleCardsInGroup = 0;

    cards.forEach(card => {
      const cardName = card.getAttribute('data-name');
      const cardCompany = card.getAttribute('data-company');

      const matchesCategory = (selectedCategory === "All Company" || cardCompany === selectedCategory);
      const matchesSearch = cardName.includes(searchText);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'block'; 
        visibleCardsInGroup++;
      } else {
        card.style.display = 'none';  
        const cb = card.querySelector('.item-checkbox');
        if (cb) cb.checked = false; // Uncheck automatik jika disembunyikan
      }
    });

    // Sembunyikan label kumpulan jika tiada isi gambar yang sepadan
    if (visibleCardsInGroup === 0) {
      groupDiv.style.display = 'none';
    } else {
      groupDiv.style.display = 'block';
    }
  });
}

// Fungsi Membuka Tetingkap Pop-up Browser bagi Gambar yang Dipilih
// 4. Fungsi Membuka Gambar Dipilih ke dalam Sesi Browser Pop-up Window (Fullscreen Background Style)
function openSelectedInPopup() {
  const checkboxes = document.querySelectorAll('.item-checkbox:checked');
  
  if (checkboxes.length === 0) {
    alert("Sila pilih (tick) sekurang-kurangnya satu gambar terlebih dahulu!");
    return;
  }

  // Kumpul semua data gambar yang ditandakan
  const selectedImages = [];
  checkboxes.forEach(cb => {
    const card = cb.closest('.banner-card');
    selectedImages.push({
      url: card.getAttribute('data-url'),
      company: card.getAttribute('data-company')
    });
  });

  // Buka tetingkap kosong baru di browser
  const popupWindow = window.open("", "PinkAwardPopup", "width=1000,height=800,scrollbars=no,resizable=yes");
  
  // Bina kandungan HTML slideshow penuh skrin dengan elemen visual disembunyikan
  let popupContent = `
    <html>
    <head>
      <title>Pink Award - Fullscreen Background Slideshow</title>
      <style>
        * { box-sizing: border-box; }
        body { 
          background: #000; 
          margin: 0; 
          padding: 0; 
          overflow: hidden; 
          height: 100vh;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        /* Container Utama Slideshow */
        .slideshow-container {
          width: 100vw;
          height: 100vh;
          position: relative;
        }

        /* Mengawal gambar supaya menjadi BACKGROUND FULL SCREEN 100% tanpa bar hitam di tepi */
        .image-wrapper {
          width: 100%;
          height: 100%;
        }
        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover; /* Memenuhkan gambar ke skrin 100% tanpa ruang kosong hitam */
          display: block;
        }

        /* 
          Semua elemen visual seperti butang navigasi dan teks info 
          telah dibuang/dihilangkan dari kod HTML ini bagi memenuhi permintaan anda.
        */
      </style>
    </head>
    <body>

      <div class="slideshow-container">
        <!-- Tempat Gambar Dipaparkan Penuh Skrin -->
        <div class="image-wrapper">
          <img id="displayImage" src="" onerror="this.src='https://placehold.co'">
        </div>
      </div>

      <script>
        // Data gambar yang dihantar dari tetingkap utama
        const images = ${JSON.stringify(selectedImages)};
        let currentIndex = 0;

        // Fungsi memaparkan imej berdasarkan index semasa
        function showSlide(index) {
          if (images.length === 0) return;
          
          const imgElement = document.getElementById('displayImage');
          imgElement.src = images[index].url;
        }

        // Fungsi menukar slide (Tambah atau tolak index)
        function changeSlide(direction) {
          currentIndex += direction;
          
          // Logik pusingan (Looping)
          if (currentIndex >= images.length) {
            currentIndex = 0;
          } else if (currentIndex < 0) {
            currentIndex = images.length - 1;
          }
          
          showSlide(currentIndex);
        }

        // 🚀 FUNGSI KUNCI KEKAL BERFUNGSI: Pengesanan Keyboard (Anak Panah Kiri & Kanan)
        document.addEventListener('keydown', function(event) {
          if (event.key === "ArrowLeft") {
            changeSlide(-1); // Anak panah kiri -> Gambar sebelum
          } else if (event.key === "ArrowRight") {
            changeSlide(1);  // Anak panah kanan -> Gambar seterus
          }
        });

        // Jalankan papar gambar pertama sebaik sahaja pop-up dimuatkan
        showSlide(currentIndex);
      </script>

    </body>
    </html>
  `;

  // Tulis kod ke dalam tetingkap baru dan tutup stream penulisan
  popupWindow.document.write(popupContent);
  popupWindow.document.close();
}

// Jalankan sistem apabila halaman sedia
document.addEventListener('DOMContentLoaded', () => {
  fetchPinkAwardData(); 

  document.getElementById('searchBar').addEventListener('input', filterData);
  document.getElementById('categoryDropdown').addEventListener('change', filterData);
  document.getElementById('openPopupBtn').addEventListener('click', openSelectedInPopup);
});
