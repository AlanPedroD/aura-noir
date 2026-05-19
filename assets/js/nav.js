// ─── nav.js — Monta o nav e a sidebar do carrinho em qualquer página ─────────
import { getCart, changeQuantity, removeFromCart, clearCart, calculateSubtotal, getTotalItems } from './cart.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBke7blmmwi9jKM9_Pd050A17a-Mz_as9E",
  authDomain: "perfumaria-34f48.firebaseapp.com",
  projectId: "perfumaria-34f48",
  storageBucket: "perfumaria-34f48.firebasestorage.app",
  messagingSenderId: "633215543720",
  appId: "1:633215543720:web:90650181ecd576a64d159d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ── Injeta nav, sidebar e modal separadamente no <body> ───────────────────────
export function injectNav(activePage = '') {

  // 1. NAV — inserido no TOPO do body
  const navHTML = `
  <nav id="nav" ${activePage === 'produtos' ? 'class="nav-produtos"' : ''}>
    <div class="nav-logo"><a href="/index.html" class="logo">Aura Noir</a></div>
    <ul class="nav-links" id="navLinks">
      <li><a href="/pages/produtos.html" class="${activePage === 'produtos' ? 'nav-active' : ''}">Coleção</a></li>
      <li><a href="/index.html#collection">Destaques</a></li>
      <li><a href="/index.html#ritual">Dicas</a></li>
      <li><a href="/index.html#notas">Notas</a></li>
      <li><a href="/index.html#essence">Sobre</a></li>
    </ul>
    <div class="nav-actions">
      <button class="nav-icon-btn" id="openCartBtn" aria-label="Abrir Carrinho">
        <i data-lucide="shopping-cart"></i>
        <span class="cart-badge-count" id="cartCount" style="display:none;">0</span>
      </button>
      <a href="pages/login.html" class="nav-icon-btn" id="userNavBtn" aria-label="Área administrativa">
        <i data-lucide="user"></i>
      </a>
      <button class="menu-toggle" id="menuToggle" aria-label="Abrir menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>`;

  // 2. SIDEBAR — inserida no FINAL do body, isolada do nav
  const sidebarHTML = `
  <div class="cart-sidebar" id="cartSidebar">
    <div class="cart-header">
      <h3>Sua Sacola</h3>
      <button class="close-cart-btn" id="closeCartBtn"><i data-lucide="x"></i></button>
    </div>
    <div class="cart-items-list" id="cartItemsList"></div>
    <div class="cart-footer">
      <div class="cart-total-row">
        <span>Subtotal:</span>
        <span id="cartSubtotal">R$ 0,00</span>
      </div>
      <button class="checkout-btn" id="goToCheckoutBtn">Finalizar Compra</button>
    </div>
  </div>`;

  // 3. MODAL — inserido no FINAL do body, isolado do nav
  const modalHTML = `
  <div class="modal-overlay" id="checkoutModal">
    <div class="checkout-modal">
      <div class="modal-header">
        <h3>Finalizar seu Pedido</h3>
        <button class="close-modal-btn" id="closeModalBtn"><i data-lucide="x"></i></button>
      </div>
      <form id="checkoutForm">
        <div class="form-group">
          <label for="clientName">Nome Completo *</label>
          <input type="text" id="clientName" required placeholder="Ex: Gabriel Silva">
        </div>
        <div class="form-group">
          <label for="clientAddress">Endereço de Entrega Completo *</label>
          <input type="text" id="clientAddress" required placeholder="Rua, Número, Bairro, Cidade">
        </div>
        <div class="form-group">
          <label for="paymentMethod">Forma de Pagamento *</label>
          <select id="paymentMethod" required>
            <option value="Cartão de Crédito">Cartão de Crédito</option>
            <option value="Pix">Pix (Ganhe 5% de Desconto)</option>
            <option value="Dinheiro">Dinheiro</option>
          </select>
        </div>
        <div class="form-group">
          <label for="clientNotes">Observações do Pedido</label>
          <textarea id="clientNotes" rows="3" placeholder="Ex: Detalhes sobre a entrega ou embalagem para presente."></textarea>
        </div>
        <div class="summary-box">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span id="modalSubtotal">R$ 0,00</span>
          </div>
          <div class="summary-row pix-discount-note" id="pixDiscountRow" style="display:none;">
            <span>Desconto Pix (5%):</span>
            <span id="modalDiscount">- R$ 0,00</span>
          </div>
          <div class="summary-row summary-total">
            <span>Valor Total:</span>
            <span id="modalTotal">R$ 0,00</span>
          </div>
        </div>
        <button type="submit" class="submit-order-btn">
          <i data-lucide="send"></i> Enviar Pedido via WhatsApp
        </button>
      </form>
    </div>
  </div>`;

  // Inserções separadas — nav no topo, sidebar e modal no final
  document.body.insertAdjacentHTML('afterbegin', navHTML);
  document.body.insertAdjacentHTML('beforeend', sidebarHTML);
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  lucide.createIcons();
initNavLogic();
// Aguarda o DOM processar o HTML inserido antes de registrar eventos
requestAnimationFrame(() => {
  initCartLogic();
  updateCartBadge();
});
}

