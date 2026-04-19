const BASE_URL = "http://localhost:5000";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

function getToken() {
  return localStorage.getItem("token");
}

function imageUrl(product) {
  if (!product.image) return "https://via.placeholder.com/500";
  return product.image.startsWith("http") ? product.image : BASE_URL + product.image;
}

function money(value) {
  return `Rs.${Number(value || 0).toLocaleString("en-IN")}`;
}

function goToProduct(id) {
  window.location.href = `product-detail.html?id=${id}`;
}

async function addToCart(productId) {
  const token = getToken();

  if (!token) {
    alert("Login first");
    window.location.href = "login.html";
    return;
  }

  const res = await fetch(`${BASE_URL}/cart/add`, {
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

  const data = await res.json();
  if (!res.ok) {
    alert(data.message || "Cart error");
    return;
  }

  alert("Added to cart");
}

async function toggleWishlist(productId) {
  const token = getToken();

  if (!token) {
    alert("Login first");
    window.location.href = "login.html";
    return;
  }

  const res = await fetch(`${BASE_URL}/wishlist/${productId}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const data = await res.json();
  alert(data.message || "Wishlist updated");
}

function renderProduct(product) {
  const stockText = product.stock > 0
    ? `<span class="badge bg-success">In Stock: ${product.stock}</span>`
    : `<span class="badge bg-danger">Out of Stock</span>`;

  document.getElementById("productDetail").innerHTML = `
    <div class="detail-card">
      <div class="row g-0">
        <div class="col-md-5">
          <img src="${imageUrl(product)}"
               onerror="this.src='https://via.placeholder.com/500'"
               class="product-image"
               alt="${product.name}">
        </div>

        <div class="col-md-7">
          <div class="p-4 p-lg-5">
            <p class="text-uppercase text-muted fw-bold mb-2">${product.category || "Product"}</p>
            <h1 class="mb-3">${product.name}</h1>
            <h2 class="text-success mb-3">${money(product.price)}</h2>
            <div class="mb-4">${stockText}</div>

            <h5>Description</h5>
            <p class="text-muted">
              ${product.description || "This product is available in our store. Add it to your cart or wishlist to continue shopping."}
            </p>

            <div class="d-flex flex-wrap gap-3 mt-4">
              <button onclick="addToCart('${product._id}')" class="btn btn-dark px-4">
                Add to Cart
              </button>
              <button onclick="toggleWishlist('${product._id}')" class="btn btn-outline-danger px-4">
                Add to Wishlist
              </button>
              <button onclick="window.location.href='ai/ai.html'" class="btn btn-info px-4 fw-bold">
                Ask AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSimilarProducts(products) {
  const container = document.getElementById("similarProducts");

  if (!products.length) {
    container.innerHTML = `<p class="text-muted">No similar products found.</p>`;
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="col-sm-6 col-md-3">
      <div class="card similar-card" onclick="goToProduct('${product._id}')">
        <img src="${imageUrl(product)}"
             onerror="this.src='https://via.placeholder.com/300'"
             class="card-img-top"
             alt="${product.name}">
        <div class="card-body">
          <h6 class="card-title">${product.name}</h6>
          <p class="text-success fw-bold mb-1">${money(product.price)}</p>
          <small class="text-muted">${product.category || "Product"}</small>
        </div>
      </div>
    </div>
  `).join("");
}

async function loadProductDetail() {
  if (!productId) {
    document.getElementById("productDetail").innerHTML = `
      <div class="alert alert-danger">Product id is missing.</div>
    `;
    return;
  }

  try {
    const productRes = await fetch(`${BASE_URL}/products/${productId}`);
    const product = await productRes.json();

    if (!productRes.ok) {
      throw new Error(product.message || "Product not found");
    }

    renderProduct(product);

    const similarRes = await fetch(`${BASE_URL}/products/similar/${productId}`);
    const similarProducts = await similarRes.json();

    renderSimilarProducts(Array.isArray(similarProducts) ? similarProducts : []);
  } catch (err) {
    document.getElementById("productDetail").innerHTML = `
      <div class="alert alert-danger">${err.message || "Unable to load product"}</div>
    `;
  }
}

loadProductDetail();
