// ======================
// ESTADO EN MEMORIA
// ======================
let map;
let parties = [];
let lastClickLatLng = null;
let currentParty = null;
let currentTheme = "dark"; // se ajusta en initTheme()

// ======================
// ESTILO SNAZZY DARK NEON (MODO OSCURO)
// ======================
const darkNeonStyle = [
  { featureType: "all", elementType: "labels", stylers: [{ visibility: "on" }, { hue: "#ff0000" }] },
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#000000" }, { lightness: 13 }] },
  {
    featureType: "all",
    elementType: "labels.icon",
    stylers: [
      { hue: "#ff0000" },
      { saturation: "100" },
      { lightness: "5" },
      { gamma: "0.70" },
      { weight: "7.95" },
      { invert_lightness: true },
    ],
  },
  { featureType: "administrative", elementType: "geometry.fill", stylers: [{ color: "#000000" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#144b53" }, { lightness: 14 }, { weight: 1.4 }],
  },
  { featureType: "landscape", elementType: "all", stylers: [{ color: "#08304b" }] },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#0c4152" }, { lightness: 5 }],
  },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#000000" }] },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0b434f" }, { lightness: 25 }],
  },
  { featureType: "road.arterial", elementType: "geometry.fill", stylers: [{ color: "#000000" }] },
  {
    featureType: "road.arterial",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0b3d51" }, { lightness: 16 }],
  },
  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "transit", elementType: "all", stylers: [{ color: "#146474" }] },
  { featureType: "water", elementType: "all", stylers: [{ color: "#021019" }] },
];

// ======================
// ESTILO CLARO NEUTRAL (APPLE STYLE)
// ======================
const lightAppleStyle = [
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#4a4a4a" }] },
  { featureType: "all", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#e0e0e0" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "geometry.stroke", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f0f0f0" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#e3e3e3" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d2e7ff" }] },
];

// ======================
// TEMA CLARO / OSCURO
// ======================
function applyTheme(theme) {
  currentTheme = theme;
  const body = document.body;

  if (theme === "light") {
    body.classList.add("theme-light");
  } else {
    body.classList.remove("theme-light");
  }

  if (map) {
    const style = theme === "light" ? lightAppleStyle : darkNeonStyle;
    map.setOptions({ styles: style });
  }

  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.textContent = theme === "light" ? "🌙" : "☀️";
  }

  localStorage.setItem("dondeespe_theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem("dondeespe_theme");

  let initial = "dark";

  if (saved === "light" || saved === "dark") {
    initial = saved;
  } else {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      initial = "light";
    }
  }

  applyTheme(initial);
}

// ======================
// TABS MENSAJES
// ======================
const TAB_MESSAGES = {
  live: "Mostrando fiestas activas ahora cerca de ti.",
  hot: "Zonas con más fiestas y movimiento esta semana.",
  featured: "Eventos destacados seleccionados por DondeEsPe.",
  today: "Fiestas que suceden hoy en tu ciudad.",
  promos: "Promociones de tragos y convenios con tiendas.",
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
}