// ── Lógica do nav (scroll + menu mobile) ─────────────────────────────────────
function initNavLogic() {
  const nav        = document.getElementById('nav');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks   = document.getElementById('navLinks');

  // Efeito scroll
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Menu mobile — abre/fecha
  menuToggle?.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Fecha menu ao clicar em qualquer link
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Ícone usuário: redireciona conforme estado de autenticação
  onAuthStateChanged(auth, (user) => {
    const userBtn = document.getElementById('userNavBtn');
    if (userBtn) {
      userBtn.href  = user ? '/pages/admin.html' : '/pages/login.html';
      userBtn.title = user ? 'Ir para o Painel Admin' : 'Login Administrativo';
    }
  });
}

// ── Lógica completa do carrinho ───────────────────────────────────────────────
function initCartLogic() {
  const cartSidebar        = document.getElementById('cartSidebar');
  const openCartBtn        = document.getElementById('openCartBtn');
  const closeCartBtn       = document.getElementById('closeCartBtn');
  const goToCheckoutBtn    = document.getElementById('goToCheckoutBtn');
  const closeModalBtn      = document.getElementById('closeModalBtn');
  const checkoutModal      = document.getElementById('checkoutModal');
  const paymentMethodSelect = document.getElementById('paymentMethod');
  const checkoutForm       = document.getElementById('checkoutForm');

  openCartBtn?.addEventListener('click', () => {
    renderCartItems();
    cartSidebar.classList.add('open');
  });

  closeCartBtn?.addEventListener('click', () => cartSidebar.classList.remove('open'));

  closeModalBtn?.addEventListener('click', () => checkoutModal.classList.remove('open'));


  goToCheckoutBtn?.addEventListener('click', () => {
    const cart = getCart();
    if (cart.length === 0) { alert("Sua sacola está vazia!"); return; }
    cartSidebar.classList.remove('open');
    updateCheckoutSummary();
    checkoutModal.classList.add('open');
  });

  paymentMethodSelect?.addEventListener('change', updateCheckoutSummary);

  checkoutForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const cart    = getCart();
    const name    = document.getElementById('clientName').value;
    const address = document.getElementById('clientAddress').value;
    const payment = paymentMethodSelect.value;
    const notes   = document.getElementById('clientNotes').value || 'Nenhuma';
    const subtotal   = calculateSubtotal(cart);
    const discount   = payment === 'Pix' ? subtotal * 0.05 : 0;
    const finalTotal = subtotal - discount;

    let message = `*✨ NOVO PEDIDO - AURA NOIR Parfums*\n\n`;
    message += `👤 *Cliente:* ${name}\n`;
    message += `📍 *Endereço:* ${address}\n`;
    message += `💳 *Pagamento:* ${payment}\n`;
    message += `📝 *Obs:* ${notes}\n\n`;
    message += `📦 *PRODUTOS ADQUIRIDOS:*\n`;
    cart.forEach(item => {
      message += `• ${item.quantity}x _${item.nome}_ (R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')} cada)\n`;
    });
    message += `\n---------------------------\n`;
    message += `💰 *Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    if (discount > 0) message += `💚 *Desconto Pix (5%):* - R$ ${discount.toFixed(2).replace('.', ',')}\n`;
    message += `🛍️ *VALOR TOTAL:* R$ ${finalTotal.toFixed(2).replace('.', ',')}`;

    const whatsappNumber = "5581986953009";
    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`, '_blank');

    clearCart();
    renderCartItems();
    updateCartBadge();
    checkoutModal.classList.remove('open');
    checkoutForm.reset();
  });

  // Sincroniza badge entre páginas
  window.addEventListener('cartUpdated', () => {
    updateCartBadge();
    renderCartItems();
  });
  window.addEventListener('storage', () => {
    updateCartBadge();
  });
}

