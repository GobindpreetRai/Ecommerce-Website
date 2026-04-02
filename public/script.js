
// --- Data ---
const products = [
  {id:1, name:'Creeper PC', price:6799.99, category:'PC', image:'photos/Creeper PC.jpeg'},
  {id:2, name:'Graphics "Card"', price:399.99, category:'Graphics', image:'photos/Graphics card.png'},
  {id:3, name:'board', price:249.00, category:'Motherboard', image:'photos/Motherboard.png'},
  {id:4, name:'some RAM', price:9999999.67, category:'RAM', image:'photos/RAM.webp'},
  {id:5, name:'The Rock', price:129.99, category:'Hard Drive', image:'photos/Rock.png'},
  {id:6, name:'Nile T-Shirt', price:24.99, category:'Apparel', image:'photos/NILE-T-shirt.png'},
  {id:7, name:'The Fan', price:17.50, category:'Fans', image:'photos/Fan.png'},
  {id:8, name:'A CPU', price:67.99, category:'CPU', image:'photos/CPU.jpg'},

];

const state = {
  cart: JSON.parse(localStorage.getItem('cart')||'[]'),
  theme: localStorage.getItem('theme')||'dark',
  history: JSON.parse(localStorage.getItem('history')||'[]'),
};

// --- Utilities ---
const fmt = n => `$${n.toFixed(2)}`;
const setTheme = (mode) => {
  document.documentElement.dataset.theme = (mode==='light'?'light':'');
  state.theme = mode;
  localStorage.setItem('theme', mode);
};

function saveCart(){ localStorage.setItem('cart', JSON.stringify(state.cart)); updateCartCount(); }
function addToCart(id, qty=1){
  const p = products.find(x=>x.id===id); if(!p) return;
  const item = state.cart.find(x=>x.id===id);
  if(item) item.qty += qty; else state.cart.push({id, qty});
  saveCart();
}
function removeFromCart(id){ state.cart = state.cart.filter(x=>x.id!==id); saveCart(); renderCartTable(); renderCartPage(); }
function updateQty(id, qty){
  const item = state.cart.find(x=>x.id===id);
  if(item){ item.qty = Math.max(1, qty); saveCart(); renderCartTable(); renderCartPage(); }
}
function updateCartCount(){ const c = state.cart.reduce((a,b)=>a+b.qty,0); document.getElementById('cartCount').textContent = c; }

// --- Router ---
const router = {
  go(hash){ location.hash = hash; },
  render(){
    const page = location.hash.replace('#','') || '/';
    // history trail
    if(!['/payment'].includes(page)) pushHistory(page);
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const map = {
      '/':'page-home', '/products':'page-products', '/payment':'page-payment', '/login':'page-login',
      '/about':'page-about', '/settings':'page-settings', '/profile':'page-profile', '/transactions':'page-transactions',
      '/address':'page-address', '/history':'page-history', '/support':'page-support', '/faq':'page-faq', '/cart':'page-cart', '/security':'page-security'
    };
    const id = map[page]||'page-home';
    document.getElementById(id).classList.add('active');
    // page specific renders
    if(id==='page-products') renderProducts();
    if(id==='page-payment') renderCartTable();
    if(id==='page-cart') renderCartPage();
    if(id==='page-history') renderHistory();
  }
};

window.addEventListener('hashchange', ()=>router.render());

// --- Search & Categories ---
const categories = [...new Set(products.map(p=>p.category))];
function renderCategoryChips(){
  const wrap = document.getElementById('categoryChips');
  wrap.innerHTML = '';
  categories.forEach(cat=>{
    const chip = document.createElement('span');
    chip.className='chip'; chip.textContent=cat;
    chip.onclick=()=>{
      document.getElementById('categorySelect').value=cat;
      router.go('#/products'); renderProducts();
    };
    wrap.appendChild(chip);
  });
}

function renderFeatured(){
  const grid = document.getElementById('featuredGrid');
  grid.innerHTML = '';
  products.slice(0,6).forEach(p=> grid.appendChild(productCard(p)) );
}