// ======================
// UI & EVENTOS
// ======================
function initUI() {
  const modal = document.getElementById("partyModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const partyForm = document.getElementById("partyForm");
  const locateMeBtn = document.getElementById("locateMeBtn");
  const scrollBtn = document.getElementById("scrollToMap");

  const capacityRange = document.getElementById("partyCapacityRange");
  const capacityValue = document.getElementById("partyCapacityValue");

  const flyerInput = document.getElementById("partyFlyer");
  const fileNameSpan = document.getElementById("fileName");

  const partyPanel = document.getElementById("partyDetailPanel");
  const closePartyPanelBtn = document.getElementById("closePartyPanel");

  const themeToggleBtn = document.getElementById("themeToggle");

  // ===== TABS =====
  const tabButtons = document.querySelectorAll(".map-tab");
  const tabInfo = document.getElementById("tabInfoText");

  if (tabButtons.length) {
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const key = btn.dataset.tab;
        if (TAB_MESSAGES[key]) {
          tabInfo.textContent = TAB_MESSAGES[key];
        }
      });
    });
  }

  // cerrar modal crear fiesta
  closeModalBtn.addEventListener("click", closePartyModal);
  cancelBtn.addEventListener("click", closePartyModal);

  // enviar formulario
  partyForm.addEventListener("submit", handleCreateParty);

  // ubicarme
  locateMeBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      const myPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      map.setCenter(myPos);
      map.setZoom(16);
    });
  });

  // cerrar modal clickeando fuera
  modal.addEventListener("click", (e) => {
    if (e.target.id === "partyModal") closePartyModal();
  });

  // scroll a mapa
  if (scrollBtn) {
    scrollBtn.onclick = () => {
      document.getElementById("mapSection").scrollIntoView({ behavior: "smooth" });
    };
  }

  // slider capacidad
  if (capacityRange && capacityValue) {
    capacityValue.textContent = capacityRange.value;
    capacityRange.addEventListener("input", () => {
      capacityValue.textContent = capacityRange.value;
    });
  }

  // nombre de archivo flyer
  if (flyerInput && fileNameSpan) {
    flyerInput.addEventListener("change", () => {
      fileNameSpan.textContent = flyerInput.files?.length ? flyerInput.files[0].name : "Ningún archivo seleccionado";
    });
  }

  // cerrar panel lateral
  if (closePartyPanelBtn) {
    closePartyPanelBtn.addEventListener("click", () => {
      partyPanel.classList.add("hidden");
      currentParty = null;
    });
  }

  // Toggle de tema
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
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
// CREAR FIESTA
// ======================
function handleCreateParty(event) {
  event.preventDefault();

  if (!lastClickLatLng) return alert("Haz click en el mapa para seleccionar la ubicación.");

  const flyerFile = document.getElementById("partyFlyer").files[0];
  const flyerUrl = flyerFile ? URL.createObjectURL(flyerFile) : null;

  const party = {
    id: Date.now(),
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
    flyerUrl: flyerUrl,
    attendees: 0,
    views: 0,
    lat: lastClickLatLng.lat(),
    lng: lastClickLatLng.lng(),
  };

  parties.push(party);
  addPartyMarker(party);
  closePartyModal();
}

// ======================
// ICONO NEON POR GÉNERO
// ======================
function getMarkerIcon(party) {
  const genre = (party.genre || "").toLowerCase();

  const styles = {
    "electrónica": { fill: "#00eaff", stroke: "#ff00ff" },
    urbano: { fill: "#ffe600", stroke: "#ff8c00" },
    privada: { fill: "#b300ff", stroke: "#e67bff" },
    "pool party": { fill: "#009dff", stroke: "#00eaff" },
    salsa: { fill: "#ff3333", stroke: "#ff7777" },
  };

  const style = styles[genre] || { fill: "#ff00ff", stroke: "#00ffff" };

  return {
    path: "M 0,-2 L 1,0 L 0,2 L -1,0 Z",
    fillColor: style.fill,
    fillOpacity: 1,
    strokeColor: style.stroke,
    strokeWeight: 3,
    scale: 18,
  };
}

// ======================
// MARCADOR + PANEL
// ======================
function addPartyMarker(party) {
  const marker = new google.maps.Marker({
    position: { lat: party.lat, lng: party.lng },
    map: map,
    icon: getMarkerIcon(party),
    animation: google.maps.Animation.DROP,
  });

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
  document.getElementById("partyPanelAddress").textContent = party.address
    ? `📍 ${party.address}`
    : "";
  document.getElementById("partyPanelDescription").textContent = party.description;
  document.getElementById("partyPanelPhone").textContent = party.phone ? `📞 ${party.phone}` : "📞 -";
  document.getElementById("partyPanelInstagram").textContent = party.instagram ? `@${party.instagram}` : "@ -";

  document.getElementById("partyPanelAttendees").textContent = party.attendees;
  document.getElementById("partyPanelViews").textContent = party.views;

  const joinBtn = document.getElementById("partyPanelJoinBtn");
  const storageKey = `joined_${party.id}`;

  if (localStorage.getItem(storageKey)) {
    joinBtn.textContent = "Listo, nos vemos ahí 🎉";
    joinBtn.disabled = true;
    joinBtn.classList.add("already-joined");
  } else {
    joinBtn.textContent = "Quiero ir 🔥";
    joinBtn.disabled = false;
    joinBtn.classList.remove("already-joined");

    joinBtn.onclick = () => {
      party.attendees = (party.attendees || 0) + 1;
      document.getElementById("partyPanelAttendees").textContent = party.attendees;

      localStorage.setItem(storageKey, true);

      joinBtn.textContent = "Listo, nos vemos ahí 🎉";
      joinBtn.disabled = true;
      joinBtn.classList.add("already-joined");
    };
  }
}

// Expone la función de inicialización al global
window.initGoogleMap = initGoogleMap;
