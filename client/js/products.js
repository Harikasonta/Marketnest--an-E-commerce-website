const BASE_URL = "http://localhost:5000";

let allProducts = [];

function goToProduct(productId) {
  window.location.href = `product-detail.html?id=${productId}`;
}

// ================= LOAD PRODUCTS =================
function loadProducts() {
  fetch(`${BASE_URL}/products`)
    .then(res => res.json())
    .then(data => {
      allProducts = data;
      loadCategories(allProducts);
      displayProducts(allProducts);
    })
    .catch(err => console.error("LOAD ERROR:", err));
}

// ================= LOAD CATEGORIES =================
function loadCategories(products) {
  const categorySet = new Set(products.map(p => p.category));
  const categoryFilter = document.getElementById("categoryFilter");

  categoryFilter.innerHTML = `<option value="">All</option>`;

  categorySet.forEach(cat => {
    categoryFilter.innerHTML += `
      <option value="${cat}">${cat}</option>
    `;
  });
}

// ================= DISPLAY PRODUCTS =================
function displayProducts(products) {
  const container = document.getElementById("productList");

  if (products.length === 0) {
    container.innerHTML = `<h5>No products found</h5>`;
    return;
  }

  let output = "";

  products.forEach(p => {
    output += `
      <div class="col-md-4">
        <div class="card mb-4 shadow-sm">

          <img 
            src="${p.image ? BASE_URL + p.image : 'https://via.placeholder.com/300'}"
            class="card-img-top"
            height="200"
            style="cursor:pointer"
            onclick="goToProduct('${p._id}')"
          >

          <div class="card-body text-center">
            <h5 style="cursor:pointer" onclick="goToProduct('${p._id}')">${p.name}</h5>
            <p class="text-success fw-bold">₹${p.price}</p>

            <button onclick="addToCart('${p._id}')"
                    class="btn btn-primary w-100">
              Add to Cart
            </button>
          </div>

        </div>
      </div>
    `;
  });

  container.innerHTML = output;
}

// ================= FILTER =================
function applyFilters() {

  let filtered = [...allProducts];

  // SEARCH
  const search = document.getElementById("searchInput").value.toLowerCase();
  if (search) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search)
    );
  }

  // CATEGORY
  const category = document.getElementById("categoryFilter").value;
  if (category) {
    filtered = filtered.filter(p =>
      p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // PRICE
  const maxPrice = document.getElementById("priceRange").value;
  filtered = filtered.filter(p => p.price <= maxPrice);

  // SORT
  const sort = document.getElementById("sortFilter").value;
  if (sort === "low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "high") {
    filtered.sort((a, b) => b.price - a.price);
  }

  displayProducts(filtered);
}

// ================= ADD TO CART =================
function addToCart(productId) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Login first");
    window.location.href = "login.html";
    return;
  }

  fetch(`${BASE_URL}/cart/add`, {
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
  .then(() => {
    alert("Added to cart 🛒");
  })
  .catch(err => console.error("CART ERROR:", err));
}

// ================= EVENTS =================
document.addEventListener("DOMContentLoaded", () => {

  loadProducts();

  document.getElementById("searchInput")
    .addEventListener("input", applyFilters);

  document.getElementById("categoryFilter")
    .addEventListener("change", applyFilters);

  document.getElementById("priceRange")
    .addEventListener("input", () => {
      document.getElementById("priceValue").innerText =
        document.getElementById("priceRange").value;

      applyFilters();
    });

  document.getElementById("sortFilter")
    .addEventListener("change", applyFilters);
});
