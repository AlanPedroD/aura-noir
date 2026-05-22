// script.js — Página inicial (index.html)
import { injectNav, updateCartBadge, renderCartItems, showCartToast } from './nav.js';
import { addToCart } from './cart.js';
import { injectProductModal, openProductModal } from './productModal.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

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

// ── 1. Nav + modal ────────────────────────────────────────────────────────────
injectNav('index');
injectProductModal();

// ── 2. Scroll reveal ──────────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));

// ── 3. Parallax quote ─────────────────────────────────────────────────────────
const quoteBg = document.getElementById('quoteBg');
if (quoteBg) {
  window.addEventListener('scroll', () => {
    quoteBg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
  });
}

// ── 4. Carrega produtos em destaque do Firebase ───────────────────────────────
async function loadFeaturedProducts() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  grid.innerHTML = `<p style="grid-column:1/-1;font-family:'Cormorant Garamond';color:var(--text-muted);text-align:center;">Carregando destaques...</p>`;

  try {
    const q = query(
      collection(db, "produtos"),
      where("destaque", "==", true),
      limit(3)
    );
    const snapshot = await getDocs(q);

    grid.innerHTML = '';

    if (snapshot.empty) {
      grid.innerHTML = `<p style="grid-column:1/-1;font-family:'Cormorant Garamond';color:var(--text-muted);text-align:center;opacity:0.6;">Nenhum produto em destaque no momento.</p>`;
      return;
    }

    snapshot.forEach(doc => {
      const prod = { id: doc.id, ...doc.data() };
      renderFeaturedCard(prod, grid);
    });

    lucide.createIcons();
  } catch (err) {
    console.error('Erro ao carregar destaques:', err);
  }
}

// ── 5. Renderiza card de destaque ─────────────────────────────────────────────
function renderFeaturedCard(prod, grid) {
  const hasOldPrice = prod.promocional && prod.precoAntigo;

  let badgeHtml = '';
  if (prod.tag === 'mais-vendido') badgeHtml = `<span class="featured-badge badge-mais-vendido">Mais Vendido</span>`;
  else if (prod.tag === 'novo')    badgeHtml = `<span class="featured-badge badge-novo">Novo</span>`;
  else if (prod.tag === 'promocao') badgeHtml = `<span class="featured-badge badge-promocao">Promoção</span>`;

  const card = document.createElement('div');
  card.className = 'featured-card reveal';
  card.style.transitionDelay = `${grid.children.length * 0.15}s`;

  card.innerHTML = `
    ${badgeHtml}
    <div class="featured-img-wrapper" title="Ver detalhes">
      <img src="${prod.imagemUrl || 'https://via.placeholder.com/400x400?text=Aura+Noir'}" alt="${prod.nome}">
      <div class="featured-img-overlay"></div>
    </div>
    <div class="featured-info">
      <span class="featured-brand">${prod.subtitulo || 'LUMIÈRE'}</span>
      <h3 class="featured-name">${prod.nome}</h3>
      <p class="featured-notes">${prod.notasOlfativas || ''}</p>
      ${prod.descricao ? `<p class="featured-desc">${prod.descricao}</p>` : ''}
      <div class="featured-footer">
        <div class="featured-price">
          ${hasOldPrice ? `<span class="featured-old-price">R$ ${parseFloat(prod.precoAntigo).toFixed(2).replace('.', ',')}</span>` : ''}
          <span class="featured-current-price">R$ ${parseFloat(prod.preco).toFixed(2).replace('.', ',')}</span>
        </div>
        <button class="featured-add-btn">
          <i data-lucide="shopping-bag"></i> Adicionar
        </button>
      </div>
    </div>
    <div class="featured-hover-line"></div>
  `;

  // Clique na imagem → abre modal de detalhes
  card.querySelector('.featured-img-wrapper').addEventListener('click', () => {
    openProductModal(prod);
  });

  // Clique no botão → adiciona ao carrinho direto
  card.querySelector('.featured-add-btn').addEventListener('click', () => {
  addToCart(prod);
  updateCartBadge();
  renderCartItems();
  showCartToast();
});

  grid.appendChild(card);
  observer.observe(card);
}

loadFeaturedProducts();
