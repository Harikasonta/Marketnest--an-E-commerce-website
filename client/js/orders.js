const token = localStorage.getItem("token");

// 🔒 Safety check
if (!token) {
  window.location.href = "login.html";
}

// 🚀 Fetch orders
fetch("http://localhost:5000/orders", {
  headers: {
    "Authorization": "Bearer " + token
  }
})
.then(res => res.json())
.then(data => {

  console.log("Orders:", data);

  // ❌ Error case
  if (!Array.isArray(data)) {
    document.getElementById("orders").innerHTML = `
      <p class="text-danger">${data.message || "Error loading orders"}</p>
    `;
    return;
  }

  // 📭 Empty orders
  if (data.length === 0) {
    document.getElementById("orders").innerHTML = `
      <p class="text-muted">No orders found</p>
    `;
    return;
  }

  let output = "";

  data.forEach(order => {

    let itemsHTML = "";

    // 🛒 Show products inside order
    order.items.forEach(item => {
      itemsHTML += `
        <li>
          ${item.product?.name || "Product"} 
          (Qty: ${item.quantity})
        </li>
      `;
    });

    output += `
      <div class="card mb-3 shadow-sm">
        <div class="card-body">

          <h5 class="mb-2">Order ID: ${order._id}</h5>

          <ul>
            ${itemsHTML}
          </ul>

          <p class="fw-bold text-success">
            Total: ₹${order.total}
          </p>

          <p>
            Status: 
            <span class="badge bg-primary">
              ${order.status}
            </span>
          </p>

        </div>
      </div>
    `;
  });

  document.getElementById("orders").innerHTML = output;

})
.catch(err => {
  console.log("ORDER ERROR:", err);

  document.getElementById("orders").innerHTML = `
    <p class="text-danger">Error loading orders</p>
  `;
});