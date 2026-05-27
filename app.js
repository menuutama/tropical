async function saveData(){

  const data = {
    id: document.getElementById("id").value,
    name: document.getElementById("name").value,
    category: document.getElementById("category").value,
    status: document.getElementById("status").value
  };

  await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify(data)
  });

  alert("Data Saved");

  loadData();
}

async function loadData(){

  const res = await fetch(API_URL);

  const data = await res.json();

  let html = "";

  for(let i=1;i<data.length;i++){

    html += `
      <tr>
        <td>${data[i][0]}</td>
        <td>${data[i][1]}</td>
        <td>${data[i][2]}</td>
        <td>${data[i][3]}</td>
      </tr>
    `;
  }

  document.querySelector("#dataTable tbody").innerHTML = html;
}

function searchData(){

  let input = document.getElementById("search").value.toLowerCase();

  let rows = document.querySelectorAll("#dataTable tbody tr");

  rows.forEach(row=>{

    let text = row.innerText.toLowerCase();

    row.style.display = text.includes(input)
      ? ""
      : "none";
  });
}

loadData();

async function addItem(){

  const luckyNo = document
    .getElementById("luckyNo")
    .value
    .trim();

  if(!luckyNo){
    alert("Please enter lucky number");
    return;
  }

  const response = await fetch(
    API_URL + "?action=addLuckyNo",
    {
      method:"POST",
      body:JSON.stringify({
        luckyNo:luckyNo
      })
    }
  );

  const result = await response.json();

  if(result.status == "duplicate"){

    alert("Lucky Number Already Exists");

  }else{

    alert("Lucky Number Added");

    document.getElementById("luckyNo").value = "";

    loadData();
  }
}