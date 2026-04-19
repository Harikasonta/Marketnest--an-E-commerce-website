const BASE_URL = "http://localhost:5000";
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user || !user.isAdmin) {
  alert("Admin access only");
  window.location.href = "../login.html";
}

document.getElementById("adminName").innerText = user.name || "Admin";

let editingId = null;
let productsCache = [];

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function safeJSON(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Invalid JSON response:", text);
    throw new Error("Server returned a non-JSON response");
  }
}

function imageUrl(product) {
  if (!product.image) return "https://via.placeholder.com/300";
  return product.image.startsWith("http") ? product.image : BASE_URL + product.image;
}

function money(value) {
  return `Rs.${Number(value || 0).toLocaleString("en-IN")}`;
}

async function loadProducts() {
  try {
    const res = await fetch(`${BASE_URL}/products`);
    const data = await safeJSON(res);

    if (!res.ok) {
      throw new Error(data.message || "Failed to load products");
    }

    productsCache = Array.isArray(data) ? data : [];
    renderProducts(productsCache);
  } catch (err) {
    console.error("LOAD ERROR:", err);
    document.getElementById("productList").innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">Failed to load products.</div>
      </div>
    `;
  }
}

function renderProducts(products) {
  const container = document.getElementById("productList");
  document.getElementById("productCount").innerText = `${products.length} product${products.length === 1 ? "" : "s"}`;

  if (!products.length) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-light border">No products added yet.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map((product) => {
    const description = product.description
      ? escapeHtml(product.description)
      : "No description added yet.";
    const stockClass = Number(product.stock) <= 3 ? "stock-pill low" : "stock-pill";

    return `
      <div class="col-sm-6 col-lg-4">
        <article class="product-card">
          <img src="${imageUrl(product)}"
               onerror="this.src='https://via.placeholder.com/300'"
               alt="${escapeHtml(product.name)}">

          <div class="p-3">
            <div class="d-flex justify-content-between gap-2 align-items-start mb-2">
              <h5 class="mb-0">${escapeHtml(product.name)}</h5>
              <span class="${stockClass}">Stock: ${Number(product.stock || 0)}</span>
            </div>

            <p class="text-success fw-bold mb-1">${money(product.price)}</p>
            <p class="text-muted text-capitalize mb-2">${escapeHtml(product.category)}</p>
            <p class="description-preview">${description}</p>

            <div class="d-flex gap-2">
              <button type="button" onclick="editProduct('${product._id}')" class="btn btn-warning flex-fill">
                Edit
              </button>
              <button type="button" onclick="deleteProduct('${product._id}')" class="btn btn-danger flex-fill">
                Delete
              </button>
            </div>
          </div>
        </article>
      </div>
    `;
  }).join("");
}

function getFormValues() {
  return {
    name: document.getElementById("name").value.trim(),
    price: document.getElementById("price").value,
    category: document.getElementById("category").value.trim(),
    stock: document.getElementById("stock").value,
    description: document.getElementById("description").value.trim(),
    imageFile: document.getElementById("image").files[0]
  };
}

function validateProduct(values) {
  if (!values.name || !values.price || !values.category || values.stock === "") {
    alert("Please fill product name, price, category, and stock.");
    return false;
  }

  if (Number(values.price) < 0 || Number(values.stock) < 0) {
    alert("Price and stock cannot be negative.");
    return false;
  }

  return true;
}

function buildFormData(values) {
  const formData = new FormData();
  formData.append("name", values.name);
  formData.append("price", values.price);
  formData.append("category", values.category);
  formData.append("stock", values.stock);
  formData.append("description", values.description);

  if (values.imageFile) {
    formData.append("image", values.imageFile);
  }

  return formData;
}

async function saveProduct() {
  const values = getFormValues();
  if (!validateProduct(values)) return;

  const url = editingId
    ? `${BASE_URL}/products/${editingId}`
    : `${BASE_URL}/products`;

  const method = editingId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: "Bearer " + token
      },
      body: buildFormData(values)
    });

    const data = await safeJSON(res);

    if (!res.ok) {
      throw new Error(data.message || "Product save failed");
    }

    alert(editingId ? "Product updated" : "Product added");
    clearForm();
    loadProducts();
  } catch (err) {
    console.error("SAVE ERROR:", err);
    alert(err.message || "Product save failed");
  }
}

function editProduct(id) {
  const product = productsCache.find((item) => item._id === id);
  if (!product) return;

  editingId = id;

  document.getElementById("name").value = product.name || "";
  document.getElementById("price").value = product.price || "";
  document.getElementById("category").value = product.category || "";
  document.getElementById("stock").value = product.stock ?? "";
  document.getElementById("description").value = product.description || "";

  document.getElementById("formTitle").innerText = "Edit Product";
  document.getElementById("submitBtn").innerText = "Update Product";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await safeJSON(res);

    if (!res.ok) {
      throw new Error(data.message || "Delete failed");
    }

    loadProducts();
  } catch (err) {
    console.error("DELETE ERROR:", err);
    alert(err.message || "Delete failed");
  }
}

function clearForm() {
  editingId = null;

  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("category").value = "";
  document.getElementById("stock").value = "";
  document.getElementById("description").value = "";
  document.getElementById("image").value = "";
  document.getElementById("formTitle").innerText = "Add Product";
  document.getElementById("submitBtn").innerText = "Add Product";
}

loadProducts();
