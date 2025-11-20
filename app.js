// ======================
// Estado en memoria (MVP)
// ======================

const parties = []; // Aquí guardamos las fiestas creadas
let map;
let lastClickLatLng = null;

// ======================
// Inicialización del mapa
// ======================

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  initUI();
});

function initMap() {
  // Centrado inicial: Lima (puedes cambiarlo luego)
  const limaCoords = [-12.0464, -77.0428];

  map = L.map("map").setView(limaCoords, 13);

  // Capa base 
L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> contributors'
}).addTo(map);

  // Evento: click en el mapa -> abrir modal
  map.on("click", (e) => {
    lastClickLatLng = e.latlng;
    openPartyModal();
  });
}

// ======================
// UI: modal y botones
// ======================

function initUI() {
  const modal = document.getElementById("partyModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const partyForm = document.getElementById("partyForm");
  const locateMeBtn = document.getElementById("locateMeBtn");

  // Cerrar modal
  closeModalBtn.addEventListener("click", closePartyModal);

  // Envío del formulario
  partyForm.addEventListener("submit", handleCreateParty);

  // Botón "📍": centrar en mi ubicación (opcional)
  locateMeBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 15);
      },
      () => {
        alert("No se pudo obtener tu ubicación.");
      }
    );
  });

  // Cerrar modal si se hace click en el fondo difuminado
  modal.addEventListener("click", (e) => {
    if (e.target.id === "partyModal") {
      closePartyModal();
    }
  });
}

function openPartyModal() {
  const modal = document.getElementById("partyModal");
  modal.classList.remove("hidden");
}

function closePartyModal() {
  const modal = document.getElementById("partyModal");
  modal.classList.add("hidden");
  document.getElementById("partyForm").reset();
  lastClickLatLng = null;
}

// ======================
// Crear fiesta
// ======================

function handleCreateParty(event) {
  event.preventDefault();
  if (!lastClickLatLng) {
    alert("Primero toca un lugar en el mapa para ubicar la fiesta.");
    return;
  }

  const partyName = document.getElementById("partyName").value.trim();
  const partyType = document.getElementById("partyType").value;
  const partyGenre = document.getElementById("partyGenre").value;
  const partyDate = document.getElementById("partyDate").value;
  const partyTime = document.getElementById("partyTime").value;
  const partyPeople = document.getElementById("partyPeople").value;
  const partyDescription = document.getElementById("partyDescription").value;

  // Objeto fiesta (aquí después puedes agregar "estado: pendiente / aprobada")
  const party = {
    id: Date.now(),
    name: partyName || "Fiesta sin nombre",
    type: partyType,
    genre: partyGenre,
    date: partyDate,
    time: partyTime,
    people: partyPeople || null,
    description: partyDescription || "",
    lat: lastClickLatLng.lat,
    lng: lastClickLatLng.lng,
    status: "aprobada" // Por ahora, directo. Luego: "pendiente" + panel admin.
  };

  parties.push(party);

  addPartyMarker(party);
  renderPartyList();

  closePartyModal();
}

// ======================
// Markers en el mapa
// ======================

function addPartyMarker(party) {
  // Icono personalizado básico (círculo neon)
  const neonIcon = L.divIcon({
    className: "neon-marker",
    html: `
      <div class="neon-marker-dot"></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const marker = L.marker([party.lat, party.lng], { icon: neonIcon }).addTo(map);

  const popupContent = `
    <div class="popup-content">
      <h3>${party.name}</h3>
      <p><strong>Tipo:</strong> ${party.type} • <strong>Género:</strong> ${party.genre}</p>
      <p><strong>Fecha:</strong> ${formatDate(party.date)} • <strong>Hora:</strong> ${party.time || "Por definir"}</p>
      ${party.people ? `<p><strong>Personas estimadas:</strong> ${party.people}+</p>` : ""}
      ${
        party.description
          ? `<p class="popup-desc">${escapeHtml(party.description)}</p>`
          : ""
      }
      <p class="popup-status">Estado: <span>${party.status === "aprobada" ? "✅ Aprobada" : "⏳ Pendiente"}</span></p>
    </div>
  `;

  marker.bindPopup(popupContent);

  // Guardamos el marker en el objeto si luego quieres manejarlo
  party._marker = marker;
}

// ======================
// Lista lateral de fiestas
// ======================

function renderPartyList() {
  const partyList = document.getElementById("partyList");
  partyList.innerHTML = "";

  if (parties.length === 0) {
    partyList.innerHTML = `<li class="party-item">
      <div class="party-title">Aún no hay fiestas creadas.</div>
      <div class="party-meta">Toca el mapa y crea la primera 🔥</div>
    </li>`;
    return;
  }

  parties
    // Podrías ordenar por fecha/hora si quieres
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((party) => {
      const li = document.createElement("li");
      li.className = "party-item";
      li.innerHTML = `
        <div class="party-title">${party.name}</div>
        <div class="party-meta">
          ${formatDate(party.date)} • ${party.time || "Hora libre"}<br />
          ${party.type} • ${party.genre}
          ${party.people ? ` • ${party.people}+ personas` : ""}
        </div>
      `;
      li.addEventListener("click", () => {
        if (party._marker) {
          map.setView([party.lat, party.lng], 15);
          party._marker.openPopup();
        }
      });
      partyList.appendChild(li);
    });
}

// ======================
// Helpers
// ======================

function formatDate(isoDateString) {
  if (!isoDateString) return "Sin fecha";
  const d = new Date(isoDateString);
  if (isNaN(d)) return isoDateString;
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ======================
// Estilos extra para marcador y popup (inyectados)
// ======================

// Esto mete CSS específico para el marcador neon y popup dentro del documento
const extraStyle = document.createElement("style");
extraStyle.textContent = `
  .neon-marker-dot {
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: radial-gradient(circle, #ff00ff, #8a2be2);
    box-shadow:
      0 0 10px rgba(255, 0, 255, 0.9),
      0 0 22px rgba(0, 255, 255, 0.8);
    border: 2px solid #00ffff;
  }

  .leaflet-popup-content-wrapper {
    background: rgba(5, 5, 20, 0.95);
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.24);
    box-shadow:
      0 0 18px rgba(255, 0, 255, 0.6),
      0 0 22px rgba(0, 255, 255, 0.5);
    color: #f5f5ff;
  }

  .leaflet-popup-content {
    margin: 8px 10px;
  }

  .popup-content h3 {
    margin: 0 0 4px;
    font-size: 0.95rem;
  }

  .popup-content p {
    margin: 2px 0;
    font-size: 0.8rem;
  }

  .popup-desc {
    margin-top: 6px;
  }

  .popup-status span {
    color: #00ffb3;
  }
`;
document.head.appendChild(extraStyle);

document.getElementById("scrollToMap").onclick = () => {
  document.getElementById("mapSection").scrollIntoView({behavior: "smooth"});
};

const panel = document.getElementById("slidePanel");
document.getElementById("openPanelBtn").onclick = () => panel.classList.add("active");
document.getElementById("closePanelBtn").onclick = () => panel.classList.remove("active");
