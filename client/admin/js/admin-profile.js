const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

// 🔐 PROTECT
if (!token || !user || !user.isAdmin) {
  alert("Admin access only");
  window.location.href = "../login.html";
}

// 👤 SET USER DATA
document.getElementById("name").innerText = user.name;
document.getElementById("email").innerText = user.email;
document.getElementById("adminName").innerText = "👤 " + user.name;

// AVATAR (first letter)
document.getElementById("avatar").innerText = user.name.charAt(0).toUpperCase();


// ================= LOAD STATS =================
function loadStats() {

  fetch("http://localhost:5000/orders/admin/all", {
    headers: {
      Authorization: "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(data => {

    document.getElementById("totalOrders").innerText = data.length;

    let revenue = 0;
    data.forEach(o => revenue += o.total);

    document.getElementById("totalRevenue").innerText = "₹" + revenue;

  });
}


// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "../login.html";
}


// ================= CHANGE PASSWORD =================
function changePassword() {

  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;

  if (!oldPassword || !newPassword) {
    alert("Fill all fields");
    return;
  }

  // ⚠️ Backend not implemented yet
  alert("Password change feature coming soon 🚀");
}


// INIT
loadStats();