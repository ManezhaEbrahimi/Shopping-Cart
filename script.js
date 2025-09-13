// ---------- Data ----------
const PRODUCTS = [
    { id: 1, name: "Wireless Headphones", price: 59.99, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"},
    { id: 2, name: "Mechanical Keyboard", price: 89.5, image: "https://plus.unsplash.com/premium_photo-1679177183572-a4056053b8a2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 3, name: "Gaming Mouse", price: 34.0, image: "https://images.unsplash.com/photo-1628832307345-7404b47f1751?q=80&w=1183&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 4, name: "USB-C Charger", price: 19.99, image: "https://images.unsplash.com/photo-1619459072761-496c0812331b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 5, name: "4K Monitor", price: 279.0, image: "https://images.unsplash.com/photo-1675151638960-fc1513f8021e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 6, name: "Webcam 1080p", price: 45.25, image: "https://images.unsplash.com/photo-1626581795188-8efb9a00eeec?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }
];
// ---------- State ----------
const LS_KEY = 'sc_cart_v1';
/** cart: Array<{ id:number, name:string, price:number, qty:number }> */
let cart = [];
// ---------- Utils (ES6) ----------
const $ = sel => document.querySelector(sel);
const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
const money = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1300); };

const saveCart = () => localStorage.setItem(LS_KEY, JSON.stringify(cart));
const loadCart = () => { try { cart = JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { cart = []; } };

const findProduct = (id) => PRODUCTS.find(p => p.id === id);

// ---------- Render Products (map + template literals) ----------
const renderProducts = (list = PRODUCTS) => {
    const grid = $('#productGrid');
    grid.innerHTML = list.map(p => `
<article class="card" data-id="${p.id}">
  <img src="${p.image || ''}" alt="${p.name}" loading="lazy" />
  <div class="info">
    <div class="name">${p.name}</div>
    <div class="price">${money(p.price)}</div>
    <div class="muted">ID: ${p.id}</div>
  </div>
  <div class="actions">
    <button class="btn primary addBtn" aria-label="Add ${p.name} to cart">Add to Cart</button>
  </div>
</article>
`).join('');
  };

// ---------- Cart Logic ----------
const addToCart = (id) => {
    const prod = findProduct(id);
    if (!prod) return;
    const existing = cart.find(it => it.id === id);
    if (existing) existing.qty += 1; else cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
    saveCart();
    renderCart();
    toast(`${prod.name} added to cart`);
};

const changeQty = (id, delta) => {
    cart = cart.map(it => it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it);
    saveCart();
    renderCart();
};

const removeItem = (id) => {
    cart = cart.filter(it => it.id !== id);
    saveCart();
    renderCart();
};

const emptyCart = () => { cart = []; saveCart(); renderCart(); };

// ---------- Render Cart (map + reduce) ----------
const renderCart = () => {
    const body = $('#cartBody');
    if (!cart.length) {
        body.innerHTML = `<div class="cart-empty">Your cart is empty. Start adding products!</div>`;
        $('#grandTotal').textContent = money(0);
        return;
    }
    body.innerHTML = cart.map(it => {
        const subtotal = it.price * it.qty;
        return `
  <div class="cart-item" data-id="${it.id}">
    <div class="name">${it.name}</div>
    <div class="price">${money(it.price)}</div>
    <div class="qtyCtrl">
      <button class="btn" data-act="dec" title="Decrease">–</button>
      <div aria-live="polite">${it.qty}</div>
      <button class="btn" data-act="inc" title="Increase">+</button>
    </div>
    <div class="subtotal">${money(subtotal)}</div>
    <button class="btn danger" data-act="rm" title="Remove">×</button>
  </div>`;
    }).join('');

const total = cart.reduce((sum, it) => sum + it.price * it.qty, 0);
       $('#grandTotal').textContent = money(total);
        };

// ---------- Search / Filter ----------
const applyFilter = () => {
    const q = $('#q').value.trim().toLowerCase();
    const filtered = !q ? PRODUCTS : PRODUCTS.filter(p => p.name.toLowerCase().includes(q));
    renderProducts(filtered);
};

// ---------- Events (event delegation) ----------
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    renderProducts();
    renderCart();

// Add to Cart from product grid
$('#productGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('.addBtn');
    if (!btn) return;
    const card = e.target.closest('.card');
    addToCart(Number(card.dataset.id));
});

// Cart interactions
$('#cartBody').addEventListener('click', (e) => {
    const row = e.target.closest('.cart-item');
    if (!row) return;
    const id = Number(row.dataset.id);
    const act = e.target.dataset.act;
    if (act === 'inc') changeQty(id, +1);
    if (act === 'dec') changeQty(id, -1);
    if (act === 'rm') removeItem(id);
});

// Search
$('#q').addEventListener('input', applyFilter);
$('#clearQ').addEventListener('click', () => { $('#q').value = ''; applyFilter(); $('#q').focus(); });
document.addEventListener('keydown', (e) => { if (e.key === '/' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $('#q').focus(); } });

// Reset cart
    $('#resetCart').addEventListener('click', () => { if (confirm('Empty the cart?')) emptyCart(); });
});
