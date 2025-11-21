// ======================
// ESTADO EN MEMORIA
// ======================
let map;
let parties = [];
let lastClickLatLng = null;

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

  // cerrar modal
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

  // cerrar clickeando fuera
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

  // nombre de archivo
  if (flyerInput && fileNameSpan) {
    flyerInput.addEventListener("change", () => {
      if (flyerInput.files && flyerInput.files.length > 0) {
        fileNameSpan.textContent = flyerInput.files[0].name;
      } else {
        fileNameSpan.textContent = "Ningún archivo seleccionado";
      }
    });
  }
}

function openPartyModal() {
  const modal = document.getElementById("partyModal");
  const card = document.querySelector(".modal-card");

  modal.classList.remove("hidden");

  // reiniciar animación
  if (card) {
    card.classList.remove("modal-anim");
    void card.offsetWidth; // fuerza reflow
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

  const party = {
    id: Date.now(),
    name: document.getElementById("partyName").value.trim(),
    description: document.getElementById("partyDescription").value.trim(),
    date: document.getElementById("partyDate").value,
    zone: document.getElementById("partyZone").value,
    capacity: document.getElementById("partyCapacityRange").value,
    lat: lastClickLatLng.lat(),
    lng: lastClickLatLng.lng(),
  };

  parties.push(party);
  addPartyMarker(party);
  closePartyModal();
}

// ======================
// MARCADOR NEON
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
    <div style="color:#fff; font-family:Poppins; max-width:230px;">
      <h3 style="margin:0 0 4px;">${party.name}</h3>
      ${party.zone ? `<p><strong>Zona:</strong> ${party.zone}</p>` : ""}
      <p><strong>Fecha:</strong> ${party.date || "Por definir"}</p>
      ${
        party.capacity
          ? `<p><strong>Capacidad mínima:</strong> ${party.capacity} personas</p>`
          : ""
      }
      ${
        party.description
          ? `<p style="margin-top:6px;">${party.description}</p>`
          : ""
      }
    </div>
  `;

  const info = new google.maps.InfoWindow({ content });
  marker.addListener("click", () => info.open(map, marker));
}

  <!-- GOOGLE MAPS API -->
  <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCgFLYXdggm6O2zpNnYCzGvZFm8WKnExVE&callback=initGoogleMap" async defer></script>
</body>
</html>
