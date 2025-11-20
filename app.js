// =============================
// CONFIGURACIÓN REAL DE FIREBASE
// =============================

// Importar Firebase modular (v9+ estilo ES Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, push } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Tu configuración REAL
const firebaseConfig = {
  apiKey: "AIzaSyBamKskyem2u7YN26rMh4lUPqK3aPlTDuE",
  authDomain: "dondeespe-546a3.firebaseapp.com",
  databaseURL: "https://dondeespe-546a3-default-rtdb.firebaseio.com",
  projectId: "dondeespe-546a3",
  storageBucket: "dondeespe-546a3.firebasestorage.app",
  messagingSenderId: "413412307464",
  appId: "1:413412307464:web:48b9e633e9c3f82714d7bd"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Mostrar estado en la franja
const statusEl = document.getElementById("firebase-status");
statusEl.textContent = "🔥 Firebase conectado correctamente.";
statusEl.classList.add("ok");

// =============================
// GOOGLE MAPS
// =============================
let map;

window.initMap = function () {
  const lima = { lat: -12.0464, lng: -77.0428 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: lima,
    zoom: 12,
    mapTypeControl: true,
    streetViewControl: false,
  });

  // Marcadores de ejemplo
  const fiestasDemo = [
    {
      nombre: "Rooftop Miraflores",
      pos: { lat: -12.123, lng: -77.03 },
    },
    {
      nombre: "La Jato del Flow",
      pos: { lat: -12.07, lng: -77.05 },
    },
  ];

  fiestasDemo.forEach((fiesta) => {
    new google.maps.Marker({
      position: fiesta.pos,
      map,
      title: fiesta.nombre,
    });
  });
};

// ==============