// ── Renderiza itens na sidebar ────────────────────────────────────────────────
export function renderCartItems() {
  const cart          = getCart();
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotal  = document.getElementById('cartSubtotal');
  if (!cartItemsList) return;

  cartItemsList.innerHTML = '';

  if (cart.length === 0) {
    cartItemsList.innerHTML = `<p style="text-align:center;font-family:'Cormorant Garamond';margin-top:40px;color:var(--text-muted)">Sua sacola está vazia.</p>`;
  } else {
    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.imagemUrl}" class="cart-item-img" alt="${item.nome}">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.nome}</div>
          <div class="cart-item-price">R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}</div>
          <div class="cart-item-qty-control">
            <button class="qty-btn dec-btn" data-id="${item.id}">-</button>
            <span style="font-family:'Tenor Sans'">${item.quantity}</span>
            <button class="qty-btn inc-btn" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="remove-item-btn" data-id="${item.id}">
          <i data-lucide="trash-2" style="width:18px;"></i>
        </button>
      `;
      div.querySelector('.dec-btn').addEventListener('click', () => { changeQuantity(item.id, -1); renderCartItems(); updateCartBadge(); });
      div.querySelector('.inc-btn').addEventListener('click', () => { changeQuantity(item.id,  1); renderCartItems(); updateCartBadge(); });
      div.querySelector('.remove-item-btn').addEventListener('click', () => { removeFromCart(item.id); renderCartItems(); updateCartBadge(); });
      cartItemsList.appendChild(div);
    });
  }

  if (cartSubtotal) {
    cartSubtotal.textContent = `R$ ${calculateSubtotal(cart).toFixed(2).replace('.', ',')}`;
  }
  lucide.createIcons();
}

// ── Atualiza badge do ícone ───────────────────────────────────────────────────
export function updateCartBadge() {
  const cart  = getCart();
  const total = getTotalItems(cart);
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  if (total > 0) {
    badge.textContent = total;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// ── Resumo no modal de checkout ───────────────────────────────────────────────
function updateCheckoutSummary() {
  const cart     = getCart();
  const subtotal = calculateSubtotal(cart);
  const payment  = document.getElementById('paymentMethod')?.value;
  let discount   = 0;

  document.getElementById('modalSubtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

  if (payment === 'Pix') {
    discount = subtotal * 0.05;
    document.getElementById('pixDiscountRow').style.display = 'flex';
    document.getElementById('modalDiscount').textContent = `- R$ ${discount.toFixed(2).replace('.', ',')}`;
  } else {
    document.getElementById('pixDiscountRow').style.display = 'none';
  }

  document.getElementById('modalTotal').textContent = `R$ ${(subtotal - discount).toFixed(2).replace('.', ',')}`;
}
