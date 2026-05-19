// ─── productModal.js — Modal de detalhes do produto ──────────────────────────
// Usado por script.js (index) e produtos.js (loja)
// Importar: import { injectProductModal, openProductModal } from './productModal.js';

import { addToCart } from './cart.js';
import { updateCartBadge, renderCartItems } from './nav.js';

let modalInjected = false;

// ── Injeta o HTML do modal uma única vez no body ──────────────────────────────
export function injectProductModal() {
  if (modalInjected) return;
  modalInjected = true;

  const html = `
  <div class="product-detail-overlay" id="productDetailOverlay">
    <div class="product-detail-modal" id="productDetailModal">

      <!-- Lado esquerdo: imagem -->
      <div class="pdm-image-side">
        <img id="pdmImage" src="" alt="">
        <span class="pdm-badge" id="pdmBadge" style="display:none;"></span>
      </div>

      <!-- Lado direito: conteúdo -->
      <div class="pdm-content-side">
        <button class="pdm-close-btn" id="pdmCloseBtn" aria-label="Fechar">
          <i data-lucide="x"></i>
        </button>

        <div class="pdm-brand" id="pdmBrand"></div>
        <h2 class="pdm-name" id="pdmName"></h2>
        <p class="pdm-notes" id="pdmNotes"></p>
        <div class="pdm-divider"></div>
        <p class="pdm-description" id="pdmDescription"></p>

        <div class="pdm-price-row">
          <div>
            <div class="pdm-old-price" id="pdmOldPrice" style="display:none;"></div>
            <div class="pdm-current-price" id="pdmCurrentPrice"></div>
          </div>
        </div>

        <button class="pdm-add-btn" id="pdmAddBtn">
          <i data-lucide="shopping-bag"></i> Adicionar à Sacola
        </button>
      </div>

    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
  lucide.createIcons();

  // Fechar ao clicar no X
  document.getElementById('pdmCloseBtn').addEventListener('click', closeProductModal);

  // Fechar ao clicar fora do modal
  document.getElementById('productDetailOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('productDetailOverlay')) {
      closeProductModal();
    }
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProductModal();
  });
}

// ── Abre o modal com os dados do produto ─────────────────────────────────────
export function openProductModal(prod) {
  // Imagem
  document.getElementById('pdmImage').src = prod.imagemUrl || '';
  document.getElementById('pdmImage').alt = prod.nome;

  // Badge
  const badge = document.getElementById('pdmBadge');
  if (prod.tag) {
    badge.style.display = 'block';
    badge.textContent = tagLabel(prod.tag);
    badge.className = `pdm-badge ${tagClass(prod.tag)}`;
  } else {
    badge.style.display = 'none';
  }

  // Textos
  document.getElementById('pdmBrand').textContent = prod.subtitulo || 'LUMIÈRE';
  document.getElementById('pdmName').textContent = prod.nome;
  document.getElementById('pdmNotes').textContent = prod.notasOlfativas || '';
  document.getElementById('pdmDescription').textContent = prod.descricao || 'Uma fragrância única, criada para quem não teme ser lembrado.';

  // Preço
  const oldPriceEl = document.getElementById('pdmOldPrice');
  if (prod.promocional && prod.precoAntigo) {
    oldPriceEl.style.display = 'block';
    oldPriceEl.textContent = `R$ ${parseFloat(prod.precoAntigo).toFixed(2).replace('.', ',')}`;
  } else {
    oldPriceEl.style.display = 'none';
  }
  document.getElementById('pdmCurrentPrice').textContent = `R$ ${parseFloat(prod.preco).toFixed(2).replace('.', ',')}`;

  // Botão adicionar
  const addBtn = document.getElementById('pdmAddBtn');
  addBtn.onclick = () => {
    addToCart(prod);
    updateCartBadge();
    renderCartItems();
    closeProductModal();
    document.getElementById('cartSidebar')?.classList.add('open');
  };

  // Abre
  document.getElementById('productDetailOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  lucide.createIcons();
}

// ── Fecha o modal ─────────────────────────────────────────────────────────────
export function closeProductModal() {
  document.getElementById('productDetailOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function tagLabel(tag) {
  const map = { 'mais-vendido': 'Mais Vendido', 'novo': 'Novo', 'promocao': 'Promoção' };
  return map[tag] || '';
}

function tagClass(tag) {
  const map = { 'mais-vendido': 'badge-mais-vendido', 'novo': 'badge-novo', 'promocao': 'badge-promocao' };
  return map[tag] || '';
}
