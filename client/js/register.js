function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  if (!name || !email || !password) {
    msg.innerText = "Please fill all fields";
    return;
  }

  if (!isValidEmail(email)) {
    msg.innerText = "Please enter a valid email address";
    return;
  }

  if (password.length < 6) {
    msg.innerText = "Password must be at least 6 characters";
    return;
  }

  fetch("http://localhost:5000/register", {   // ✅ FIXED URL
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email, password })
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  })
  .then(data => {
    alert("Registered successfully ✅");

    // redirect to login
    window.location.href = "login.html";
  })
  .catch(err => {
    console.error(err);
    alert(err.message);
  });
}
