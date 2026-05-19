import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBke7blmmwi9jKM9_Pd050A17a-Mz_as9E",
  authDomain: "perfumaria-34f48.firebaseapp.com",
  projectId: "perfumaria-34f48",
  storageBucket: "perfumaria-34f48.firebasestorage.app",
  messagingSenderId: "633215543720",
  appId: "1:633215543720:web:90650181ecd576a64d159d"
};

const ADMIN_EMAIL = "aroma@gmail.com";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ─────────────────────────────────────────────────────────────────────────────
// Proteção de rota
// ─────────────────────────────────────────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {

  // Não logado
  if (!user) {
    window.location.href = '/pages/login.html';
    return;
  }

  // Logado mas não autorizado
  if (user.email !== ADMIN_EMAIL) {

    alert("Acesso não autorizado.");

    await signOut(auth);

    window.location.href = '/pages/login.html';

    return;
  }

  // Admin autorizado
  const emailEl = document.getElementById('adminUserEmail');

  if (emailEl) {
    emailEl.textContent = user.email;
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', async () => {

  const confirmLogout = confirm("Deseja realmente sair do painel?");

  if (!confirmLogout) return;

  try {

    await signOut(auth);

    window.location.href = '/pages/login.html';

  } catch (err) {

    console.error(err);

    alert("Erro ao sair da conta.");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary
// ─────────────────────────────────────────────────────────────────────────────
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/ddojjqwky/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "nova_loja_powernutri";

lucide.createIcons();

// ─────────────────────────────────────────────────────────────────────────────
// Elementos DOM
// ─────────────────────────────────────────────────────────────────────────────
const form = document.getElementById('productForm');
const prodPromo = document.getElementById('prodPromo');
const prodDestaque = document.getElementById('prodDestaque');
const oldPriceWrapper = document.getElementById('oldPriceWrapper');
const prodImageFile = document.getElementById('prodImageFile');
const imagePreview = document.getElementById('imagePreview');
const prodImageUrl = document.getElementById('prodImageUrl');
const adminProductsList = document.getElementById('adminProductsList');
const productIdInput = document.getElementById('productId');
const formTitle = document.getElementById('formTitle');
const saveBtn = document.getElementById('saveBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// ─────────────────────────────────────────────────────────────────────────────
// Promoção
// ─────────────────────────────────────────────────────────────────────────────
prodPromo.addEventListener('change', () => {

  const oldPriceInput = document.getElementById('prodOldPrice');

  if (prodPromo.checked) {

    oldPriceWrapper.classList.remove('hidden');
    oldPriceInput.required = true;

  } else {

    oldPriceWrapper.classList.add('hidden');
    oldPriceInput.required = false;
    oldPriceInput.value = '';
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Upload imagem Cloudinary
// ─────────────────────────────────────────────────────────────────────────────
prodImageFile.addEventListener('change', async (e) => {

  const file = e.target.files[0];

  if (!file) return;

  saveBtn.disabled = true;
  saveBtn.textContent = "Enviando Imagem...";

  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {

    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.secure_url) {

      prodImageUrl.value = data.secure_url;

      imagePreview.src = data.secure_url;

      imagePreview.classList.remove('hidden');

      alert("Imagem enviada com sucesso!");
    }

  } catch (err) {

    console.error(err);

    alert("Erro ao realizar upload da imagem.");

  } finally {

    saveBtn.disabled = false;

    saveBtn.textContent =
      productIdInput.value
        ? "Atualizar Produto"
        : "Salvar Produto na Loja";
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Lista em tempo real
// ─────────────────────────────────────────────────────────────────────────────
onSnapshot(collection(db, "produtos"), (snapshot) => {

  adminProductsList.innerHTML = "";

  if (snapshot.empty) {

    adminProductsList.innerHTML =
      "<p>Nenhum produto em estoque.</p>";

    return;
  }

  snapshot.forEach(docSnap => {

    const p = docSnap.data();

    const id = docSnap.id;

    const div = document.createElement('div');

    div.className = "product-list-item";

    div.innerHTML = `
      <img src="${p.imagemUrl || 'https://via.placeholder.com/50'}" alt="">

      <div class="product-list-details">

        <strong>${p.nome}</strong>

        ${p.destaque
          ? `<span style="color:#c9a84c;font-size:0.7rem;margin-left:6px;">⭐ Destaque</span>`
          : ''
        }

        <br>

        <small>
          R$ ${parseFloat(p.preco).toFixed(2)}

          ${p.promocional
            ? `(Promo - De R$ ${parseFloat(p.precoAntigo).toFixed(2)})`
            : ''
          }
        </small>

      </div>

      <div class="product-list-actions">

        <button class="action-btn edit-btn" data-id="${id}">
          <i data-lucide="edit-2"></i>
        </button>

        <button class="action-btn delete-btn" data-id="${id}">
          <i data-lucide="trash-2"></i>
        </button>

      </div>
    `;

    div.querySelector('.edit-btn')
      .addEventListener('click', () => populateFormForEdit(id, p));

    div.querySelector('.delete-btn')
      .addEventListener('click', () => deleteProduct(id));

    adminProductsList.appendChild(div);
  });

  lucide.createIcons();
});

// ─────────────────────────────────────────────────────────────────────────────
// Salvar / editar produto
// ─────────────────────────────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {

  e.preventDefault();

  const productData = {

    nome: document.getElementById('prodName').value.trim(),

    subtitulo: document.getElementById('prodSub').value.trim(),

    notasOlfativas: document.getElementById('prodNotes').value.trim(),

    descricao: document.getElementById('prodDesc').value.trim(),

    tag: document.getElementById('prodTag').value,

    preco: parseFloat(document.getElementById('prodPrice').value),

    promocional: prodPromo.checked,

    precoAntigo: prodPromo.checked
      ? parseFloat(document.getElementById('prodOldPrice').value)
      : null,

    destaque: prodDestaque.checked,

    imagemUrl: prodImageUrl.value
  };

  if (!productData.imagemUrl) {

    alert("Por favor, selecione e aguarde o upload de uma imagem.");

    return;
  }

  try {

    saveBtn.disabled = true;

    const id = productIdInput.value;

    if (id) {

      await updateDoc(doc(db, "produtos", id), productData);

      alert("Perfume atualizado com sucesso!");

    } else {

      await addDoc(collection(db, "produtos"), productData);

      alert("Perfume cadastrado com sucesso na Aura Noir!");
    }

    resetAdminForm();

  } catch (err) {

    console.error(err);

    alert("Erro ao salvar dados no Firebase.");

  } finally {

    saveBtn.disabled = false;
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Editar produto
// ─────────────────────────────────────────────────────────────────────────────
function populateFormForEdit(id, p) {

  formTitle.textContent = "Editar Perfume";

  productIdInput.value = id;

  document.getElementById('prodName').value = p.nome;

  document.getElementById('prodSub').value = p.subtitulo;

  document.getElementById('prodNotes').value = p.notasOlfativas;

  document.getElementById('prodDesc').value = p.descricao || '';

  document.getElementById('prodTag').value = p.tag;

  document.getElementById('prodPrice').value = p.preco;

  prodPromo.checked = p.promocional;

  if (p.promocional) {

    oldPriceWrapper.classList.remove('hidden');

    document.getElementById('prodOldPrice').value = p.precoAntigo;

  } else {

    oldPriceWrapper.classList.add('hidden');

    document.getElementById('prodOldPrice').value = '';
  }

  prodDestaque.checked = p.destaque || false;

  prodImageUrl.value = p.imagemUrl;

  imagePreview.src = p.imagemUrl;

  imagePreview.classList.remove('hidden');

  saveBtn.textContent = "Atualizar Produto";

  cancelEditBtn.classList.remove('hidden');

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Deletar produto
// ─────────────────────────────────────────────────────────────────────────────
async function deleteProduct(id) {

  const confirmDelete =
    confirm("Tem certeza que deseja remover esta essência da loja?");

  if (!confirmDelete) return;

  try {

    await deleteDoc(doc(db, "produtos", id));

    alert("Produto removido.");

  } catch (err) {

    console.error(err);

    alert("Erro ao remover produto.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Resetar formulário
// ─────────────────────────────────────────────────────────────────────────────
function resetAdminForm() {

  form.reset();

  productIdInput.value = "";

  formTitle.textContent = "Adicionar Novo Perfume";

  saveBtn.textContent = "Salvar Produto na Loja";

  oldPriceWrapper.classList.add('hidden');

  imagePreview.classList.add('hidden');

  prodImageUrl.value = "";

  cancelEditBtn.classList.add('hidden');

  prodDestaque.checked = false;
}

cancelEditBtn.addEventListener('click', resetAdminForm);