const AI_API_URL = "http://127.0.0.1:8000/ai/query";
const BASE_URL = "http://localhost:5000";

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const inputWrapper = document.getElementById("inputWrapper");

let lastProducts = [];
let firstMessageSent = false;

const numberWords = {
  first: 0,
  one: 0,
  second: 1,
  two: 1,
  third: 2,
  three: 2,
  fourth: 3,
  four: 3,
  fifth: 4,
  five: 4
};

function getToken() {
  return localStorage.getItem("token");
}

function requireLogin() {
  if (getToken()) return true;

  addMessage("Please login first so I can update your cart, wishlist, or order.", "bot");
  addQuickAction("Login", "../login.html");
  return false;
}

function moveInputToBottom() {
  if (firstMessageSent) return;

  inputWrapper.classList.remove("center-input");
  inputWrapper.classList.add("bottom-input");
  firstMessageSent = true;
}

function addMessage(text, type = "bot") {
  const msg = document.createElement("div");
  msg.classList.add("message", type);
  msg.innerText = text;
  chatBox.appendChild(msg);
  scrollChat();
}

function addQuickAction(label, href) {
  const action = document.createElement("a");
  action.className = "quick-link";
  action.href = href;
  action.innerText = label;
  chatBox.appendChild(action);
  scrollChat();
}

function scrollChat() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function money(value) {
  return `Rs.${Number(value || 0).toLocaleString("en-IN")}`;
}

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

function imageUrl(product) {
  if (!product.image) return "https://via.placeholder.com/300";
  if (product.image.startsWith("http")) return product.image;
  return `${BASE_URL}${product.image}`;
}

function productLabel(product, index) {
  return `${index + 1}. ${product.name} - ${money(product.price)}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showProducts(products) {
  if (!Array.isArray(products) || products.length === 0) return;

  lastProducts = products;

  const wrapper = document.createElement("div");
  wrapper.classList.add("products-wrapper");

  products.forEach((product, index) => {
    const card = document.createElement("article");
    card.classList.add("product-card");

    card.innerHTML = `
      <img src="${imageUrl(product)}" alt="${escapeHtml(product.name)}">
      <div class="info">
        <span class="product-index">${index + 1}</span>
        <h4>${escapeHtml(product.name)}</h4>
        <p>${money(product.price)}</p>
        <small>${escapeHtml(product.category || "Product")}</small>
      </div>
      <div class="card-actions">
        <button type="button" data-action="cart" data-index="${index}">Cart</button>
        <button type="button" data-action="wishlist" data-index="${index}">Wishlist</button>
      </div>
    `;

    wrapper.appendChild(card);
  });

  chatBox.appendChild(wrapper);
  scrollChat();
}

function findProductFromText(text) {
  if (!lastProducts.length) return null;

  const lowerText = text.toLowerCase();

  for (const [word, index] of Object.entries(numberWords)) {
    if (lowerText.includes(word) && lastProducts[index]) {
      return lastProducts[index];
    }
  }

  const digitMatch = lowerText.match(/\b([1-9])\b/);
  if (digitMatch) {
    const index = Number(digitMatch[1]) - 1;
    if (lastProducts[index]) return lastProducts[index];
  }

  return lastProducts.find((product) =>
    lowerText.includes(product.name.toLowerCase())
  ) || lastProducts[0];
}

function isCartCommand(text) {
  return /(add|put).*(cart)|buy this|buy it|cart this/.test(text);
}

function isWishlistCommand(text) {
  return /(add|save).*(wishlist|wish list|later|favorite|favourite)/.test(text);
}

function isCheckoutCommand(text) {
  return /(place|confirm|complete).*(order)|check\s*out|checkout|buy now/.test(text);
}

function isCompareCommand(text) {
  return /compare|difference|which.*better/.test(text);
}

function isOrderTrackingCommand(text) {
  return /(where|track|status|show|my).*(order|orders)|order.*(status|track|where)/.test(text);
}

async function addToCart(product) {
  if (!product || !requireLogin()) return;

  const res = await fetch(`${BASE_URL}/cart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      productId: product._id,
      quantity: 1
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Unable to add to cart");

  addMessage(`${product.name} has been added to your cart. You can ask me to checkout when ready.`);
}

