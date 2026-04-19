const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

// 🔐 PROTECT ADMIN
if (!token || !user || !user.isAdmin) {
  alert("Admin access only");
  window.location.href = "../login.html";
}

// 👤 SET NAME
document.getElementById("adminName").innerText = "👤 " + user.name;


// ================= LOAD DASHBOARD =================
async function loadDashboard() {
  try {

    // PRODUCTS
    try {
      const productRes = await fetch("http://localhost:5000/products");
      const products = await productRes.json();
      document.getElementById("totalProducts").innerText = products.length;
    } catch (err) {
      console.error("Products error:", err);
      document.getElementById("totalProducts").innerText = "Error";
    }

    // ================= ORDERS =================
// ================= ORDERS =================
try {
  const orderRes = await fetch("http://localhost:5000/orders/admin/all", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const orders = await orderRes.json();

  document.getElementById("totalOrders").innerText = orders.length;

  let totalRevenue = 0;
  let codRevenue = 0;
  let upiRevenue = 0;

  let monthlyData = {};
  let productStats = {};

  const deliveredOrders = orders.filter(o => o.status === "Delivered");

  deliveredOrders.forEach(order => {

    const amount = Number(order.total) || 0;
    totalRevenue += amount;

    // 💰 SPLIT REVENUE
    if (order.paymentMethod === "COD") {
      codRevenue += amount;
    } else {
      upiRevenue += amount;
    }

    // 📊 MONTHLY DATA
    const month = new Date(order.createdAt).toLocaleString("default", {
      month: "short"
    });

    if (!monthlyData[month]) {
      monthlyData[month] = 0;
    }
    monthlyData[month] += amount;

    // 🏆 TOP PRODUCTS
    order.items.forEach(item => {
      const name = item.product?.name || "Unknown";

      if (!productStats[name]) {
        productStats[name] = 0;
      }

      productStats[name] += item.quantity;
    });

  });

  // DISPLAY
  document.getElementById("totalRevenue").innerText = "₹" + totalRevenue;
  document.getElementById("codRevenue").innerText = "₹" + codRevenue;
  document.getElementById("upiRevenue").innerText = "₹" + upiRevenue;

  drawMonthlyChart(monthlyData);
  showTopProducts(productStats);

} catch (err) {
  console.error(err);
}
  } catch (err) {
    console.error("Dashboard error:", err);
    alert("Error loading dashboard");
  }
}


// ================= CHART =================
function drawChart(data) {

  const ctx = document.getElementById("chart");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((_, i) => "Order " + (i + 1)),
      datasets: [{
        label: "Revenue",
        data: data,
        borderWidth: 2,
        fill: false
      }]
    },
    options: {
      responsive: true
    }
  });
}

function drawMonthlyChart(data) {
  const ctx = document.getElementById("chart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: "Monthly Revenue",
        data: Object.values(data),
        borderWidth: 1
      }]
    }
  });
}
function showTopProducts(stats) {
  const list = document.getElementById("topProducts");

  const sorted = Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  list.innerHTML = sorted.map(([name, qty]) => `
    <li class="list-group-item d-flex justify-content-between">
      ${name}
      <span class="badge bg-success">${qty}</span>
    </li>
  `).join("");
}
// INIT
loadDashboard();