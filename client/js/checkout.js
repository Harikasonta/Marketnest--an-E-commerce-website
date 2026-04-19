const BASE_URL = "http://localhost:5000";

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function isValidIndianPhone(phone) {
  return /^[6-9]\d{9}$/.test(normalizePhone(phone));
}

function isValidAddress(address) {
  const cleanAddress = String(address || "").trim();
  return cleanAddress.length >= 15 && /[a-zA-Z]/.test(cleanAddress) && /\d/.test(cleanAddress);
}

window.onload = async function () {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/cart`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (res.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      alert("Cart is empty! Redirecting...");
      window.location.href = "index.html";
    }
  } catch (err) {
    console.error(err);
  }
};

async function placeOrder() {
  const token = localStorage.getItem("token");

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const payment = document.getElementById("payment").value;

  if (!name || !phone || !address) {
    alert("Please fill all details");
    return;
  }

  if (!isValidIndianPhone(phone)) {
    alert("Enter a valid 10-digit Indian phone number");
    return;
  }

  if (!isValidAddress(address)) {
    alert("Enter a complete address with house number, street/area, and city");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/orders/place`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        name,
        phone: normalizePhone(phone),
        address,
        paymentMethod: payment
      })
    });

    if (res.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Order failed");
      return;
    }

    if (payment === "UPI") {
      alert("Payment successful via UPI");
    } else {
      alert("Order placed! Pay on delivery");
    }

    window.location.href = "orders.html";
  } catch (err) {
    console.error(err);
    alert("Order failed");
  }
}
