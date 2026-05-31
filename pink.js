// ⚠️ GANTIKAN URL DI BAWAH DENGAN URL WEB APP GAS ANDA YANG SEBENAR
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw0Bzn8_Z9vVjwZNGKwWb33-P0sZWOIbIYjHa-VT5ml6hBRoFbc2EHCiNx2Gbc-QQNm/exec";

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
function openSelectedInPopup() {
  const checkboxes = document.querySelectorAll('.item-checkbox:checked');
  
  if (checkboxes.length === 0) {
    alert("Sila pilih (tick) sekurang-kurangnya satu gambar terlebih dahulu!");
    return;
  }

  const popupWindow = window.open("", "PinkAwardPopup", "width=900,height=700,scrollbars=yes,resizable=yes");
  
  let popupContent = `
    <html>
    <head>
      <title>Selected Pink Award Banners</title>
      <style>
        body { font-family: sans-serif; background: #1a1a1a; color: #fff; padding: 20px; text-align: center; }
        .popup-title { margin-bottom: 25px; font-size: 20px; border-bottom: 1px solid #333; padding-bottom: 10px; color: #0078d4; }
        .popup-gallery { display: flex; flex-direction: column; gap: 30px; align-items: center; }
        .popup-item { background: #252526; padding: 15px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.6); max-width: 90%; border: 1px solid #333; }
        .popup-item img { max-width: 100%; height: auto; border-radius: 4px; display: block; }
        .popup-meta { margin-top: 10px; font-size: 14px; color: #aaa; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="popup-title">Senarai Gambar Banner Yang Dipilih (${checkboxes.length} Item)</div>
      <div class="popup-gallery">
  `;

  checkboxes.forEach(cb => {
    const card = cb.closest('.banner-card');
    const url = card.getAttribute('data-url');
    const company = card.getAttribute('data-company');
    
    popupContent += `
      <div class="popup-item">
        <img src="${url}" onerror="this.src='https://placehold.co'">
        <div class="popup-meta">Syarikat: ${company}</div>
      </div>
    `;
  });

  popupContent += `
      </div>
    </body>
    </html>
  `;

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
