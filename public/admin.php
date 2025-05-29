<?php
session_start();
// if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
//     header('Location: login.php');
//     exit;
//}

$configFile = __DIR__ . '/../config/admin_configs.json';
$configs = file_exists($configFile)
    ? json_decode(file_get_contents($configFile), true) ?: []
    : [];

$defaultConfig = [
    'custom_image'   => '',
    'text_size'      => 45,
    'skew_angle'     => 0,
    'text_alignment' => 'center',
    'text_color'     => '#ffffff',
    'position_x'     => 0,
    'position_y'     => 0,
    'width'          => 450,
    'height'         => 100,
    'geo_list'       => [],
    'currency_list'  => [],
    'template_name'  => '',
    'direction'      => '',
    'image_data'     => ''
];

$currentConfig = $defaultConfig;
if ($configs) {
    $last = array_key_last($configs);
    $currentConfig = array_merge($defaultConfig, $configs[$last]);
}

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['delete_template'])) {
        $del = $_POST['delete_template'];
        if (isset($configs[$del])) {
            unset($configs[$del]);
            file_put_contents($configFile, json_encode($configs, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
        }
        exit;
    }

    $filename = '';
    $imageData = '';
    if (!empty($_FILES['custom_image']['name']) && $_FILES['custom_image']['error'] === UPLOAD_ERR_OK) {
        $filename = basename($_FILES['custom_image']['name']);
        $upDir = __DIR__ . '/uploads/';
        if (!is_dir($upDir)) mkdir($upDir, 0755, true);
        move_uploaded_file($_FILES['custom_image']['tmp_name'], $upDir . $filename);
        
        $imageData = base64_encode(file_get_contents($upDir . $filename));
        unlink($upDir . $filename);
    } else {
        $prev = $_POST['current_image'] ?? '';
        $filename = $prev ? basename($prev) : '';
        if ($filename && isset($configs[$filename])) {
            $imageData = $configs[$filename]['image_data'] ?? '';
        }
    }

    if (isset($_POST['image_data']) && !empty($_POST['image_data'])) {
        $imageData = $_POST['image_data'];
    }

    $hex = strtoupper(substr(preg_replace('/[^0-9A-Fa-f]/', '', $_POST['text_color']), 0, 6));

    if ($filename) {
        $settings = [
            'custom_image'   => $filename,
            'image_data'     => $imageData,
            'template_name'  => $_POST['template_name'] ?? '',
            'geo_list'       => json_decode($_POST['geo_list'] ?? '[]', true),
            'currency_list'  => json_decode($_POST['currency_list'] ?? '[]', true),
            'direction'      => $_POST['direction'] ?? '',
            'text_size'      => intval($_POST['text_size']),
            'skew_angle'     => floatval($_POST['skew_angle']),
            'text_alignment' => $_POST['text_alignment'],
            'text_color' => '#'. ltrim($_POST['text_color'], '#'),
            'position_x'     => intval($_POST['position_x']),
            'position_y'     => intval($_POST['position_y']),
        ];
        $configs[$filename] = $settings;
        file_put_contents($configFile, json_encode($configs, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
        $currentConfig = $settings;
        $message = 'Настройки сохранены';
        
        echo "<script>
            window.lastSavedTemplate = '" . htmlspecialchars($filename) . "';
        </script>";
    } else {
        $message = 'Пожалуйста, загрузите картинку';
    }
}
?><!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Админ-панель</title>
  <link rel="stylesheet" href="assets/css/admin.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;900&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/fabric@5.2.4/dist/fabric.min.js"></script>
  <script>
  </script>
</head>
<body>
  <div class="container">
    <div class="template-list">
      <h2><img src="assets/images/ellipse.svg" alt="ellipse" style="width: 36px; height: 36px;"></h2>
      <div id="templateList" class="template-list-store">
        <?php foreach ($configs as $filename => $config): ?>
          <div class="template-item" data-filename="<?php echo htmlspecialchars($filename); ?>">
            <span><?php echo htmlspecialchars($config['template_name'] ?? $filename); ?></span>
            <button class="delete-template-btn" 
              data-filename="<?php echo htmlspecialchars($filename); ?>" type="button">
              <img src="assets/images/bin.svg" alt="delete" style="width: 24px; height: 24px;">
            </button>
          </div>
        <?php endforeach; ?>
      </div>
      <hr class="form-separator template-list-separator">
      <button class="add-template-btn" id="addTemplateBtn">ШАБЛОН<img src="assets/images/Plus.svg" alt="+" style="margin-left: 8px; vertical-align: middle;"></button>
    </div>
          
    <div class="settings-panel">
      <label for="templateName" class="admin-panel-title">Admin Panel</label>
      <form id="configForm" method="post" enctype="multipart/form-data">
        <input type="hidden" name="current_image" id="current_image" value="<?php echo htmlspecialchars($currentConfig['custom_image']); ?>">
        <input type="hidden" name="image_data" id="image_data" value="<?php echo htmlspecialchars($currentConfig['image_data'] ?? ''); ?>">
        
        <div class="form-group">
          <div class="dropdown-with-button">
            <input type="text" id="templateName" name="template_name" placeholder="Введите название шаблона" value="<?php echo htmlspecialchars($currentConfig['template_name'] ?? ''); ?>" style="display:none;">
            <div id="templateNameDisplay" class="template-name-display"><?php echo htmlspecialchars($currentConfig['template_name'] ?? 'Введите название шаблона'); ?></div>
            <button type="button" class="add-button" id="addTemplateNameBtn"></button>
          </div>
        </div>

        <div class="section-title"><span id="selectedGeoCurrency">Гео / Валюта</span></div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="geoSelect">Добавить гео</label>
            <div class="dropdown-with-button">
              <select name="geo" id="geoSelect">
                <option value=""></option>
              </select>
              <input type="text" id="geoInput" style="display:none; width: 100%;" autocomplete="off" placeholder="Введите страну...">
              <div id="geoSuggestions" class="autocomplete-suggestions" style="display:none;"></div>
              <button type="button" class="add-button" id="addGeoBtn"></button>
            </div>
          </div>
          <div class="form-group">
            <label for="currencySelect">Добавить валюту</label>
            <div class="dropdown-with-button">
              <select name="currency" id="currencySelect">
                <option value=""></option>
              </select>
              <input type="text" id="currencyInput" style="display:none; width: 100%;" autocomplete="off" placeholder="Введите валюту...">
              <div id="currencySuggestions" class="autocomplete-suggestions" style="display:none;"></div>
              <button type="button" class="add-button" id="addCurrencyBtn"></button>
            </div>
          </div>
        </div>
        <input type="hidden" name="geo_list" id="geo_list" value=''>
        <input type="hidden" name="currency_list" id="currency_list" value=''>

        <div class="form-row-2">
          <div class="form-group">
            <label for="directionSelect">Направление</label>
            <select name="direction" id="directionSelect">
              <option value="sport">Спорт</option>
              <option value="casino">Казино</option>
              <option value="universal">Универсальный</option>
            </select>
          </div>
          <div class="form-group">
            <label for="textInput">Промокод</label>
            <input type="text" id="textInput" placeholder="Введите код">
          </div>
        </div>

        <hr class="form-separator">

        <div class="section-title">Расположение промокода</div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="text_size">Размер текста</label>
            <input type="number" name="text_size" id="text_size" value="<?php echo $currentConfig['text_size']; ?>" min="10" max="200">
          </div>
          <div class="form-group">
            <label for="skew_angle">Наклон текста</label>
            <input type="number" name="skew_angle" id="skew_angle"
            value="<?php echo $currentConfig['skew_angle']; ?>"
            step="0.01" min="-90" max="90">
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label for="text_alignment">Выравнивание</label>
            <select name="text_alignment" id="text_alignment">
              <option value="left"   <?php if($currentConfig['text_alignment']=='left') echo 'selected';?>>Слева</option>
              <option value="center" <?php if($currentConfig['text_alignment']=='center') echo 'selected';?>>По центру</option>
              <option value="right"  <?php if($currentConfig['text_alignment']=='right') echo 'selected';?>>Справа</option>
            </select>
          </div>
          <div class="form-group">
            <label for="text_color">Цвет текста</label>
            <div class="form-row" style="display:flex; align-items:center; gap:10px;">
              <input
                type="text"
                name="text_color"
                id="text_color"
                placeholder="RRGGBB"
                value="<?php echo ltrim($currentConfig['text_color'], '#'); ?>"
                maxlength="6"
                pattern="[0-9A-Fa-f]{6}"
              >
              <div
                id="colorPreview"
                style="background-color: <?php echo htmlspecialchars($currentConfig['text_color']); ?>;"
              ></div>
            </div>
          </div>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="position_x">X области (px)</label>
            <input type="number" name="position_x" id="position_x" value="<?php echo $currentConfig['position_x']; ?>">
          </div>
          <div class="form-group">
            <label for="position_y">Y области (px)</label>
            <input type="number" name="position_y" id="position_y" value="<?php echo $currentConfig['position_y']; ?>">
          </div>
        </div>
      </form>
    </div>

    <div class="preview-panel">
      <a href="logout.php" class="logout-btn">ВЫХОД<img src="assets/images/logout.svg" alt="logout" style="margin-left: 8px; vertical-align: middle;"></a>
      <div class="canvas-and-controls">
        <canvas id="canvas" width="400" height="400"></canvas>
        <div class="preview-controls">
          <div class="form-group">
            <div class="file-input-wrapper">
              <div class="file-input-button">ЗАГРУЗИТЬ КАРТИНКУ</div>
              <input type="file" name="custom_image" id="custom_image" accept="image/*">
            </div>
          </div>
          <div class="preview-buttons">
            <button type="submit" form="configForm">СОХРАНИТЬ ШАБЛОН</button>
            <button type="button" id="uploadToClientBtn" class="upload-to-client-btn">ЗАЛИТЬ НА КЛИЕНТ</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="deleteModal" class="modal-overlay" style="display:none;">
    <div class="modal-content">
      <p>Вы уверены, что хотите удалить шаблон?</p>
      <div class="modal-actions">
        <button id="confirmDeleteBtn" class="modal-confirm">Да</button>
        <button id="cancelDeleteBtn" class="modal-cancel">Нет</button>
      </div>
    </div>
  </div>

  <script>
    window.adminConfigs = <?php echo json_encode($configs, JSON_UNESCAPED_SLASHES); ?>;
    window.adminConfig  = <?php echo json_encode($currentConfig, JSON_UNESCAPED_SLASHES); ?>;
  </script>
  <script src="assets/js/script_admin.js"></script>
</body>
</html>
