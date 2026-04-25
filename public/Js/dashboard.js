// SALES FORM
// const form = document.querySelector("form");
// const productSelect = document.getElementById("product");
// const quantityInput = document.getElementById("quantity");

// form.addEventListener("submit", function (e) {
//   e.preventDefault();

//   const product = productSelect.value;
//   const quantity = Number(quantityInput.value);

//   if (!product || quantity <= 0) {
//     alert("Please enter valid sale details");
//     return;
//   }

//   alert(`Sale recorded: ${product} x ${quantity} `);

//   form.reset();
// });

document.addEventListener("DOMContentLoaded", function () {

  const form = document.querySelector("form");
  const productSelect = document.getElementById("product");
  const quantityInput = document.getElementById("quantity");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const product = productSelect.value;
    const quantity = quantityInput.value;

    console.log("PRODUCT:", product);
    console.log("QUANTITY:", quantity);

    //  show it ON PAGE (not alert)
    const message = document.createElement("p");
    message.textContent = `✔ Recorded: ${product} x ${quantity}`;
    message.style.color = "gold";

    form.appendChild(message);

    form.reset();
  });

});