function renderProducts(){
  const sel = document.getElementById('categorySelect');
  if(!sel.dataset.ready){
    sel.innerHTML = '<option value="">All Categories</option>' + categories.map(c=>`<option>${c}</option>`).join('');
    sel.dataset.ready='1';
  }
  const q = document.getElementById('searchInput').value.toLowerCase();
  const cat = sel.value;
  const list = products.filter(p=>(!cat||p.category===cat) && (!q||p.name.toLowerCase().includes(q)));
  const grid = document.getElementById('productGrid'); grid.innerHTML='';
  list.forEach(p=> grid.appendChild(productCard(p)) );
  if(list.length===0){ grid.innerHTML = '<p class="muted">No items match your search.</p>'; }
}

function productCard(p){
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${p.image}" alt="${p.name}">
    <div class="pad">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <div style="font-weight:700;">${p.name}</div>
          <div class="muted" style="font-size:14px;">${p.category}</div>
        </div>
        <div style="font-weight:800;">${fmt(p.price)}</div>
      </div>
      <div style="margin-top:8px; display:flex; gap:8px;">
        <button class="btn primary" onclick="addToCart(${p.id});">Add to cart</button>
        <button class="btn outline" onclick="openModal(${p.id})">Quick view</button>
      </div>
    </div>`;
  return card;
}

document.getElementById('searchInput').addEventListener('input', ()=>{ renderProducts(); });

// --- Product Modal ---
let currentModalProduct = null;
function openModal(id){
  const p = products.find(x=>x.id===id); if(!p) return;
  currentModalProduct=p;
  document.getElementById('modalTitle').textContent=p.name;
  document.getElementById('modalImg').src = p.image;
  document.getElementById('modalPrice').textContent=fmt(p.price);
  document.getElementById('onlyPrice').textContent=p.price.toFixed(2);
  document.getElementById('productModal').classList.add('active');
  const btn=document.getElementById('addToCartBtn');
  btn.onclick=()=>{ addToCart(p.id); closeModal(); }
}
function closeModal(){ document.getElementById('productModal').classList.remove('active'); }

// --- Popup Ad ---
function showPopup(){ document.getElementById('popupAd').classList.add('active'); }
function hidePopup(){ document.getElementById('popupAd').classList.remove('active'); }

// --- Cart / Payment ---
function cartLines(){ return state.cart.map(ci=> ({...ci, product: products.find(p=>p.id===ci.id)})); }
function renderCartTable(){
  const tbody = document.querySelector('#cartTable tbody');
  tbody.innerHTML='';
  let subtotal = 0;
  cartLines().forEach(line=>{
    const sub = line.qty * line.product.price; subtotal += sub;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${line.product.name}</td>
      <td><input type="number" min="1" value="${line.qty}" onchange="updateQty(${line.product.id}, parseInt(this.value)||1)" style="width:72px"/></td>
      <td>${fmt(line.product.price)}</td>
      <td>${fmt(sub)}</td>
      <td><button class="btn link" onclick="removeFromCart(${line.product.id})">Remove</button></td>
    `;
    tbody.appendChild(tr);
  });
  const shipping = parseFloat(document.getElementById('shipping').value||'0');
  const taxPct = parseFloat(document.getElementById('tax').value||'0');
  const taxAmt = subtotal * (taxPct/100);
  const total = subtotal + shipping + taxAmt;
  document.getElementById('totalAmount').textContent = fmt(total);
}

function renderCartPage(){
  const wrap = document.getElementById('cartItems');
  wrap.innerHTML='';
  cartLines().forEach(line=>{
    const div = document.createElement('div'); div.className='card';
    div.innerHTML = `<div class="pad"><strong>${line.product.name}</strong> × ${line.qty} — ${fmt(line.product.price*line.qty)} <button class="btn link" onclick="removeFromCart(${line.product.id})">Remove</button></div>`;
    wrap.appendChild(div);
  });
  if(state.cart.length===0){ wrap.innerHTML='<p class="muted">Your cart is empty.</p>'; }
}

