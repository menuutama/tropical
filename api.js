const API_URL = "https://script.google.com/macros/s/AKfycbwyHlDqGumNenEhW6w5iAcA2984E1AbnXOfemzaxPOgk8pqXKD-pg6zw4Rw6U3sk-tY/exec";

let allData = [];
let currentPage = 1;

const ROWS_PER_PAGE = 10;

async function loadData(){

  try{

    const response = await fetch(API_URL);
allData = await response.json();

allData = allData.filter(item => {
  return (item.luckyNo ?? "").toString().trim() !== "";
});

/* SORT PLACE ASC */
allData.sort((a,b) => {

  return Number(a.place) - Number(b.place);

});

    renderPage(currentPage);
    renderPagination();

  }catch(error){

    console.log(error);

  }

}

function renderPage(page){

  const tbody = document.getElementById("winnerTable");

  tbody.innerHTML = "";

  const start = (page - 1) * ROWS_PER_PAGE;
  const end = start + ROWS_PER_PAGE;

  const pageData = allData.slice(start,end);

  pageData.forEach(item => {

    tbody.innerHTML += `
      <tr>

        <td>
          <div class="place-badge">
            ${item.place}
          </div>
        </td>

        <td>${item.luckyNo}</td>
        <td>${item.winner}</td>
        <td>${item.company}</td>
        <td>${item.prize}</td>

      </tr>
    `;

  });

  const totalPages = Math.ceil(allData.length / ROWS_PER_PAGE);



}

function renderPagination(){

  const totalPages = Math.ceil(allData.length / ROWS_PER_PAGE);

  let html = "";

  html += `
    <button onclick="prevPage()">Previous</button>
  `;

  let startPage = currentPage - 1;
  let endPage = currentPage + 1;

  if(startPage < 1){
    startPage = 1;
    endPage = 3;
  }

  if(endPage > totalPages){
    endPage = totalPages;
    startPage = totalPages - 2;
  }

  if(startPage < 1){
    startPage = 1;
  }

  for(let i = startPage; i <= endPage; i++){

    html += `
      <button
        class="${i === currentPage ? 'active' : ''}"
        onclick="goToPage(${i})"
      >
        ${i}
      </button>
    `;

  }

  html += `
    <button onclick="nextPage()">Next</button>
  `;

  document.getElementById("pagination").innerHTML = html;

}

function goToPage(page){

  currentPage = page;

  renderPage(currentPage);
  renderPagination();

}

function nextPage(){

  const totalPages = Math.ceil(allData.length / ROWS_PER_PAGE);

  currentPage++;

  if(currentPage > totalPages){
    currentPage = 1;
  }

  renderPage(currentPage);
  renderPagination();

}

function prevPage(){

  const totalPages = Math.ceil(allData.length / ROWS_PER_PAGE);

  currentPage--;

  if(currentPage < 1){
    currentPage = totalPages;
  }

  renderPage(currentPage);
  renderPagination();

}

function pauseSlide(){

  clearInterval(autoSlide);

}

function playSlide(){

  clearInterval(autoSlide);

  autoSlide = setInterval(nextPage,10000);

}

async function ambilMediaDariCloudinary() {
  const cloudName = CLOUDINARY_CONFIG.cloudName;
  const tag = CLOUDINARY_CONFIG.tagTarget;
  
  // URL khas Cloudinary untuk menarik senarai fail berdasarkan Tag secara Open/Public
  const url = `https://cloudinary.com{cloudName}/image/list/${tag}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Gagal hubungi Cloudinary");
    const data = await response.json();
    return data.resources; 
  } catch (error) {
    console.error("Ralat sistem API Cloudinary:", error);
    return [];
  }
}


loadData();

setInterval(loadData,3000);

/* auto next page & play pause button */
let autoSlide = setInterval(nextPage,10000);
