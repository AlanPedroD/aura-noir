// ─── cart.js — Módulo compartilhado de carrinho ───────────────────────────
// Usado por index.html e produtos.html para manter o carrinho sincronizado
// via localStorage entre páginas.

const CART_KEY = 'auraNoir_cart';

// ── Leitura / Escrita no localStorage ────────────────────────────────────────
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch { return []; }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // Dispara evento para sincronizar badge em outras instâncias
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
}

// ── Operações do carrinho ─────────────────────────────────────────────────────
export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  return cart;
}

export function changeQuantity(id, change) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
  return [];
}

export function calculateSubtotal(cart) {
  return cart.reduce((acc, item) => acc + parseFloat(item.preco) * item.quantity, 0);
}

export function getTotalItems(cart) {
  return cart.reduce((acc, item) => acc + item.quantity, 0);
}
