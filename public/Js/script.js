// 🔍 SEARCH
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const productTable = document.getElementById("productTable");
  //SEARCH FUNCTION
  searchInput.addEventListener("keyup", function () {
    let filter = searchInput.value.toLowerCase();
    let rows = productTable.getElementsByTagName("tr");

    for (let i = 0; i < rows.lenghth; i++) {
      let text = rows[i].textContent.toLowerCase();

      if (text.includes(filter)) {
        rows[i].style.display = "";
      } else {
        rows[i].style.display = "";
      }
    }
  });
});
const searchBtn = document.addEventListener("searchBtn");

searchBtn.addEventListener("click", function () {
  let filter = searchInput.value.toLowerCase();
  let rows = productTable.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    let text = rows[i].textContent.toLowerCase();

    rows[i].style.display = text.includes(filter) ? "" : "none";
  }
});

searchInput.addEventListener("keyup", function () {
  searchBtn.click();
});

// ➕ ADD PRODUCT
document
  .getElementById("addProductForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    let name = productName.value;
    let category = categoryInput.value;
    let price = priceInput.value;
    let quantity = quantityInput.value;

    let status = quantity > 10 ? "In Stock" : "Low Stock";

    let row = `
    <tr>
      <td>${name}</td>
      <td>${category}</td>
      <td>UGX${price}</td>
      <td>${quantity}</td>
      <td>${status}</td>
      <td>
        <button class="btn btn-sm btn-gold" onclick="editRow(this)">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteRow(this)">Delete</button>
      </td>
    </tr>
  `;

    productTable.innerHTML += row;

    this.reset();

    let modal = bootstrap.Modal.getInstance(
      document.getElementById("addProductModal"),
    );
    modal.hide();
  });

// 🗑️ DELETE
function deleteRow(btn) {
  btn.closest("tr").remove();
}

// ✏️ EDIT
function editRow(btn) {
  let row = btn.closest("tr").children;

  productName.value = row[0].innerText;
  categoryInput.value = row[1].innerText;
  priceInput.value = row[2].innerText.replace("UGX", "").trim;
  quantityInput.value = row[3].innerText;

  new bootstrap.Modal(document.getElementById("addProductModal")).show();

  btn.closest("tr").remove();
}

// FIX INPUT REFERENCES
const productName = document.getElementById("productName");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const quantityInput = document.getElementById("quantity");
const productTable = document.getElementById("productTable");
