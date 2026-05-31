// ⚠️ MASUKKAN URL WEB APP GAS ANDA YANG SEBENAR DI SINI (Sama seperti url di pink.js)
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzjZWDv678_ioJc65wJ_XGUYQaTDYdfFX2U65RxYmPgsz7oKdoFcbwCKPhf7dB86T-t/exec";

let serviceAwardData = []; 

const targetCategories = [
  "10 Years", "15 Years", "20 Years", "25 Years", 
  "30 Years", "35 Years", "40 Years", "55 Years"
];

async function fetchServiceAwardData() {
  const mainArea = document.getElementById('mainGalleryArea');
  mainArea.innerHTML = '<p style="text-align:center; width:100%; color:#aaa; font-size:16px;">Sedang memuatkan gambar dari Google Sheets (serviceAward)...</p>';

  try {
    const response = await fetch(`${GAS_WEB_APP_URL}?page=service`);
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

  serviceAwardData = data;

  targetCategories.forEach(cat => {
    const categoryItems = serviceAwardData.filter(item => item.category === cat || item.category === cat.replace(/\s+/g, ''));
    
    if (categoryItems.length === 0) return; 

    const groupDiv = document.createElement('div');
    groupDiv.className = 'company-group';
    groupDiv.id = `group-${cat.replace(/\s+/g, '')}`;

    groupDiv.innerHTML = `
      <div class="company-header">
        <span class="company-label">${cat}</span>
        <label class="select-all-wrapper">
          <input type="checkbox" class="company-select-all" data-category="${cat}">
          Select All
        </label>
      </div>
      <div class="gallery-container" id="grid-${cat.replace(/\s+/g, '')}"></div>
    `;
    mainArea.appendChild(groupDiv);

    const gridDiv = document.getElementById(`grid-${cat.replace(/\s+/g, '')}`);
    
    // === DI SINI TELAH DIBETULKAN: Menggunakan categoryItems, bukan companyItems ===
    categoryItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'banner-card';
      
      const empName = item.name ? item.name : '';
      const compName = item.company ? item.company : '';
      const bannerUrl = item.bannerUrl ? item.bannerUrl : '';

      card.setAttribute('data-name', empName.toLowerCase());
      card.setAttribute('data-company', compName.toLowerCase());
      card.setAttribute('data-category', item.category);
      card.setAttribute('data-url', bannerUrl);

      card.innerHTML = `
        <input type="checkbox" class="item-checkbox" data-category="${cat}">
        <div class="image-wrapper">
          <img src="${bannerUrl}" alt="Banner" onerror="this.src='https://placehold.co'">
        </div>
        <div class="card-footer">
          <div class="emp-label-name">${empName} - ${compName}</div>
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
      const targetCat = e.target.getAttribute('data-category');
      const groupDiv = document.getElementById(`group-${targetCat.replace(/\s+/g, '')}`);
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

function filterData() {
  const searchText = document.getElementById('searchBar').value.toLowerCase();
  const selectedCategory = document.getElementById('categoryDropdown').value;
  
  targetCategories.forEach(cat => {
    const groupDiv = document.getElementById(`group-${cat.replace(/\s+/g, '')}`);
    if (!groupDiv) return;

    const cards = groupDiv.querySelectorAll('.banner-card');
    let visibleCardsInGroup = 0;

    cards.forEach(card => {
      const cardName = card.getAttribute('data-name');
      const cardCompany = card.getAttribute('data-company');
      const cardCategory = card.getAttribute('data-category');

      const matchesCategory = (selectedCategory === "All Category" || cardCategory === selectedCategory || cardCategory === selectedCategory.replace(/\s+/g, ''));
      const matchesSearch = cardName.includes(searchText) || cardCompany.includes(searchText);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'block'; 
        visibleCardsInGroup++;
      } else {
        card.style.display = 'none';  
        const cb = card.querySelector('.item-checkbox');
        if (cb) cb.checked = false; 
      }
    });

    if (visibleCardsInGroup === 0) {
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

  const popupWindow = window.open("", "ServiceAwardPopup", "width=1000,height=800,scrollbars=no,resizable=yes");
  
  let popupContent = `
    <html>
    <head>
      <title>Long Service Award - Fullscreen Background</title>
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
  fetchServiceAwardData(); 

  document.getElementById('searchBar').addEventListener('input', filterData);
  document.getElementById('categoryDropdown').addEventListener('change', filterData);
  document.getElementById('openPopupBtn').addEventListener('click', openSelectedInPopup);
});
