const token = localStorage.getItem("token");

// 🔐 PROTECT PAGE
if (!token) {
  alert("Login first");
  window.location.href = "login.html";
}

// 👤 LOAD USER INFO
const user = JSON.parse(localStorage.getItem("user"));

if (user) {
  document.getElementById("userName").innerText = user.name;
  document.getElementById("userEmail").innerText = user.email;
}

// 🔴 LOGOUT FUNCTION (NEW)
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  alert("Logged out successfully");
  window.location.href = "login.html";
}

// 📦 LOAD ORDERS
function loadOrders() {

  const container = document.getElementById("orders");

  // 🔄 Loading state
  container.innerHTML = `<p>Loading orders...</p>`;

  fetch("http://localhost:5000/orders", {
    headers: {
      Authorization: "Bearer " + token
    }
  })
  .then(res => {

    // 🔴 Handle unauthorized
    if (res.status === 401) {
      alert("Session expired, please login again");
      logout();
      return;
    }

    return res.json();
  })
  .then(data => {

    if (!data) return;

    if (data.length === 0) {
      container.innerHTML = `
        <div class="text-center mt-3">
          <h5>No orders yet 📦</h5>
          <a href="products.html" class="btn btn-primary mt-2">
            Start Shopping
          </a>
        </div>
      `;
      return;
    }

    let output = "";

    data.forEach(order => {

      let itemsHTML = "";

      order.items.forEach(item => {
        itemsHTML += `
          <li>${item.product.name} × ${item.quantity}</li>
        `;
      });

      output += `
        <div class="card p-3 mb-3 shadow-sm">

          <div class="d-flex justify-content-between">
            <h6>Order ID: ${order._id}</h6>
            <span class="badge bg-success">${order.status}</span>
          </div>

          <p class="mt-2"><strong>Total:</strong> ₹${order.total}</p>

          <ul class="mb-0">
            ${itemsHTML}
          </ul>

        </div>
      `;
    });

    container.innerHTML = output;
  })
  .catch(err => {
    console.error(err);
    container.innerHTML = `<p class="text-danger">Error loading orders</p>`;
  });
}

loadOrders();