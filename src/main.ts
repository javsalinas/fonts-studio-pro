import { supabase } from './supabaseClient';
import { saveFont, getAllFonts, deleteFont, StoredFont } from './fontStorage';

// --- SELECTORES UI ---
const authSection = document.getElementById('auth-section') as HTMLElement;
const appSection = document.getElementById('app-section') as HTMLElement;
const userDisplay = document.getElementById('user-display') as HTMLElement;

const emailInput = document.getElementById('auth-email') as HTMLInputElement;
const passwordInput = document.getElementById('auth-password') as HTMLInputElement;
const btnLogin = document.getElementById('btn-login') as HTMLButtonElement;
const btnSignup = document.getElementById('btn-signup') as HTMLButtonElement;
const btnLogout = document.getElementById('btn-logout') as HTMLButtonElement;

const fontUpload = document.getElementById('font-upload') as HTMLInputElement;
const fontListDiv = document.getElementById('font-list') as HTMLDivElement;
const stickerText = document.getElementById('sticker-text') as HTMLInputElement;
const canvas = document.getElementById('sticker-canvas') as HTMLCanvasElement;
const btnDownload = document.getElementById('btn-download') as HTMLButtonElement;

// --- ESTADO ---
let currentUser: any = null;
let selectedFont: StoredFont | null = null;
const ctx = canvas.getContext('2d');

// --- LÓGICA DE AUTENTICACIÓN ---
async function updateUI() {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;

  if (user) {
    authSection.style.display = 'none';
    appSection.style.display = 'flex';
    userDisplay.textContent = user.email;
    await loadUserFonts();
  } else {
    authSection.style.display = 'flex';
    appSection.style.display = 'none';
  }
}

btnLogin.onclick = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  });
  if (error) alert(error.message);
  else updateUI();
};

btnSignup.onclick = async () => {
  const { error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value,
  });
  if (error) alert(error.message);
  else alert('Cuenta creada. Revisa tu email para confirmar.');
};

btnLogout.onclick = async () => {
  await supabase.auth.signOut();
  updateUI();
};

// --- LÓGICA DE FUENTES ---
async function loadUserFonts() {
  if (!currentUser) return;
  
  try {
    const fonts = await getAllFonts(currentUser.id);
    fontListDiv.innerHTML = '';

    for (const font of fonts) {
      // 1. Registrar la fuente en el navegador dinámicamente
      const fontFace = new FontFace(font.name, `url(${font.url})`);
      await fontFace.load();
      document.fonts.add(fontFace);

      // 2. Crear el elemento de la lista
      const div = document.createElement('div');
      div.className = 'font-item';
      div.innerHTML = `
        <span style="font-family: '${font.name}'; font-size: 1.2rem;">${font.name}</span>
        <button class="secondary logout-btn" data-id="${font.id}" data-path="${font.file_path}">Eliminar</button>
      `;
      
      div.onclick = (e) => {
        if ((e.target as HTMLElement).tagName === 'BUTTON') return;
        selectFont(font, div);
      };

      div.querySelector('button')?.addEventListener('click', async (e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        const id = btn.dataset.id!;
        const path = btn.dataset.path!;
        await deleteFont(id, path);
        loadUserFonts();
      });

      fontListDiv.appendChild(div);
    }
  } catch (e) {
    console.error('Error cargando fuentes:', e);
  }
}

function selectFont(font: StoredFont, element: HTMLElement) {
  selectedFont = font;
  document.querySelectorAll('.font-item').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  drawSticker();
}

fontUpload.onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !currentUser) return;

  try {
    await saveFont(file, currentUser.id);
    alert('Fuente subida con éxito');
    loadUserFonts();
  } catch (err: any) {
    alert(err.message);
  }
};

// --- LÓGICA DE CANVAS (STICKERS) ---
function drawSticker() {
  if (!ctx || !selectedFont) return;

  const text = stickerText.value || 'Tu Texto Aquí';
  
  // Configuración de calidad
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 500 * dpr;
  canvas.height = 200 * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Estilo del texto
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `60px "${selectedFont.name}"`;

  // Centrar texto
  ctx.fillText(text, 250, 100);
}

stickerText.oninput = drawSticker;

btnDownload.onclick = () => {
  const link = document.createElement('a');
  link.download = 'sticker.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
};

// Inicialización
supabase.auth.onAuthStateChange(() => updateUI());
updateUI();
