// produtos.js — Página de produtos
import { injectNav, renderCartItems, updateCartBadge } from './nav.js';
import { addToCart } from './cart.js';
import { injectProductModal, openProductModal } from './productModal.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBke7blmmwi9jKM9_Pd050A17a-Mz_as9E",
  authDomain: "perfumaria-34f48.firebaseapp.com",
  projectId: "perfumaria-34f48",
  storageBucket: "perfumaria-34f48.firebasestorage.app",
  messagingSenderId: "633215543720",
  appId: "1:633215543720:web:90650181ecd576a64d159d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── 1. Nav compartilhado + nav escuro imediato (fundo claro nesta página) ────
injectNav('produtos');
setTimeout(() => {
  document.getElementById('nav')?.classList.add('scrolled');
}, 0);

// ── 2. Modal de detalhes ──────────────────────────────────────────────────────
injectProductModal();

// ── 3. Elementos da página ────────────────────────────────────────────────────
const productsGrid = document.getElementById('productsGrid');

// ── 4. Escuta produtos do Firebase em tempo real ──────────────────────────────
onSnapshot(collection(db, "produtos"), (snapshot) => {
  productsGrid.innerHTML = "";

  if (snapshot.empty) {
    productsGrid.innerHTML = `<p style="grid-column:1/-1;font-family:'Cormorant Garamond';color:var(--text-muted);">Nenhum perfume cadastrado no momento.</p>`;
    return;
  }

  snapshot.forEach(doc => {
    const prod = { id: doc.id, ...doc.data() };
    renderProductCard(prod);
  });

  lucide.createIcons();
});

// ── 5. Renderiza card ─────────────────────────────────────────────────────────
function renderProductCard(prod) {
  const hasOldPrice = prod.promocional && prod.precoAntigo;

  let badgeHtml = '';
  if (prod.tag === 'mais-vendido') badgeHtml = `<span class="card-badge badge-mais-vendido">Mais Vendido</span>`;
  else if (prod.tag === 'novo')    badgeHtml = `<span class="card-badge badge-novo">Novo</span>`;
  else if (prod.tag === 'promocao') badgeHtml = `<span class="card-badge badge-promocao">Promoção</span>`;

  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    ${badgeHtml}
    <button class="favorite-btn" aria-label="Favoritar"><i data-lucide="heart" style="width:16px;height:16px;"></i></button>
    <div class="product-image-wrapper" title="Ver detalhes">
      <img src="${prod.imagemUrl || 'https://via.placeholder.com/300x300?text=Aura+Noir'}" alt="${prod.nome}">
    </div>
    <div class="product-info">
      <span class="brand-line">${prod.subtitulo || 'LUMIÈRE'}</span>
      <h3 class="product-title">${prod.nome}</h3>
      <p class="product-notes">${prod.notasOlfativas || ''}</p>
      <div class="price-action-row">
        <div class="price-container">
          ${hasOldPrice ? `<span class="old-price">R$ ${parseFloat(prod.precoAntigo).toFixed(2).replace('.', ',')}</span>` : ''}
          <span class="current-price">R$ ${parseFloat(prod.preco).toFixed(2).replace('.', ',')}</span>
        </div>
        <button class="add-to-cart-btn" data-id="${prod.id}">+ Adicionar</button>
      </div>
    </div>
  `;

  // Clique na imagem → abre modal de detalhes
  card.querySelector('.product-image-wrapper').addEventListener('click', () => {
    openProductModal(prod);
  });

  // Clique no botão → adiciona ao carrinho direto
  card.querySelector('.add-to-cart-btn').addEventListener('click', () => {
    addToCart(prod);
    updateCartBadge();
    renderCartItems();
    document.getElementById('cartSidebar')?.classList.add('open');
  });

  productsGrid.appendChild(card);
}
