// ======================
// FIREBASE — CONFIG REAL TUYO
// ======================
// ¡IMPORTANTE! Hemos añadido 'onValue' para la lectura en tiempo real
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// CONFIG DE TU PROYECTO REAL
const firebaseConfig = {
  apiKey: "AIzaSyAsxlN1GC0OUyagYoquKd5R56C-PrGBNrY",
  authDomain: "dondeespe-realproyecto.firebaseapp.com",
  databaseURL: "https://dondeespe-realproyecto-default-rtdb.firebaseio.com",
  projectId: "dondeespe-realproyecto",
  storageBucket: "dondeespe-realproyecto.firebasestorage.app",
  messagingSenderId: "302761804310",
  appId: "1:302761804310:web:b0340496700f4c3eab6b37"
};

// Inicializar
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ======================
// ESTADO EN MEMORIA
// ======================
let map;
let parties = [];
// Almacenar los marcadores en un array para poder borrarlos al actualizar la lista
let markers = []; 
let lastClickLatLng = null;
let currentParty = null;
let currentTheme = "dark";

// ======================
// ESTILOS DEL MAPA
// ======================
const darkNeonStyle = [
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "landscape", elementType: "all", stylers: [{ color: "#08304b" }] },
  { featureType: "water", elementType: "all", stylers: [{ color: "#021019" }] }
];

const lightAppleStyle = [
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#4a4a4a" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d2e7ff" }] }
];

// ======================
// TEMA CLARO/OSCURO
// ======================
function applyTheme(theme) {
  currentTheme = theme;
  const body = document.body;

  if (theme === "light") body.classList.add("theme-light");
  else body.classList.remove("theme-light");

  if (map) {
    const style = theme === "light" ? lightAppleStyle : darkNeonStyle;
    map.setOptions({ styles: style });
  }

  const btn = document.getElementById("themeToggle");
  btn.textContent = theme === "light" ? "🌙" : "☀️";

  localStorage.setItem("dondeespe_theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem("dondeespe_theme");
  let initial = saved || "dark";
  applyTheme(initial);
}

// ======================
// TABS
// ======================
const TAB_MESSAGES = {
  live: "Mostrando fiestas activas ahora cerca de ti.",
  hot: "Zonas calientes con más movimiento.",
  featured: "Eventos destacados por DondeEsPe.",
  today: "Eventos que ocurren hoy.",
  promos: "Promociones activas de tragos."
};

// ======================
// INICIALIZAR MAPA
// ======================
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
  // 🔥 CARGAMOS LAS FIESTAS AQUÍ AL INICIAR EL MAPA
  loadParties(); 
}

window.initGoogleMap = initGoogleMap;

// ======================
// UI / EVENTOS
// ======================
function initUI() {
  const modal = document.getElementById("partyModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const partyForm = document.getElementById("partyForm");
  const locateMeBtn = document.getElementById("locateMeBtn");
  const scrollBtn = document.getElementById("scrollToMap");
  const themeToggleBtn = document.getElementById("themeToggle");

  // TABS
  const tabButtons = document.querySelectorAll(".map-tab");
  const tabInfo = document.getElementById("tabInfoText");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      tabInfo.textContent = TAB_MESSAGES[btn.dataset.tab];
    });
  });

  // Modal
  closeModalBtn.addEventListener("click", closePartyModal);
  cancelBtn.addEventListener("click", closePartyModal);

  // Enviar formulario
  partyForm.addEventListener("submit", handleCreateParty);

  // Ubicarme
  locateMeBtn.addEventListener("click", () => {
    if (!navigator.geolocation) return alert("Tu navegador no soporta geolocalización.");

    navigator.geolocation.getCurrentPosition((pos) => {
      const myPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      map.setCenter(myPos);
      map.setZoom(16);
    });
  });

  // Toggle de tema
  themeToggleBtn.addEventListener("click", () => {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });

  // Scroll al mapa
  if (scrollBtn) {
    scrollBtn.onclick = () => {
      document.getElementById("mapSection").scrollIntoView({ behavior: "smooth" });
    };
  }
}

function openPartyModal() {
  document.getElementById("partyModal").classList.remove("hidden");
}

function closePartyModal() {
  const modal = document.getElementById("partyModal");
  modal.classList.add("hidden");
  document.getElementById("partyForm").reset();
  lastClickLatLng = null;
}

// ======================
// GUARDAR EN FIREBASE
// ======================
function savePartyToFirebase(party) {
  const partiesRef = ref(db, "parties");
  const newPartyRef = push(partiesRef);
  return set(newPartyRef, party);
}

// ======================
// CARGA Y LECTURA EN TIEMPO REAL
// ======================
function loadParties() {
  const partiesRef = ref(db, "parties");
  
  // onValue escucha en tiempo real: se dispara al inicio y en cada cambio
  onValue(partiesRef, (snapshot) => {
    // 1. Limpiamos los marcadores existentes en el mapa
    markers.forEach(m => m.setMap(null)); 
    markers = []; 
    parties = []; // Limpiamos el array local

    // 2. Recorremos la base de datos y repintamos
    snapshot.forEach((childSnapshot) => {
      const partyData = childSnapshot.val();
      partyData.firebaseKey = childSnapshot.key; // Guardamos la clave única
      
      parties.push(partyData);
      addPartyMarker(partyData); // Repinta el marcador en el mapa
    });

    console.log(`[Firebase RT] Cargadas/Actualizadas ${parties.length} fiestas en tiempo real.`);
  });
}

