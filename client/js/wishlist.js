const BASE_URL = "http://localhost:5000";

// ================= HELPERS =================
function getToken() {
  return localStorage.getItem("token");
}

function goToProduct(productId) {
  window.location.href = `product-detail.html?id=${productId}`;
}

// Try multiple endpoints (covers common backend variants)
async function tryDeleteWishlist(id, token) {
  const endpoints = [
    `${BASE_URL}/wishlist/${id}`,           // DELETE /wishlist/:id
    `${BASE_URL}/wishlist/remove/${id}`,    // DELETE /wishlist/remove/:id
    `${BASE_URL}/wishlist/remove`           // POST /wishlist/remove { productId }
  ];

  // 1) Try DELETE endpoints
  for (let url of endpoints.slice(0, 2)) {
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });
    if (res.ok) return true;
  }

  // 2) Try POST remove endpoint
  const res = await fetch(endpoints[2], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ productId: id })
  });

  return res.ok;
}

// Safe JSON parser (avoids “Unexpected token <”)
async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error("Non-JSON response:", text);
    throw new Error("Server did not return JSON");
  }
}

// ================= LOAD WISHLIST =================
async function loadWishlist() {
  const token = getToken();

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/wishlist`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) throw new Error("Failed to fetch wishlist");

    const data = await safeJson(res);

    const container = document.getElementById("wishlist");

    if (!data || data.length === 0) {
      container.innerHTML = `<p class="text-muted">No items in wishlist</p>`;
      return;
    }

    let output = "";

    data.forEach(p => {
      const imageUrl = p.image
        ? (p.image.startsWith("http") ? p.image : BASE_URL + p.image)
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
              onclick="goToProduct('${p._id}')"
            >

            <div class="card-body text-center">
              <h5 style="cursor:pointer" onclick="goToProduct('${p._id}')">${p.name}</h5>
              <p class="text-success fw-bold">₹${p.price}</p>

              <button onclick="moveToCart('${p._id}')"
                      class="btn btn-success w-100 mb-2">
                Move to Cart
              </button>

              <button onclick="removeFromWishlist('${p._id}')"
                      class="btn btn-danger w-100">
                Remove
              </button>

            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = output;

  } catch (err) {
    console.error(err);
    alert("Error loading wishlist");
  }
}

// ================= REMOVE =================
// ================= REMOVE (FINAL FIX) =================
async function removeFromWishlist(id) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/wishlist/${id}`, {
      method: "POST",   // ✅ IMPORTANT CHANGE
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) {
      throw new Error("Failed to remove");
    }

    loadWishlist();

  } catch (err) {
    console.error(err);
    alert("Remove failed ❌");
  }
}

// ================= MOVE TO CART =================
async function moveToCart(productId) {
  const token = localStorage.getItem("token");

  try {
    // Add to cart
    await fetch(`${BASE_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        productId,
        quantity: 1
      })
    });

    // Remove from wishlist (POST toggle)
    await fetch(`${BASE_URL}/wishlist/${productId}`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token
      }
    });

    loadWishlist();

  } catch (err) {
    console.error(err);
    alert("Error moving to cart");
  }
}

// ================= AUTO LOAD =================
window.onload = loadWishlist;
