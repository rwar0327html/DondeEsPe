console.log("DondeEsPe conectado correctamente.");

// Esperar a que cargue todo el DOM
document.addEventListener("DOMContentLoaded", () => {
  const estado = document.getElementById("estado-firebase");

  // Probar si firebase realmente está cargado
  try {
    // Intentar acceder a firebase.app()
    const testApp = firebase.app();

    // Si no explota, Firebase está cargado
    estado.textContent = "✅ Firebase conectado correctamente.";
    console.log("Firebase cargado:", testApp);

  } catch (error) {
    // Si explota, Firebase NO cargó
    estado.textContent = "❌ Firebase NO está cargado.";
    console.error("Error:", error);
  }
});
