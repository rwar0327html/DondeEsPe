<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DondeEsPe — Fiestas en Tiempo Real</title>

  <!-- Fuente -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&display=swap" rel="stylesheet" />

  <!-- Estilos -->
  <link rel="stylesheet" href="styles.css" />
</head>

<body>
  <div class="app">

    <!-- HERO -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Fiestas en Tiempo Real</h1>
        <p class="hero-subtitle">
          Descubre, crea y únete a las fiestas que están pasando cerca de ti.
        </p>
        <button class="hero-btn" id="scrollToMap">
          Explorar mapa 🔥
        </button>
      </div>

      <div class="hero-glow"></div>
      <div class="hero-glow2"></div>
    </section>

    <!-- MAPA -->
    <section class="map-section" id="mapSection">
      <div id="map"></div>
      <button id="locateMeBtn" class="fab-button">📍</button>
    </section>

    <!-- MODAL CREAR FIESTA -->
    <div id="partyModal" class="modal hidden">
      <div class="modal-overlay"></div>

      <div class="modal-card">
        <button class="modal-close" id="closeModalBtn">✕</button>

        <h2 class="modal-title">Crear Fiesta 🎉</h2>
        <p class="modal-location">Ubicación seleccionada en el mapa ✔</p>

        <form id="partyForm" class="modal-form">

          <div class="form-group">
            <label for="partyName">Nombre de la fiesta</label>
            <input
              id="partyName"
              required
              placeholder="Ej: Tarde de Perreo en Barranco"
            />
          </div>

          <div class="form-group">
            <label for="partyDescription">Descripción</label>
            <textarea
              id="partyDescription"
              rows="3"
              placeholder="Cuenta qué tipo de fiesta es, dress code, música, etc."
            ></textarea>
          </div>

          <div class="form-group two-cols">
            <div>
              <label for="partyDate">Fecha</label>
              <input type="date" id="partyDate" required />
            </div>

            <div>
              <label for="partyZone">Zona / Distrito</label>
              <select id="partyZone" required>
                <option value="">Selecciona una zona</option>
                <option value="Barranco">Barranco</option>
                <option value="Miraflores">Miraflores</option>
                <option value="Surco">Santiago de Surco</option>
                <option value="San Isidro">San Isidro</option>
                <option value="San Miguel">San Miguel</option>
                <option value="Callao">Callao</option>
                <option value="La Molina">La Molina</option>
              </select>
            </div>
          </div>

          <!-- SLIDER CAPACIDAD -->
          <div class="form-group">
            <label for="partyCapacityRange">Capacidad mínima para activar la fiesta</label>
            <div class="slider-row">
              <input
                type="range"
                id="partyCapacityRange"
                min="10"
                max="300"
                step="10"
                value="50"
              />
              <span class="slider-value">
                <span id="partyCapacityValue">50</span> personas
              </span>
            </div>
            <p class="slider-help">
              Esta es la cantidad mínima de personas para considerar la fiesta “activa”.
            </p>
          </div>

          <!-- FLYER -->
          <div class="form-group">
            <label for="partyFlyer">Flyer (obligatorio más adelante)</label>
            <div class="file-input-wrapper">
              <label class="file-label">
                <span>Seleccionar archivo</span>
                <input type="file" id="partyFlyer" />
              </label>
              <span class="file-name" id="fileName">Ningún archivo seleccionado</span>
            </div>
            <p class="file-help">
              Por ahora solo lo seleccionas, luego conectamos el almacenamiento.
            </p>
          </div>

          <!-- BOTONES -->
          <div class="modal-actions">
            <button type="button" class="btn-secondary" id="cancelBtn">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              Publicar fiesta
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>

  <!-- APP -->
  <script src="app.js"></script>

  <!-- GOOGLE MAPS API -->
  <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCgFLYXdggm6O2zpNnYCzGvZFm8WKnExVE&callback=initGoogleMap" async defer></script>
</body>
</html>
