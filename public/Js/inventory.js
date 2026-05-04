document
  .getElementById("addProductForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("productName").value;
    const category = document.getElementById("category").value;
    const price = document.getElementById("price").value;
    const quantity = document.getElementById("quantity").value;
    const status = quantity > 10 ? "In Stock" : "Low Stock";

    const table = document.getElementById("productTable");
    const newRow = table.insertRow();

    newRow.innerHTML = `
      <td>${name}</td>
      <td>${category}</td>
      <td>UGX${price}</td>
      <td>${quantity}</td>
      <td>${status}</td>
      <td>
        <button class="btn btn-sm btn-gold">Edit</button>
        <button class="btn btn-sm btn-danger">Delete</button>
      </td>
    `;

    // Reset form and close modal
    document.getElementById("addProductForm").reset();
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addProductModal"),
    );
    modal.hide();
  });
