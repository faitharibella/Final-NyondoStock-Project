const products = [
  { name: "Hammer", category: "Tools", price: 15000, quantity: 50 },
  { name: "Nails", category: "Hardware", price: 2000, quantity: 200 },
  { name: "Cement", category: "Building Materials", price: 30000, quantity: 8 },
  { name: "Screwdriver", category: "Tools", price: 10000, quantity: 5 },
  { name: "Paint", category: "Building Materials", price: 25000, quantity: 15 },
];

function renderProducts(list) {
  const tableBody = document.getElementById("productList");
  tableBody.innerHTML = "";
  list.forEach((p) => {
    const status =
      p.quantity > 10
        ? '<span class="badge badge-success">In Stock</span>'
        : '<span class="badge badge-warning">Low Stock</span>';
    const row = `
        <tr>
          <td>${p.name}</td>
          <td>${p.category}</td>
          <td>${p.price.toLocaleString()} UGX</td>
          <td>${p.quantity}</td>
          <td>${status}</td>
        </tr>
      `;
    tableBody.innerHTML += row;
  });
}

// Initial render
renderProducts(products);

// Search filter
document.getElementById("searchBar").addEventListener("keyup", function () {
  const query = this.value.toLowerCase();
  const filtered = products.filter((p) => p.name.toLowerCase().includes(query));
  renderProducts(filtered);
});

// Add Product Form
document
  .getElementById("addProductForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("productName").value;
    const category = document.getElementById("category").value;
    const price = parseInt(document.getElementById("price").value);
    const quantity = parseInt(document.getElementById("quantity").value);

    products.push({ name, category, price, quantity });
    renderProducts(products);

    // Reset form and close modal
    document.getElementById("addProductForm").reset();
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addProductModal"),
    );
    modal.hide();
  });
