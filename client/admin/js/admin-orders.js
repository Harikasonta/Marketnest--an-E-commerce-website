const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user || !user.isAdmin) {
  alert("Admin access only");
  window.location.href = "../login.html";
}

document.getElementById("adminName").innerText = "👤 " + user.name;

let allOrders = [];
let currentPage = 1;
const limit = 5;


// ================= LOAD ORDERS =================
function loadOrders() {
  fetch("http://localhost:5000/orders/admin/all", {
    headers: {
      Authorization: "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(data => {
    allOrders = data;
    applyFilters();
  });
}


// ================= FILTER =================
function applyFilters() {

  let filtered = [...allOrders];

  const search = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;

  if (search) {
    filtered = filtered.filter(o =>
      o.user && o.user.name.toLowerCase().includes(search)
    );
  }

  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }

  displayOrders(filtered);
}


// ================= DISPLAY =================
function displayOrders(orders) {

  const container = document.getElementById("ordersList");

  const start = (currentPage - 1) * limit;
  const paginated = orders.slice(start, start + limit);

  if (paginated.length === 0) {
    container.innerHTML = `<p>No orders found</p>`;
    return;
  }

  let output = "";

  paginated.forEach(order => {

    let itemsHTML = "";

    order.items.forEach(item => {
      const name = item.product ? item.product.name : "Product removed";

      itemsHTML += `<li>${name} × ${item.quantity}</li>`;
    });

    const userName = order.user ? order.user.name : "Unknown";
    const userEmail = order.user ? order.user.email : "N/A";

    // 🎨 STATUS COLOR
    let statusClass = "";
    if (order.status === "Placed") statusClass = "placed";
    if (order.status === "Shipped") statusClass = "shipped";
    if (order.status === "Delivered") statusClass = "delivered";

    output += `
      <div class="card p-3 mb-3 shadow-sm">

        <div class="d-flex justify-content-between align-items-center">

          <h6>${order._id}</h6>

          <div class="d-flex gap-2 align-items-center">

            <span class="status-badge ${statusClass}">
              ${order.status}
            </span>

            <select onchange="updateStatus('${order._id}', this.value)" class="form-select">
              <option value="Placed" ${order.status === "Placed" ? "selected" : ""}>Placed</option>
              <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
              <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
            </select>

          </div>

        </div>

        <p><strong>User:</strong> ${userName} (${userEmail})</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <p><strong>Address:</strong> ${order.address || "N/A"}</p>

        <ul>${itemsHTML}</ul>

      </div>
    `;
  });

  container.innerHTML = output;
}


// ================= PAGINATION =================
function nextPage() {
  currentPage++;
  applyFilters();
}

function prevPage() {
  if (currentPage > 1) currentPage--;
  applyFilters();
}


// ================= UPDATE STATUS =================
function updateStatus(orderId, status) {

  fetch(`http://localhost:5000/orders/admin/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ status })
  })
  .then(() => {
    loadOrders();
  });
}


// ================= EVENTS =================
document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("statusFilter").addEventListener("change", applyFilters);


// INIT
loadOrders();