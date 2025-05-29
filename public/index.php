<?php
$configFile = __DIR__ . '/../config/admin_configs.json';
$configData = [];
if (file_exists($configFile)) {
    $configData = json_decode(file_get_contents($configFile), true);
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Создание креатива</title>
  <link rel="stylesheet" href="assets/css/index.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700;900&display=swap" rel="stylesheet">
</head>
<body>
  <div class="container">
    <div class="client-panel">
      <h1>CLIENT PANEL</h1>
      <div class="controls-panel">
        <div class="selectors">
          <div class="dropdown-block">
            <label for="geoSelect">Выбери гео</label>
            <select id="geoSelect">
              <option>Geo1</option>
              <option>Geo2</option>
              <option>Geo3</option>
            </select>
          </div>
          <div class="dropdown-block">
            <label for="currencySelect">Выбери валюту</label>
            <select id="currencySelect">
              <option>USD1</option>
              <option>USD2</option>
              <option>USD3</option>
            </select>
          </div>
          <div class="dropdown-block">
            <label for="directionSelect">Выбери направление</label>
            <select id="directionSelect">
              <option value="sport">Спорт</option>
              <option value="casino">Казино</option>
              <option value="universal">Универсальный</option>
            </select>
          </div>
        </div>
        <div class="promo-block">
          <label for="textSizeInput">Размер текста</label>
          <input type="number" id="textSizeInput" value="45" placeholder="45" min="10" max="200">
          
          <label for="textInput">Введи промокод</label>
          <input type="text" id="textInput" placeholder="PROMOCODE">
        </div>
      </div>
    </div>
    <div class="preview-panel-container">
      <div class="login-button-container">
        <button onclick="location.href='login.php'">LOG IN</button>
      </div>
      <div class="preview-panel">
        <div class="display-mode-selector">
          <div class="display-mode-buttons">
            <span>Режим отображения</span>
            <button id="oneImageBtn" class="display-mode-button selected">
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="41" height="41" rx="7.5" stroke="#C1C1C1"/>
                <rect class="icon-rect" x="6" y="6" width="30" height="30" rx="5" fill="#C9C9C9"/>
                </svg>

            </button>
            <button id="manyImagesBtn" class="display-mode-button">
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="41" height="41" rx="7.5" stroke="#C1C1C1"/>
                <rect class="icon-rect" x="8" y="8" width="12" height="12" rx="3" fill="#C2D715"/>
                <rect class="icon-rect" x="22" y="8" width="12" height="12" rx="3" fill="#C2D715"/>
                <rect class="icon-rect" x="8" y="22" width="12" height="12" rx="3" fill="#C2D715"/>
                <rect class="icon-rect" x="22" y="22" width="12" height="12" rx="3" fill="#C2D715"/>
                </svg>

            </button>
          </div>
        </div>
        <div id="canvasContainer" class="preview-item">
          <canvas id="canvas" width="400" height="400"></canvas>
        </div>
        <div id="galleryContainer" class="preview-item" style="display: none;"></div>
        <button id="downloadBtn">СКАЧАТЬ <img src="assets/images/download-arrow-sqaure.svg" alt="Download"></button>
      </div>
    </div>
  </div>
  
  <script>
    window.adminConfig = <?php echo json_encode($configData); ?>;
  </script>
  <script src="assets/js/script.js"></script>
</body>
</html>
