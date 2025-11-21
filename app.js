// ======================
// ESTADO EN MEMORIA
// ======================
let map;
let parties = [];
let lastClickLatLng = null;
let currentParty = null;

// ======================
// ESTILO SNAZZY DARK NEON
// ======================
const darkNeonStyle = [
  {
    featureType: "all",
    elementType: "labels",
    stylers: [
      { visibility: "on" },
      { hue: "#ff0000" }
    ]
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [
      { color: "#000000" },
      { lightness: 13 }
    ]
  },
  {
    featureType: "all",
    elementType: "labels.icon",
    stylers: [
      { hue: "#ff0000" },
      { saturation: "100" },
      { lightness: "5" },
      { gamma: "0.70" },
      { weight: "7.95" },
      { invert_lightness: true }
    ]
  },
  {
    featureType: "administrative",
    elementType: "geometry.fill",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#144b53" },
      { lightness: 14 },
      { weight: 1.4 }
    ]
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [{ color: "#08304b" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      { color: "#0c4152" },
      { lightness: 5 }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#0b434f" },
      { lightness: 25 }
    ]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.fill",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.stroke",
    stylers: [
      { color: "#0b3d51" },
      { lightness: 16 }
    ]
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ color: "#146474" }]
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ color: "#021019" }]
  }
];

// ======================
// INICIALIZAR GOOGLE MAPS
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
  const joinBtn = document.getElementById("partyPanelJoinBtn");

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
      const myPos = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
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
      document
        .getElementById("mapSection")
        .scrollIntoView({ behavior: "smooth" });
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
      if (flyerInput.files && flyerInput.files.length > 0) {
        fileNameSpan.textContent = flyerInput.files[0].name;
      } else {
        fileNameSpan.textContent = "Ningún archivo seleccionado";
      }
    });
  }

  // cerrar panel de fiesta
  if (partyPanel && closePartyPanelBtn) {
    closePartyPanelBtn.addEventListener("click", () => {
      partyPanel.classList.add("hidden");
      currentParty = null;
    });
  }

  // botón "Quiero ir"
  if (joinBtn) {
    joinBtn.addEventListener("click", () => {
      if (!currentParty) return;
      currentParty.attendees = (currentParty.attendees || 0) + 1;
      updatePartyPanel(currentParty);
      // aquí en el futuro se podría abrir WhatsApp o proceso de pago
    });
  }
}

function openPartyModal() {
  const modal = document.getElementById("partyModal");
  const card = document.querySelector(".modal-card");

  modal.classList.remove("hidden");

  if (card) {
    card.classList.remove("modal-anim");
    void card.offsetWidth;
    card.classList.add("modal-anim");
  }
}

function closePartyModal() {
  const modal = document.getElementById("partyModal");
  const partyForm = document.getElementById("partyForm");
  const capacityRange = document.getElementById("partyCapacityRange");
  const capacityValue = document.getElementById("partyCapacityValue");
  const fileNameSpan = document.getElementById("fileName");
  const flyerInput = document.getElementById("partyFlyer");

  modal.classList.add("hidden");
  partyForm.reset();

  if (capacityRange && capacityValue) {
    capacityRange.value = 50;
    capacityValue.textContent = 50;
  }

  if (flyerInput) flyerInput.value = "";
  if (fileNameSpan) fileNameSpan.textContent = "Ningún archivo seleccionado";

  lastClickLatLng = null;
}

// ======================
// CREAR FIESTA
// ======================
function handleCreateParty(event) {
  event.preventDefault();

  if (!lastClickLatLng) {
    alert("Haz click en el mapa para seleccionar la ubicación.");
    return;
  }

  const flyerInput = document.getElementById("partyFlyer");
  const flyerFile = flyerInput && flyerInput.files ? flyerInput.files[0] : null;
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
// MARCADOR NEON + PANEL
// ======================
function addPartyMarker(party) {
  const neonMarker = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "#ff00ff",
    fillOpacity: 1,
    strokeColor: "#00ffff",
    strokeWeight: 3,
    scale: 10,
  };

  const marker = new google.maps.Marker({
    position: { lat: party.lat, lng: party.lng },
    map: map,
    icon: neonMarker,
  });

  marker.addListener("click", () => {
    // suma vista
    party.views = (party.views || 0) + 1;
    openPartyPanel(party);
  });
}

// ======================
// PANEL DE FIESTA
// ======================
function openPartyPanel(party) {
  currentParty = party;

  const panel = document.getElementById("partyDetailPanel");
  if (!panel) return;

  updatePartyPanel(party);
  panel.classList.remove("hidden");
}

function updatePartyPanel(party) {
  // elementos
  const flyerImg = document.getElementById("partyPanelFlyer");
  const flyerFallback = document.getElementById("partyPanelFlyerFallback");

  const nameEl = document.getElementById("partyPanelName");
  const genreEl = document.getElementById("partyPanelGenre");
  const typeEl = document.getElementById("partyPanelType");
  const zoneEl = document.getElementById("partyPanelZone");
  const dateEl = document.getElementById("partyPanelDate");
  const hourEl = document.getElementById("partyPanelHour");
  const addrEl = document.getElementById("partyPanelAddress");
  const descEl = document.getElementById("partyPanelDescription");
  const phoneEl = document.getElementById("partyPanelPhone");
  const igEl = document.getElementById("partyPanelInstagram");
  const attEl = document.getElementById("partyPanelAttendees");
  const viewsEl = document.getElementById("partyPanelViews");

  // flyer
  if (party.flyerUrl && flyerImg && flyerFallback) {
    flyerImg.src = party.flyerUrl;
    flyerImg.classList.remove("hidden");
    flyerFallback.classList.add("hidden");
  } else if (flyerFallback && flyerImg) {
    flyerImg.src = "";
    flyerImg.classList.add("hidden");
    flyerFallback.classList.remove("hidden");
  }

  if (nameEl) nameEl.textContent = party.name || "Fiesta sin nombre";
  if (genreEl) genreEl.textContent = party.genre || "Género no definido";
  if (typeEl) typeEl.textContent = party.type || "Tipo no definido";
  if (zoneEl) zoneEl.textContent = party.zone || "Zona no definida";
  if (dateEl) dateEl.textContent = party.date || "Fecha por definir";
  if (hourEl) hourEl.textContent = party.time || "Hora por definir";
  if (addrEl) addrEl.textContent = party.address ? `📍 ${party.address}` : "";

  if (descEl) {
    descEl.textContent = party.description || "Sin descripción.";
  }

  if (phoneEl) {
    phoneEl.textContent = party.phone ? `📞 ${party.phone}` : "📞 -";
  }

  if (igEl) {
    igEl.textContent = party.instagram
      ? `@${party.instagram.replace(/^@/, "")}`
      : "@ -";
  }

  if (attEl) attEl.textContent = party.attendees || 0;
  if (viewsEl) viewsEl.textContent = party.views || 0;
}
