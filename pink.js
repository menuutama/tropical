// ⚠️ GANTIKAN URL DI BAWAH DENGAN URL WEB APP GAS ANDA YANG SEBENAR
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzjZWDv678_ioJc65wJ_XGUYQaTDYdfFX2U65RxYmPgsz7oKdoFcbwCKPhf7dB86T-t/exec";

let pinkAwardData = []; 

const targetCompanies = [
  "Tropical Consolidated",
  "Tropical Canning",
  "TC Boy",
  "NamHeng Brothers",
  "TC Venture"
];

async function fetchPinkAwardData() {
  const mainArea = document.getElementById('mainGalleryArea');
  mainArea.innerHTML = '<p style="text-align:center; width:100%; color:#aaa; font-size:16px;">Sedang memuatkan gambar...</p>';

  try {
    const response = await fetch(GAS_WEB_APP_URL);
    const data = await response.json();
    
    if (data.error) {
      mainArea.innerHTML = `<p style="color:red; text-align:center; width:100%;">${data.error}</p>`;
      return;
    }
    
    initializeGallery(data); 
  } catch (error) {
    console.error("Gagal dapatkan data:", error);
    mainArea.innerHTML = '<p style="color:red; text-align:center; width:100%;">Gagal memuatkan data.</p>';
  }
}

function initializeGallery(data) {
  const mainArea = document.getElementById('mainGalleryArea');
  mainArea.innerHTML = ''; 

  pinkAwardData = data;

  targetCompanies.forEach(company => {
    // Penapisan awal menggunakan kaedah pembersihan teks (trim & lowercase) untuk mengelakkan ralat data Google Sheets
    const companyItems = pinkAwardData.filter(item => {
      const sheetCompany = item.company ? item.company.toString().trim().toLowerCase() : '';
      const targetComp = company.trim().toLowerCase();
      return sheetCompany === targetComp;
    });
    
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
      
      const empName = item.name ? item.name : '';
      const compName = item.company ? item.company : '';
      const bannerUrl = item.bannerUrl ? item.bannerUrl : '';

      // Kekalkan nilai asal dalam atribut untuk rujukan visual, tetapi lowercase untuk tapisan
      card.setAttribute('data-name', empName.toLowerCase().trim());
      card.setAttribute('data-company', compName.toLowerCase().trim());
      card.setAttribute('data-url', bannerUrl);

      card.innerHTML = `
        <input type="checkbox" class="item-checkbox" data-company="${company}">
        <div class="image-wrapper">
          <img src="${bannerUrl}" alt="Banner" onerror="this.src='https://placehold.co'">
        </div>
        <div class="card-footer">
          <div class="emp-label-name">${empName}</div>
        </div>
      `;
      gridDiv.appendChild(card);
    });
  });

  setupCheckboxListeners();
}

function setupCheckboxListeners() {
  const selectAllCheckboxes = document.querySelectorAll('.company-select-all');
  
  selectAllCheckboxes.forEach(mainCheckbox => {
    mainCheckbox.addEventListener('change', (e) => {
      const targetCompany = e.target.getAttribute('data-company');
      const groupDiv = document.getElementById(`group-${targetCompany.replace(/\s+/g, '')}`);
      if (!groupDiv) return;

      const cards = groupDiv.querySelectorAll('.banner-card');
      
      cards.forEach(card => {
        if (card.style.display !== 'none') {
          const cb = card.querySelector('.item-checkbox');
          if (cb) cb.checked = e.target.checked;
        }
      });
    });
  });
}

