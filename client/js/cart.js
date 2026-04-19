const BASE_URL = "http://localhost:5000";

function goToProduct(productId) {
  window.location.href = `product-detail.html?id=${productId}`;
}

// ================= LOAD CART =================
function loadCart() {
  const token = localStorage.getItem("token");

  fetch(`${BASE_URL}/cart`, {
    headers: {
      Authorization: "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(data => {

    const container = document.getElementById("cartItems");

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="text-center mt-5">
          <h4>Your cart is empty 🛒</h4>
          <a href="index.html" class="btn btn-primary mt-3">Shop Now</a>
        </div>
      `;

      document.getElementById("total").innerText = 0;

      const btn = document.getElementById("orderBtn");
      if (btn) {
        btn.disabled = true;
        btn.innerText = "Cart is Empty";
      }

      return;
    }

    let output = "";
    let total = 0;

    data.forEach(item => {

      const product = item.product || {};
      const price = product.price || 0;
      const qty = item.quantity || 1;

      total += price * qty;

      // ✅ FIX IMAGE HANDLING
      const imageUrl = product.image
        ? (product.image.startsWith("http") ? product.image : BASE_URL + product.image)
        : "https://picsum.photos/300";

      output += `
        <div class="col-md-4">
          <div class="card mb-4 shadow-sm">

            <img 
              src="${imageUrl}"
              onerror="this.src='https://picsum.photos/300'"
              class="card-img-top"
              height="200"
              style="cursor:pointer"
              onclick="goToProduct('${product._id}')"
            >

            <div class="card-body text-center">
              <h5 style="cursor:pointer" onclick="goToProduct('${product._id}')">${product.name || "No Name"}</h5>

              <p class="text-success fw-bold">
                ₹${price}
              </p>

              <!-- QUANTITY -->
              <div class="d-flex justify-content-center align-items-center mb-2">

                <button onclick="updateQuantity('${product._id}', -1)"
                        class="btn btn-outline-dark btn-sm">−</button>

                <span class="mx-3 fw-bold">${qty}</span>

                <button onclick="updateQuantity('${product._id}', 1)"
                        class="btn btn-outline-dark btn-sm">+</button>

              </div>

              <!-- REMOVE -->
              <button onclick="removeFromCart('${product._id}')"
                      class="btn btn-danger w-100">
                Remove
              </button>

            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = output;
    document.getElementById("total").innerText = total;

  })
  .catch(err => {
    console.error(err);
    alert("Error loading cart");
  });
}

// ================= UPDATE QUANTITY =================
function updateQuantity(productId, change) {
  const token = localStorage.getItem("token");

  fetch(`${BASE_URL}/cart/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ productId, change })
  })
  .then(res => res.json())
  .then(() => loadCart())
  .catch(err => console.error(err));
}

// ================= REMOVE =================
function removeFromCart(productId) {
  const token = localStorage.getItem("token");

  fetch(`${BASE_URL}/cart/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token
    }
  })
  .then(() => {
    loadCart();
  })
  .catch(err => console.error(err));
}

// ================= CHECKOUT =================
function goToCheckout() {
  const token = localStorage.getItem("token");

  fetch(`${BASE_URL}/cart`, {
    headers: {
      Authorization: "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(data => {

    if (!data || data.length === 0) {
      alert("Your cart is empty! Please add products.");
      window.location.href = "index.html";
      return;
    }

    window.location.href = "checkout.html";
  })
  .catch(err => {
    console.error(err);
    alert("Error checking cart");
  });
}

// ================= AUTO LOAD =================
window.onload = loadCart;
