// ================= LOGIN =================
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }
});

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  msg.innerText = "Logging in...";

  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);

      msg.style.color = "green";
      msg.innerText = "Login successful";

      // redirect
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);

    } else {
      msg.style.color = "red";
      msg.innerText = data.message;
    }

  } catch (err) {
    msg.innerText = "Server error";
    console.error(err);
  }
}
// ================= REGISTER =================
document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("registerBtn");

  if (registerBtn) {
    registerBtn.addEventListener("click", register);
  }
});

async function register() {
  const name = document.getElementById("name").value; // ✅ ADD THIS
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  msg.innerText = "Registering...";

  try {
    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,   // ✅ IMPORTANT
        email,
        password
      })
    });

    const data = await res.json();

    msg.innerText = data.message;

    if (res.ok) {
      msg.style.color = "green";
    } else {
      msg.style.color = "red";
    }

  } catch (err) {
    msg.innerText = "Server error";
    console.error(err);
  }
}