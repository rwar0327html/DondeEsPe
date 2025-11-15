console.log("DondeEsPe conectado correctamente.");
// app.js — Este archivo NO rompe tu Firebase antiguo. Solo muestra el estado.

// Como es módulo, debemos esperar a que el DOM cargue
document.addEventListener("DOMContentLoaded", () => {
  const estado = document.getElementById("estado-firebase");

  try {
    // Verificar si firebase ya está cargado (usando tu script global)
    if (typeof firebase !== "undefined") {
      estado.textContent = "✅ Firebase conectado correctamente.";
      console.log("Firebase cargado:", firebase);
    } else {
      estado.textContent = "❌ Firebase NO está cargado.";
      console.error("No se encontró Firebase.");
    }
  } catch (error) {
    estado.textContent = "❌ Error conectando Firebase.";
    console.error(error);
  }
});

