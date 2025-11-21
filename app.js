// ======================
// Estado en memoria
// ======================

let map;
let parties = [];
let lastClickLatLng = null;

// ======================
// ESTILO APPLE MAPS (el que tú mandaste EXACTO)
// ======================

const appleMapStyle = [
  {
    featureType: "landscape.man_made",
    elementType: "geometry",
    stylers: [{ color: "#f7f1df" }]
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#d0e3b4" }]
  },
  {
    featureType: "landscape.natural.terrain",
    elementType: "geometry",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.business",
    elementType: "all",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.medical",
    elementType: "geometry",
    stylers: [{ color: "#fbd3da" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#bde6ab" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffe15f" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#efd151" }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road.local",
    elementType: "geometry.fill",
    stylers: [{ color: "#000000" }] // ← corregido
  },
  {
    featureType: "transit.station.airport",
    elementType: "geometry.fill",
    stylers: [{ color: "#cfb2db" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#a2daf2" }]
  }
];

// ======================
// Inicializar Google Maps
// ======================

function initGoogleMap() {
  const lima = { lat: -12.0464, lng: -77.0428 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: lima,
    zoom: 13,
    disableDefaultUI: true,
    styles: appleMapStyle, // <- Aquí tu Apple map theme 👑
  });

  // Clic → abrir formulario
  map.addListener("click", (e) => {
    lastClickLatLng = e.latLng;
    openPartyModal();
  });

  initUI();
}

// ======================
// UI
// ======================

function initUI() {
  const modal = document.getElementById("partyModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const partyForm = document.getElementById("partyForm");
  const locateMeBtn = document.getElementById("locateMeBtn");

  closeModalBtn.addEventListener("click", closePartyModal);
  partyForm.addEventListener("submit", handleCreateParty);

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

  modal.addEventListener("click", (e) => {
    if (e.target.id === "partyModal") closePartyModal();
  });

  document.getElementById("scrollToMap").onclick = () => {
    document.getElementById("mapSection").scrollIntoView({ behavior: "smooth" });
  };
}

function openPartyModal() {
  document.getElementById("partyModal").classList.remove("hidden");
}

function closePartyModal() {
  document.getElementById("partyModal").classList.add("hidden");
  document.getElementById("partyForm").reset();
  lastClickLatLng = null;
}

// ======================
// Crear fiesta
// ======================

function handleCreateParty(event) {
  event.preventDefault();
  if (!lastClickLatLng) {
    alert("Haz click en el mapa para seleccionar la ubicación.");
    return;
  }

  const party = {
    id: Date.now(),
    name: document.getElementById("partyName").value.trim(),
    type: document.getElementById("partyType").value,
    genre: document.getElementById("partyGenre").value,
    date: document.getElementById("partyDate").value,
    time: document.getElementById("partyTime").value,
    people: document.getElementById("partyPeople").value || null,
    description: document.getElementById("partyDescription").value,
    lat: lastClickLatLng.lat(),
    lng: lastClickLatLng.lng(),
  };

  parties.push(party);

  addPartyMarker(party);

  closePartyModal();
}

// ======================
// Marcador NEON — Google Maps
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

  const content = `
    <div style="color:#000; font-family:Poppins; max-width:230px;">
      <h3 style="margin:0 0 4px;">${party.name}</h3>
      <p><strong>Tipo:</strong> ${party.type}<br>
      <strong>Género:</strong> ${party.genre}</p>
      <p><strong>Fecha:</strong> ${party.date}<br>
      <strong>Hora:</strong> ${party.time}</p>
      ${party.people ? `<p><strong>Personas:</strong> ${party.people}+</p>` : ""}
      ${party.description ? `<p>${party.description}</p>` : ""}
    </div>
  `;

  const info = new google.maps.InfoWindow({ content });

  marker.addListener("click", () => info.open(map, marker));
}