// === DI SINI TELAH DIPERBAIKI: Fungsi Tapisan Kalis Ralat Huruf Besar/Kecil & Ruang Kosong ===
function filterData() {
  const searchText = document.getElementById('searchBar').value.toLowerCase().trim();
  const selectedCategory = document.getElementById('categoryDropdown').value.toLowerCase().trim();
  
  targetCompanies.forEach(company => {
    const companyCleaned = company.toLowerCase().trim();
    const groupDiv = document.getElementById(`group-${company.replace(/\s+/g, '')}`);
    if (!groupDiv) return;

    const cards = groupDiv.querySelectorAll('.banner-card');
    let visibleCardsInGroup = 0;

    cards.forEach(card => {
      const cardName = card.getAttribute('data-name');
      const cardCompany = card.getAttribute('data-company');

      // Semak padanan kategori dropdown (Sama ada pilih "all company" atau nama syarikat sepadan)
      const matchesCategory = (selectedCategory === "all company" || cardCompany === selectedCategory);
      
      // Semak padanan carian teks nama pekerja
      const matchesSearch = cardName.includes(searchText);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'block'; 
        visibleCardsInGroup++;
      } else {
        card.style.display = 'none';  
        const cb = card.querySelector('.item-checkbox');
        if (cb) cb.checked = false; 
      }
    }
  );

    // Sembunyikan atau paparkan keseluruhan seksyen kumpulan syarikat
    // Jika dropdown memilih syarikat spesifik, pastikan seksyen syarikat lain disembunyikan terus
    if (visibleCardsInGroup === 0 || (selectedCategory !== "all company" && companyCleaned !== selectedCategory)) {
      groupDiv.style.display = 'none';
    } else {
      groupDiv.style.display = 'block';
    }
  });
}

function openSelectedInPopup() {
  const checkboxes = document.querySelectorAll('.item-checkbox:checked');
  
  if (checkboxes.length === 0) {
    alert("Sila pilih (tick) sekurang-kurangnya satu gambar terlebih dahulu!");
    return;
  }

  const selectedImages = [];
  checkboxes.forEach(cb => {
    const card = cb.closest('.banner-card');
    selectedImages.push({ url: card.getAttribute('data-url') });
  });

  const popupWindow = window.open("", "PinkAwardPopup", "width=1000,height=800,scrollbars=no,resizable=yes");
  
  let popupContent = `
    <html>
    <head>
      <title>Pink Award - Fullscreen Background Slideshow</title>
      <style>
        body { background: #000; margin: 0; padding: 0; overflow: hidden; height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center; }
        .slideshow-container { width: 100vw; height: 100vh; position: relative; }
        .image-wrapper { width: 100%; height: 100%; }
        .image-wrapper img { width: 100%; height: 100%; object-fit: cover; display: block; }
      </style>
    </head>
    <body>
      <div class="slideshow-container">
        <div class="image-wrapper">
          <img id="displayImage" src="">
        </div>
      </div>
      <script>
        const images = ${JSON.stringify(selectedImages)};
        let currentIndex = 0;

        function showSlide(index) {
          if (images.length === 0) return;
          document.getElementById('displayImage').src = images[index].url;
        }

        function changeSlide(direction) {
          currentIndex += direction;
          if (currentIndex >= images.length) currentIndex = 0;
          else if (currentIndex < 0) currentIndex = images.length - 1;
          showSlide(currentIndex);
        }

        document.addEventListener('keydown', function(event) {
          if (event.key === "ArrowLeft") changeSlide(-1);
          else if (event.key === "ArrowRight") changeSlide(1);
        });

        showSlide(currentIndex);
      <\/script>
    </body>
    </html>
  `;

  popupWindow.document.write(popupContent);
  popupWindow.document.close();
}

document.addEventListener('DOMContentLoaded', () => {
const searchBar = document.getElementById('searchBar');
const clearSearch = document.getElementById('clearSearch');

searchBar.addEventListener('input', () => {
  clearSearch.style.display = searchBar.value.trim() ? 'block' : 'none';
  filterData();
});

clearSearch.addEventListener('click', () => {
  searchBar.value = '';
  clearSearch.style.display = 'none';
  filterData();
  searchBar.focus();
});

  document.getElementById('searchBar').addEventListener('input', filterData);
  document.getElementById('categoryDropdown').addEventListener('change', filterData);
  document.getElementById('openPopupBtn').addEventListener('click', openSelectedInPopup);
});