async function addToWishlist(product) {
  if (!product || !requireLogin()) return;

  const res = await fetch(`${BASE_URL}/wishlist/${product._id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Unable to update wishlist");

  addMessage(`${product.name}: ${data.message || "Wishlist updated"}.`);
}

async function getCart() {
  if (!requireLogin()) return [];

  const res = await fetch(`${BASE_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Unable to read cart");

  return data;
}

async function getProducts() {
  const res = await fetch(`${BASE_URL}/products`);
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Unable to load products");
  return Array.isArray(data) ? data : [];
}

async function getOrders() {
  if (!requireLogin()) return [];

  const res = await fetch(`${BASE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Unable to read orders");

  return Array.isArray(data) ? data : [];
}

async function trackOrders() {
  const orders = await getOrders();

  if (!orders.length) {
    addMessage("I could not find any orders for your account yet.");
    return;
  }

  const latestOrders = orders.slice(0, 3);
  const lines = latestOrders.map((order, index) => {
    const items = (order.items || [])
      .map((item) => `${item.product?.name || "Product"} x ${item.quantity}`)
      .join(", ");

    return `${index + 1}. Order ${order._id}\nItems: ${items || "Items unavailable"}\nTotal: ${money(order.total)}\nStatus: ${order.status}`;
  }).join("\n\n");

  addMessage(`Here are your latest orders:\n\n${lines}`);
  addQuickAction("Open Orders Page", "../orders.html");
}

function localCompare() {
  if (lastProducts.length < 2) {
    addMessage("Show me at least two products first, then I can compare them.");
    return true;
  }

  const products = lastProducts.slice(0, 4);
  const cheapest = [...products].sort((a, b) => Number(a.price) - Number(b.price))[0];
  const lines = products.map(productLabel).join("\n");

  addMessage(
    `Here is a quick comparison from the products currently shown:\n\n${lines}\n\nBest value by price: ${cheapest.name} at ${money(cheapest.price)}.`
  );
  return true;
}

async function startCheckout() {
  const cart = await getCart();

  if (!cart.length) {
    addMessage("Your cart is empty. Tell me what you want to buy first.");
    return;
  }

  const total = cart.reduce((sum, item) => {
    return sum + Number(item.product?.price || 0) * Number(item.quantity || 1);
  }, 0);

  const summary = cart.map((item, index) => {
    const product = item.product || {};
    return `${index + 1}. ${product.name} x ${item.quantity} - ${money(Number(product.price || 0) * item.quantity)}`;
  }).join("\n");

  addMessage(`Your checkout section is ready:\n\n${summary}\n\nTotal: ${money(total)}\n\nDo you want to add any items from below before placing the order? You can tap Cart on any product, or fill delivery details when you are ready.`);
  await showAddMoreProducts(cart);
  showCheckoutForm();
}

async function showAddMoreProducts(cart) {
  const products = await getProducts();
  const cartIds = new Set(
    cart
      .map((item) => item.product?._id || item.product)
      .filter(Boolean)
      .map(String)
  );
  const addMoreProducts = products.filter((product) => !cartIds.has(String(product._id)));

  if (!addMoreProducts.length) {
    addMessage("All available products are already in your cart.");
    return;
  }

  addMessage("You can add more items from these products before placing the order:");
  showProducts(addMoreProducts);
}

function showCheckoutForm() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const form = document.createElement("form");
  form.className = "checkout-form";
  form.innerHTML = `
    <input id="aiOrderName" type="text" placeholder="Full name" value="${escapeHtml(user.name || "")}" required>
    <input id="aiOrderPhone" type="tel" placeholder="10-digit phone number" maxlength="10" inputmode="numeric" required>
    <textarea id="aiOrderAddress" placeholder="Full address: house number, street/area, city, pincode" rows="3" required></textarea>
    <select id="aiOrderPayment">
      <option value="COD">Cash on Delivery</option>
      <option value="UPI">UPI</option>
      <option value="CARD">Card</option>
    </select>
    <button type="submit">Place Order</button>
  `;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await placeOrderFromForm();
  });

  chatBox.appendChild(form);
  scrollChat();
}

async function placeOrderFromForm() {
  if (!requireLogin()) return;

  const name = document.getElementById("aiOrderName").value.trim();
  const phone = document.getElementById("aiOrderPhone").value.trim();
  const address = document.getElementById("aiOrderAddress").value.trim();
  const paymentMethod = document.getElementById("aiOrderPayment").value;

  if (!name || !phone || !address) {
    addMessage("Please fill name, phone, and address before I place the order.");
    return;
  }

  if (!isValidIndianPhone(phone)) {
    addMessage("Please enter a valid 10-digit Indian phone number.");
    return;
  }

  if (!isValidAddress(address)) {
    addMessage("Please enter a complete address with house number, street/area, and city.");
    return;
  }

  const res = await fetch(`${BASE_URL}/orders/place`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      name,
      phone: normalizePhone(phone),
      address,
      paymentMethod
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Order failed");

  addMessage(`Order placed successfully. Your order id is ${data.order?._id || "created"}.`);
  addQuickAction("View Orders", "../orders.html");
}

async function handleLocalCommand(text) {
  const lowerText = text.toLowerCase();

  if (isCheckoutCommand(lowerText)) {
    await startCheckout();
    return true;
  }

  if (isOrderTrackingCommand(lowerText)) {
    await trackOrders();
    return true;
  }

  if (isCartCommand(lowerText)) {
    await addToCart(findProductFromText(lowerText));
    return true;
  }

  if (isWishlistCommand(lowerText)) {
    await addToWishlist(findProductFromText(lowerText));
    return true;
  }

  if (isCompareCommand(lowerText) && lastProducts.length) {
    return localCompare();
  }

  return false;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  moveInputToBottom();
  addMessage(text, "user");
  input.value = "";

  try {
    const handledLocally = await handleLocalCommand(text);
    if (handledLocally) return;

    const res = await fetch(AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "AI service error");
    }

    addMessage(data.response || "I found this for you.");
    showProducts(data.products || []);
  } catch (err) {
    addMessage(err.message || "Unable to connect right now. Please check the backend services.");
  }
}

chatBox.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const product = lastProducts[Number(button.dataset.index)];
  if (!product) return;

  try {
    if (button.dataset.action === "cart") {
      await addToCart(product);
    } else if (button.dataset.action === "wishlist") {
      await addToWishlist(product);
    }
  } catch (err) {
    addMessage(err.message || "Action failed. Please try again.");
  }
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

function goHome() {
  window.location.href = "../index.html";
}
