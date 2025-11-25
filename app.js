// =======================================
// 🔥 IMPORTS FIREBASE DESDE VENTANA GLOBAL
// =======================================
// (Esto viene del index.html)
import {
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = window.db;

// =======================================
// ESTADO EN MEMORIA
// =======================================
let map;
let parties = [];
let lastClickLatLng = null;
let currentParty = null;
let currentTheme = "dark";

// =======================================
// ESTILOS DEL MAPA
// =======================================
const darkNeonStyle = [...]; // ——— (usa tus estilos EXACTOS)
const lightAppleStyle = [...]; // ——— (usa tus estilos EXACTOS)

// =======================================
// TEMA
// =======================================
function applyTheme(theme) {
  currentTheme = theme;
  const body = document.body;

  if (theme === "light") body.classList.add("theme-light");
  else body.classList.remove("theme-light");

  if (map) {
    map.setOptions({
      styles: theme === "light" ? lightAppleStyle : darkNeonStyle,
    });
  }

  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) themeBtn.textContent = theme === "light" ? "🌙" : "☀️";

  localStorage.setItem("dondeespe_theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem("dondeespe_theme");
  const initial = saved || "dark";
  applyTheme(initial);
}

// =======================================
// TABS TEXTOS
// =======================================
const TAB_MESSAGES = {
  live: "Mostrando fiestas activas ahora cerca de ti.",
  hot: "Zonas con más fiestas esta semana.",
  featured: "Eventos destacados.",
  today: "Fiestas de HOY.",
  promos: "Promociones de tragos.",
};

// =======================================
// 🔥 INICIALIZAR GOOGLE MAPS
// =======================================
function initGoogleMap() {
  const lima = { lat: -12.0464, lng: -77.0428 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: lima,
    zoom: 13,
    disableDefaultUI: true,
    styles: darkNeonStyle,
  });

  map.addListener("click", (e) => {
    lastClickLatLng = e.latLng;
    openPartyModal();
  });

  initUI();
  initTheme();

  // 🔥 Cargar fiestas desde Firestore al iniciar
  loadPartiesFromFirebase();
}

window.initGoogleMap = initGoogleMap;

// =======================================
// 🔥 UI
// =======================================
function initUI() {
  const modal = document.getElementById("partyModal");
  const closeModal = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const locateBtn = document.getElementById("locateMeBtn");
  const scrollBtn = document.getElementById("scrollToMap");
  const form = document.getElementById("partyForm");
  const tabs = document.querySelectorAll(".map-tab");
  const tabInfo = document.getElementById("tabInfoText");

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      tabInfo.textContent = TAB_MESSAGES[btn.dataset.tab] || "";
    });
  });

  closeModal.onclick = closePartyModal;
  cancelBtn.onclick = closePartyModal;

  form.addEventListener("submit", handleCreateParty);

  locateBtn.onclick = () => {
    navigator.geolocation.getCurrentPosition((p) => {
      const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      map.setCenter(pos);
      map.setZoom(16);
    });
  };

  modal.addEventListener("click", (e) => {
    if (e.target.id === "partyModal") closePartyModal();
  });

  if (scrollBtn) {
    scrollBtn.onclick = () =>
      document.getElementById("mapSection").scrollIntoView({ behavior: "smooth" });
  }

  const themeToggle = document.getElementById("themeToggle");
  themeToggle.onclick = () => {
    const next = currentTheme === "dark" ? "light" : "dark";
    applyTheme(next);
  };
}

// =======================================
// MODAL
// =======================================
function openPartyModal() {
  document.getElementById("partyModal").classList.remove("hidden");
}

function closePartyModal() {
  document.getElementById("partyModal").classList.add("hidden");
  document.getElementById("partyForm").reset();
  lastClickLatLng = null;
}

// =======================================
// 🔥 CREAR FIESTA (GUARDAR EN FIRESTORE)
// =======================================
async function handleCreateParty(e) {
  e.preventDefault();

  if (!lastClickLatLng) return alert("Haz click en el mapa primero.");

  const party = {
    name: document.getElementById("partyName").value.trim(),
    description: document.getElementById("partyDescription").value.trim(),
    date: document.getElementById("partyDate").value,
    time: document.getElementById("partyTime").value,
    zone: document.getElementById("partyZone").value,
    type: document.getElementById("partyType").value,
    genre: document.getElementById("partyGenre").value,
    address: document.getElementById("partyAddress").value.trim(),
    lat: lastClickLatLng.lat(),
    lng: lastClickLatLng.lng(),
    attendees: 0,
    views: 0,
    createdAt: Date.now(),
  };

  try {
    // 🔥 Guardar en Firestore
    const docRef = await addDoc(collection(db, "parties"), party);
    party.id = docRef.id;

    // Añadir al mapa inmediatamente
    addPartyMarker(party);

    closePartyModal();
    alert("🔥 Fiesta creada con éxito!");
  } catch (err) {
    console.error("Error al guardar fiesta:", err);
    alert("Error guardando la fiesta.");
  }
}

// =======================================
// 🔥 CARGAR FIESTAS DESDE FIREBASE
// =======================================
async function loadPartiesFromFirebase() {
  const snap = await getDocs(collection(db, "parties"));
  snap.forEach((doc) => {
    const p = { id: doc.id, ...doc.data() };
    parties.push(p);
    addPartyMarker(p);
  });
}

// =======================================
// ÍCONO DE MARCADOR
// =======================================
function getMarkerIcon(party) {
  return {
    path: "M 0,-2 L 1,0 L 0,2 L -1,0 Z",
    fillColor: "#ff00ff",
    strokeColor: "#00ffff",
    strokeWeight: 3,
    scale: 18,
  };
}

// =======================================
// MARCADOR
// =======================================
function addPartyMarker(party) {
  const marker = new google.maps.Marker({
    position: { lat: party.lat, lng: party.lng },
    map,
    icon: getMarkerIcon(party),
  });

  marker.addListener("click", () => {
    party.views++;
    openPartyPanel(party);
  });
}

// =======================================
// PANEL
// =======================================
function openPartyPanel(party) {
  currentParty = party;

  document.getElementById("partyDetailPanel").classList.remove("hidden");

  document.getElementById("partyPanelName").textContent = party.name;
  document.getElementById("partyPanelGenre").textContent = party.genre;
  document.getElementById("partyPanelType").textContent = party.type;
  document.getElementById("partyPanelZone").textContent = party.zone;
  document.getElementById("partyPanelDate").textContent = party.date;
  document.getElementById("partyPanelHour").textContent = party.time;
  document.getElementById("partyPanelAddress").textContent = "📍 " + (party.address || "");
  document.getElementById("partyPanelDescription").textContent = party.description;
  document.getElementById("partyPanelAttendees").textContent = party.attendees;
  document.getElementById("partyPanelViews").textContent = party.views;

  document.getElementById("closePartyPanel").onclick = () => {
    document.getElementById("partyDetailPanel").classList.add("hidden");
  };
}