// ======================
// CREAR FIESTA 
// ======================
async function handleCreateParty(event) {
  event.preventDefault();

  if (!lastClickLatLng) {
    alert("Haz click en el mapa para seleccionar la ubicación.");
    return;
  }
    
  // 🛑🛑 TEMPORAL: Desactivamos la lógica del flyer para confirmar el guardado.
  // const flyerFile = document.getElementById("partyFlyer").files[0];
  // const flyerUrl = flyerFile ? URL.createObjectURL(flyerFile) : null;
  const flyerUrl = null; // <= GUARDAREMOS NULL EN FIREBASE POR AHORA

  const party = {
    name: document.getElementById("partyName").value.trim(),
    description: document.getElementById("partyDescription").value.trim(),
    date: document.getElementById("partyDate").value,
    time: document.getElementById("partyTime").value,
    zone: document.getElementById("partyZone").value,
    type: document.getElementById("partyType").value,
    genre: document.getElementById("partyGenre").value,
    address: document.getElementById("partyAddress").value.trim(),
    phone: document.getElementById("partyPhone").value.trim(),
    instagram: document.getElementById("partyInstagram").value.trim(),
    capacity: document.getElementById("partyCapacityRange").value,
    flyerUrl: flyerUrl, // Usamos null temporalmente
    attendees: 0,
    views: 0,
    lat: lastClickLatLng.lat(),
    lng: lastClickLatLng.lng(),
  };

  try {
    // 1. 🔥 ESPERAMOS LA CONFIRMACIÓN DE FIREBASE (AWAIT)
    await savePartyToFirebase(party); 
    
    closePartyModal();
    alert("¡Fiesta publicada exitosamente! 🎉");

  } catch (error) {
    // 3. MANEJO DE ERRORES: Revisar la consola del navegador (F12)
    console.error("Error al guardar la fiesta en Firebase:", error);
    alert("⚠️ Error al publicar. Revisa la consola (F12) para el error específico.");
  }
}

// ======================
// ICONO NEÓN
// ======================
function getMarkerIcon(party) {
  return {
    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
    fillColor: "#ff00ff",
    fillOpacity: 1,
    strokeColor: "#00ffff",
    strokeWeight: 2,
    scale: 10,
  };
}

// ======================
// AGREGAR MARCADOR
// ======================
function addPartyMarker(party) {
  const marker = new google.maps.Marker({
    position: { lat: party.lat, lng: party.lng },
    map: map,
    icon: getMarkerIcon(party),
  });

  // Guardamos el marcador en la lista global
  markers.push(marker);

  marker.addListener("click", () => {
    party.views = (party.views || 0) + 1;
    openPartyPanel(party);
  });
}

// ======================
// PANEL DE FIESTA
// ======================
function openPartyPanel(party) {
  currentParty = party;
  updatePartyPanel(party);
  document.getElementById("partyDetailPanel").classList.remove("hidden");
}

function updatePartyPanel(party) {
  document.getElementById("partyPanelFlyer").src = party.flyerUrl || "";
  document.getElementById("partyPanelName").textContent = party.name;
  document.getElementById("partyPanelGenre").textContent = party.genre;
  document.getElementById("partyPanelType").textContent = party.type;
  document.getElementById("partyPanelZone").textContent = party.zone;
  document.getElementById("partyPanelDate").textContent = party.date;
  document.getElementById("partyPanelHour").textContent = party.time;
  document.getElementById("partyPanelAddress").textContent = party.address ? "📍 " + party.address : "";
  document.getElementById("partyPanelDescription").textContent = party.description;
  document.getElementById("partyPanelPhone").textContent = party.phone ? "📞 " + party.phone : "📞 -";
  document.getElementById("partyPanelInstagram").textContent = party.instagram ? "@" + party.instagram : "@ -";

  document.getElementById("partyPanelAttendees").textContent = party.attendees;
  document.getElementById("partyPanelViews").textContent = party.views;

  const joinBtn = document.getElementById("partyPanelJoinBtn");
  const storageKey = "joined_" + party.id;

  if (localStorage.getItem(storageKey)) {
    joinBtn.textContent = "Listo, nos vemos ahí 🎉";
    joinBtn.disabled = true;
  } else {
    joinBtn.textContent = "Quiero ir 🔥";
    joinBtn.disabled = false;

    joinBtn.onclick = () => {
      party.attendees++;
      document.getElementById("partyPanelAttendees").textContent = party.attendees;
      localStorage.setItem(storageKey, true);
      joinBtn.textContent = "Listo, nos vemos ahí 🎉";
      joinBtn.disabled = true;
    };
  }
}
