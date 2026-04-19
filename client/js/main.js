fetch("http://localhost:5000/products")
  .then(res => res.json())
  .then(data => {
    let output = "";

    data.forEach(p => {
  output += `
    <div class="col-md-4">
      <div class="card shadow-sm mb-4">

        <img src="${p.image}" 
             class="card-img-top" 
             height="200"
             onerror="this.src='https://via.placeholder.com/200';">

        <div class="card-body">
          <h5 class="card-title">${p.name}</h5>

          <p class="card-text fw-bold text-success">
            ₹${p.price}
          </p>

          <button onclick="addToCart('${p._id}')" 
                  class="btn btn-dark w-100">
            Add to Cart
          </button>
        </div>

      </div>
    </div>
  `;
});

    document.getElementById("products").innerHTML = output;
  });

function addToCart(productId) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  fetch("http://localhost:5000/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      productId,
      quantity: 1
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Cart response:", data);
    alert("Added to cart");
  })
  .catch(err => console.log(err));
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}