document.getElementById('shipping').addEventListener('change', renderCartTable);
document.getElementById('tax').addEventListener('input', renderCartTable);

function checkout(){
  if(state.cart.length===0){ alert('Your cart is empty.'); return; }
  alert('Checkout complete (demo).');
  state.cart = []; saveCart(); router.go('#/');
}

// --- Auth ---

function register(uname, email, pword, tpword) {
  if (!uname || !email || !pword || !tpword) {
    alert("Please fill in all fields.");
    return;
  }
  if (pword !== tpword) {
    alert("Passwords do not match.");
    return;
  }

  // Get existing users from localStorage
  let users = [];
  try { users = JSON.parse(localStorage.getItem('users')||'[]'); } catch(e){ users=[]; }

  // Check if username already exists
  if(users.find(u => u.username === uname)) {
    alert("Username already exists. Choose another.");
    return;
  }

  // Add new user
  users.push({ username: uname, email, password: pword });
  localStorage.setItem('users', JSON.stringify(users));
  alert(`Account created for ${uname}.`);
}

function login(uname, pword) {
  if (!uname || !pword) {
    alert("Please fill in both fields.");
    return;
  }

  let users = [];
  try { users = JSON.parse(localStorage.getItem('users')||'[]'); } catch(e){ users=[]; }

  const user = users.find(u => u.username === uname && u.password === pword);
  if(user) {
    alert(`Logged in as ${uname} (demo).`);
    state.currentUser = uname;
    router.go('#/'); // redirect to home
  } else {
    alert("Invalid username or password.");
  }
}

/*function login(uname, pword){ 

// Check if username already exists
  if(users.find(u => u.username === uname)) {
    alert("Username already exists. Choose another.");
    return;
  }

  //alert('Logged in as '+(document.getElementById('loginUser').value||'guest')+' (demo).'); 
}
function register(uname, email, pword, tpword){ 
  // need help on this
  if (!uname || !email || !pword || !tpword) {
    alert("Please fill in all fields.");
    return;
  }

  if (pword !== tpword) {
    alert("Passwords do not match.");
    return;
  }



  //alert('Account created for '+(document.getElementById('regUser').value||'user')+' (demo).'); 
}
  
alt
 // Get existing users from localStorage
  let users = [];
  try { users = JSON.parse(localStorage.getItem('users')||'[]'); } catch(e){ users=[]; }

  // Add new user
  users.push({ username: uname, email, password: pword });
  localStorage.setItem('users', JSON.stringify(users));
  alert(`Account created for ${uname} (demo).`);



   let users = [];
  try { users = JSON.parse(localStorage.getItem('users')||'[]'); } catch(e){ users=[]; }

  const user = users.find(u => u.username === uname && u.password === pword);
  if(user) {
    alert(`Logged in as ${uname} (demo).`);
    state.currentUser = uname;
    router.go('#/'); // redirect to home
  } else {
    alert("Invalid username or password.");
  }


*/

// --- System / Preferences ---
function toggleAnimatedAds(on){
  document.querySelectorAll('.pulse').forEach(el=> el.style.animationPlayState = on?'running':'paused');
}

function openSecurity(){ router.go('#/security'); }

function randomLootCrate(){
  const pick = products[Math.floor(Math.random()*products.length)];
  addToCart(pick.id);
  alert('Loot crate dropped: '+pick.name+' added to your cart!');
}

// --- Browsing history ---
function pushHistory(page){
  const ts = new Date().toLocaleString();
  state.history.unshift({page, ts});
  state.history = state.history.slice(0, 25);
  localStorage.setItem('history', JSON.stringify(state.history));
}
function renderHistory(){
  const ul = document.getElementById('historyList'); ul.innerHTML='';
  state.history.forEach(h=>{ const li=document.createElement('li'); li.textContent = `${h.ts} — ${h.page}`; ul.appendChild(li); });
}

// --- Init ---
(function init(){
  setTheme(state.theme);
  renderCategoryChips();
  renderFeatured();
  updateCartCount();
  router.render();
  // show pop-up after a short delay
  setTimeout(showPopup, 800);
})();
