// Inicializar mapa con Leaflet
const map = L.map("map").setView([-12.0464, -77.0428], 13); // Centro Lima

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap",
}).addTo(map);

// Marcador temporal para cuando el organizador elige ubicación
let markerSeleccion = null;

// Datos de fiestas (por ahora mock, luego será base de datos)
let fiestas = [
  {
    id: 1,
    nombre: "Rooftop Miraflores",
    lat: -12.123,
    lng: -77.03,
    fecha: "2025-11-20",
    hora: "22:00",
    musica: "House",
    minimo: 30,
    zona: "Miraflores",
  },
  {
    id: 2,
    nombre: "La Jato del Flow",
    lat: -12.07,
    lng: -77.05,
    fecha: "2025-11-20",
    hora: "21:30",
    musica: "Reggaetón",
    minimo: 20,
    zona: "Pueblo Libre",
  },
];

let marcadoresFiestas = [];

// Renderizar marcadores de fiestas en el mapa
function pintarFiestasEnMapa() {
  // limpiar anteriores
  marcadoresFiestas.forEach((m) => map.removeLayer(m));
  marcadoresFiestas = [];

  fiestas.forEach((fiesta) => {
    const marker = L.marker([fiesta.lat, fiesta.lng]).addTo(map);
    marker.bindPopup(`
      <strong>${fiesta.nombre}</strong><br/>
      ${fiesta.zona || ""}<br/>
      ${fiesta.fecha} · ${fiesta.hora}<br/>
      Música: ${fiesta.musica}<br/>
      Min: ${fiesta.minimo} personas
    `);
    marcadoresFiestas.push(marker);
  });
}

// Renderizar lista de fiestas (vista invitado)
function pintarListaFiestas() {
  const contenedor = document.getElementById("lista-fiestas");
  contenedor.innerHTML = "";

  fiestas.forEach((fiesta, index) => {
    const card = document.createElement("div");
    card.className = "party-card";
    card.innerHTML = `
      <div class="party-title">${fiesta.nombre}</div>
      <div class="party-meta">
        ${fiesta.fecha} · ${fiesta.hora} · ${fiesta.zona || "Sin zona"}
      </div>
      <div class="party-meta">
        Música: ${fiesta.musica} · Min: ${fiesta.minimo} personas
      </div>
      <span class="party-badge">Ver en el mapa</span>
    `;

    card.addEventListener("click", () => {
      map.setView([fiesta.lat, fiesta.lng], 15);
      marcadoresFiestas[index].openPopup();
    });

    contenedor.appendChild(card);
  });
}

// Modo tabs (organizador / invitado)
const tabButtons = document.querySelectorAll(".tab-btn");
const viewOrganizador = document.getElementById("view-organizador");
const viewInvitado = document.getElementById("view-invitado");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const mode = btn.dataset.mode;
    if (mode === "organizador") {
      viewOrganizador.classList.remove("hidden");
      viewInvitado.classList.add("hidden");
    } else {
      viewOrganizador.classList.add("hidden");
      viewInvitado.classList.remove("hidden");
    }
  });
});

// Seleccionar ubicación tocando el mapa (organizador)
map.on("click", (e) => {
  const { lat, lng } = e.latlng;

  if (markerSeleccion) {
    markerSeleccion.setLatLng([lat, lng]);
  } else {
    markerSeleccion = L.marker([lat, lng], { draggable: true }).addTo(map);
    markerSeleccion.on("dragend", (ev) => {
      const { lat: newLat, lng: newLng } = ev.target.getLatLng();
      actualizarCampoUbicacion(newLat, newLng);
    });
  }

  actualizarCampoUbicacion(lat, lng);
});

function actualizarCampoUbicacion(lat, lng) {
  const ubicacionInput = document.getElementById("ubicacionTexto");
  ubicacionInput.value = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
}

// Manejo del formulario de crear fiesta (MVP local)
const formFiesta = document.getElementById("form-fiesta");

formFiesta.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!markerSeleccion) {
    alert("Selecciona una ubicación tocando el mapa.");
    return;
  }

  const nombre = document.getElementById("nombreFiesta").value.trim();
  const fecha = document.getElementById("fechaFiesta").value;
  const hora = document.getElementById("horaFiesta").value;
  const musica = document.getElementById("musicaFiesta").value;
  const minimo = parseInt(document.getElementById("minimoPersonas").value || "1", 10);

  const { lat, lng } = markerSeleccion.getLatLng();

  const nuevaFiesta = {
    id: Date.now(),
    nombre,
    fecha,
    hora,
    musica,
    minimo,
    lat,
    lng,
    zona: "Zona custom",
  };

  fiestas.push(nuevaFiesta);

  pintarFiestasEnMapa();
  pintarListaFiestas();

  alert("Fiesta creada (por ahora solo guardada en memoria). Más adelante la subimos a base de datos en tiempo real.");

  formFiesta.reset();
  document.getElementById("ubicacionTexto").value = "";
});

// Inicializar
pintarFiestasEnMapa();
pintarListaFiestas();
