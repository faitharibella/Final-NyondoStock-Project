document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const form = document.getElementById("saleForm");
  const customerNameInput = document.getElementById("customerName");
  const productSelect = document.getElementById("product");
  const quantityInput = document.getElementById("quantity");
  const transportInput = document.getElementById("transport");
  const salesTableBody = document.getElementById("salesTableBody");
  const salesCountSpan = document.getElementById("salesCount");
  const totalEarningsSpan = document.getElementById("totalEarnings");
  const formMessageDiv = document.getElementById("formMessage");
  
  // Data arrays
  let salesRecords = [];
  let totalSalesCount = 0;
  let totalEarningsAmount = 0;
  
  // ========== PRODUCTS DATABASE (10+ products) ==========
  const products = [
    { name: "Hammer", price: 10, stock: 50 },
    { name: "Nails (1kg)", price: 8, stock: 200 },
    { name: "Screwdriver Set", price: 25, stock: 30 },
    { name: "Measuring Tape", price: 5, stock: 45 },
    { name: "Paint Brush (4\")", price: 7, stock: 60 },
    { name: "White Paint (1L)", price: 35, stock: 40 },
    { name: "Plumbing Pipe (1m)", price: 15, stock: 80 },
    { name: "Pipe Wrench", price: 45, stock: 20 },
    { name: "Electrical Wire (10m)", price: 28, stock: 55 },
    { name: "Light Bulb (LED)", price: 12, stock: 100 },
    { name: "Power Socket", price: 18, stock: 35 },
    { name: "Cement (50kg)", price: 120, stock: 25 },
    { name: "Sand (Tonne)", price: 85, stock: 15 },
    { name: "Bricks (Per 100)", price: 200, stock: 10 }
  ];
  
  // Helper function to get product price by name
  function getProductPrice(productName) {
    const product = products.find(p => p.name === productName);
    return product ? product.price : 0;
  }
  
  // Helper function to get product stock by name
  function getProductStock(productName) {
    const product = products.find(p => p.name === productName);
    return product ? product.stock : 0;
  }
  
  // Helper function to update product stock
  function updateProductStock(productName, newStock) {
    const product = products.find(p => p.name === productName);
    if (product) {
      product.stock = newStock;
    }
  }
  
  // Load products into dropdown and table
  function loadProducts() {
    // Load product select dropdown
    productSelect.innerHTML = '<option value="">Select product</option>';
    products.forEach(product => {
      const option = document.createElement("option");
      option.value = product.name;
      option.textContent = `${product.name} - UGX ${product.price}`;
      productSelect.appendChild(option);
    });
    
    // Load product table
    updateProductTable();
  }
  
  // Update product table display
  function updateProductTable() {
    const productTableBody = document.getElementById("productTableBody");
    productTableBody.innerHTML = "";
    
    products.forEach(product => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.stock}</td>
      `;
      productTableBody.appendChild(row);
    });
    
    // Update total products count (sum of all stock)
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    document.getElementById("totalProducts").textContent = totalStock;
  }
  
  // Update dashboard stats
  function updateDashboard() {
    salesCountSpan.textContent = totalSalesCount;
    totalEarningsSpan.textContent = `UGX ${totalEarningsAmount}`;
  }
  
  // Generate receipt HTML
  function generateReceipt(sale) {
    return `
      <div style="font-family: monospace;">
        <h6 class="text-center">🏪 NYONDOSTOCK HARDWARE</h6>
        <p class="text-center small">Sales Receipt</p>
        <hr>
        <p><strong>Customer:</strong> ${sale.customerName}</p>
        <p><strong>Product:</strong> ${sale.product}</p>
        <p><strong>Quantity:</strong> ${sale.quantity}</p>
        <p><strong>Unit Price:</strong> UGX ${sale.unitPrice}</p>
        <p><strong>Subtotal:</strong> UGX ${sale.subtotal}</p>
        <p><strong>Transport Fee:</strong> UGX ${sale.transport}</p>
        <hr>
        <p><strong>TOTAL PAID:</strong> UGX ${sale.total}</p>
        <p><strong>Date:</strong> ${sale.date}</p>
        <p><strong>Receipt No:</strong> #${sale.id}</p>
        <hr>
        <p class="text-center small">Thank you for shopping with us! 🙏</p>
        <p class="text-center small">📍 NyondoStock Hardware - Quality Tools & Materials</p>
      </div>
    `;
  }
  
  // Show receipt modal
  function showReceipt(sale) {
    const receiptContent = document.getElementById("receiptContent");
    receiptContent.innerHTML = generateReceipt(sale);
    const receiptModal = new bootstrap.Modal(document.getElementById("receiptModal"));
    receiptModal.show();
  }
  
  // Add sale to table
  function addSaleToTable(sale) {
    // Clear "no records" message if present
    if (salesTableBody.children.length === 1 && 
        salesTableBody.children[0].innerHTML.includes("No sales recorded")) {
      salesTableBody.innerHTML = "";
    }
    
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${sale.customerName}</td>
      <td>${sale.product}</td>
      <td>${sale.quantity}</td>
      <td>UGX ${sale.transport}</td>
      <td>UGX ${sale.total}</td>
      <td>${sale.date}</td>
      <td>
        <button class="btn btn-sm btn-gold view-receipt-btn" data-index="${salesRecords.length - 1}">
          🧾 Receipt
        </button>
      </td>
    `;
    salesTableBody.appendChild(row);
    
    // Add event listener to receipt button
    const receiptBtn = row.querySelector(".view-receipt-btn");
    receiptBtn.addEventListener("click", function() {
      const index = parseInt(this.getAttribute("data-index"));
      showReceipt(salesRecords[index]);
    });
  }
  
  // Display temporary message
  function showMessage(message, isError = false) {
    formMessageDiv.innerHTML = `<p class="text-${isError ? 'danger' : 'success'}">${message}</p>`;
    setTimeout(() => {
      formMessageDiv.innerHTML = "";
    }, 3000);
  }
  
  // Form submission handler
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    
    const customerName = customerNameInput.value.trim();
    const product = productSelect.value;
    const quantity = parseInt(quantityInput.value);
    const transport = parseInt(transportInput.value) || 0;
    
    // Validation
    if (!customerName) {
      showMessage("❌ Please enter customer name", true);
      return;
    }
    
    if (!product) {
      showMessage("❌ Please select a product", true);
      return;
    }
    
    if (!quantity || quantity <= 0) {
      showMessage("❌ Please enter a valid quantity", true);
      return;
    }
    
    const price = getProductPrice(product);
    const availableStock = getProductStock(product);
    
    if (quantity > availableStock) {
      showMessage(`❌ Only ${availableStock} ${product}(s) available in stock`, true);
      return;
    }
    
    // Calculate amounts
    const subtotal = price * quantity;
    const total = subtotal + transport;
    
    // Reduce stock
    updateProductStock(product, availableStock - quantity);
    
    // Create sale record
    const saleRecord = {
      id: salesRecords.length + 1,
      customerName: customerName,
      product: product,
      quantity: quantity,
      unitPrice: price,
      transport: transport,
      subtotal: subtotal,
      total: total,
      date: new Date().toISOString().split('T')[0]
    };
    
    // Add to records
    salesRecords.push(saleRecord);
    totalSalesCount++;
    totalEarningsAmount += total;
    
    // Update displays
    updateDashboard();
    updateProductTable();
    addSaleToTable(saleRecord);
    
    // Show receipt
    showReceipt(saleRecord);
    
    // Show success message
    showMessage(`✅ Sale recorded: ${quantity} x ${product} for ${customerName} = UGX ${total}`);
    
    // Reset form (keep customer name for convenience, or clear it - your choice)
    productSelect.value = "";
    quantityInput.value = "";
    transportInput.value = "0";
    customerNameInput.value = "";
    
    // Focus on customer name for next sale
    customerNameInput.focus();
  });
  
  // Initial load
  loadProducts();
  updateDashboard();
});