const productSelect = document.querySelector('select[name="productId"]');
const quantityInput = document.querySelector('input[name="quantity"]');
const transportInput = document.querySelector('input[name="transportFee"]');
const amountPaidInput = document.querySelector('input[name="amountPaid"]');
const unitPriceField = document.getElementById("unitPrice");
const totalAmountField = document.getElementById("totalAmount");
const changeField = document.getElementById("change");

function calculateTotal() {
  // Get the selected option
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  
  // Get price from data-price attribute (not from hardcoded map)
  let unitPrice = 0;
  if (selectedOption && selectedOption.dataset.price) {
    unitPrice = parseInt(selectedOption.dataset.price);
  }
  
  unitPriceField.value = unitPrice;
  
  const quantity = parseInt(quantityInput.value) || 0;
  const transport = parseInt(transportInput.value) || 0;
  
  const subtotal = unitPrice * quantity;
  const total = subtotal + transport;
  totalAmountField.value = total;
  
  const amountPaid = parseInt(amountPaidInput.value) || 0;
  const change = amountPaid - total;
  changeField.value = change >= 0 ? change : 0;
}

productSelect.addEventListener("change", calculateTotal);
quantityInput.addEventListener("input", calculateTotal);
transportInput.addEventListener("input", calculateTotal);
amountPaidInput.addEventListener("input", calculateTotal);