function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function login() {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();
  const btn = document.getElementById("loginBtn");
  const msg = document.getElementById("msg");

  if (!email || !password) {
    msg.innerText = "Please fill all fields";
    return;
  }

  if (!isValidEmail(email)) {
    msg.innerText = "Please enter a valid email address";
    return;
  }

  // 🔄 Loading state
  btn.innerText = "Logging in...";
  btn.disabled = true;

  fetch("http://localhost:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  })
  .then(data => {

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  // ✅ CHECK ADMIN
  if (data.user && data.user.isAdmin) {
    window.location.href = "admin/dashboard.html";
  } else {
    window.location.href = "index.html";
  }
})
  .catch(err => {
    document.getElementById("msg").innerText = err.message;
  })
  .finally(() => {
    btn.innerText = "Login";
    btn.disabled = false;
  });
}
