<?php
session_start();
// if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
//     header('Location: login.php');
//     exit;
//}

$configFile = __DIR__ . '/admin_configs.json';
$configs = file_exists($configFile)
    ? json_decode(file_get_contents($configFile), true) ?: []
    : [];

// Значения по умолчанию
$defaultConfig = [
    'custom_image'   => '',
    'text_size'      => 45,
    'skew_angle'     => 0,
    'text_alignment' => 'center',
    'text_color'     => '#ffffff',
    'position_x'     => 0,
    'position_y'     => 0,
    'width'          => 300,
    'height'         => 100
];

// Выбираем конфиг последнего элемента или default
$currentConfig = $defaultConfig;
if ($configs) {
    $last = array_key_last($configs);
    $currentConfig = array_merge($defaultConfig, $configs[$last]);
}

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Обработка загрузки картинки
    $filename = '';
    if (!empty($_FILES['custom_image']['name']) && $_FILES['custom_image']['error'] === UPLOAD_ERR_OK) {
        $filename = basename($_FILES['custom_image']['name']);
        $upDir = __DIR__ . '/uploads/';
        if (!is_dir($upDir)) mkdir($upDir, 0755, true);
        move_uploaded_file($_FILES['custom_image']['tmp_name'], $upDir . $filename);
    } else {
        $prev = $_POST['current_image'] ?? '';
        $filename = $prev ? basename($prev) : '';
    }

    if ($filename) {
        $settings = [
            'custom_image'   => 'uploads/'.$filename,
            'text_size'      => intval($_POST['text_size']),
            'skew_angle'     => floatval($_POST['skew_angle']),
            'text_alignment' => $_POST['text_alignment'],
            'text_color'     => $_POST['text_color'],
            'position_x'     => intval($_POST['position_x']),
            'position_y'     => intval($_POST['position_y']),
            'width'          => intval($_POST['width']),
            'height'         => intval($_POST['height']),
        ];
        $configs[$filename] = $settings;
        file_put_contents($configFile, json_encode($configs, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
        $currentConfig = $settings;
        $message = 'Настройки сохранены';
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
  <link rel="stylesheet" href="styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;900&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/fabric@5.2.4/dist/fabric.min.js"></script>
</head>
<body>
  <div class="container">
    <div class="left-panel">
      <h1>Настройки промокода</h1>
      <?php if($message): ?>
        <div class="success"><?php echo htmlspecialchars($message); ?></div>
      <?php endif ?>
      <form id="configForm" method="post" enctype="multipart/form-data">
        <input type="hidden" name="current_image" id="current_image" value="<?php echo htmlspecialchars($currentConfig['custom_image']); ?>">
        <div class="form-group">
          <label for="custom_image">Картинка баннера</label>
          <input type="file" name="custom_image" id="custom_image" accept="image/*">
        </div>
        <div class="form-group">
          <label for="textInput">Промокод (превью)</label>
          <input type="text" id="textInput" placeholder="Введите код">
        </div>
        <div class="form-group">
          <label for="text_size">Размер текста (px)</label>
          <input type="number" name="text_size" id="text_size" value="<?php echo $currentConfig['text_size']; ?>" min="10" max="200">
        </div>
        <div class="form-group">
          <label for="skew_angle">Наклон текста (°)</label>
          <input type="number" name="skew_angle" id="skew_angle" value="<?php echo $currentConfig['skew_angle']; ?>" step="1">
        </div>
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
          <input type="color" name="text_color" id="text_color" value="<?php echo htmlspecialchars($currentConfig['text_color']); ?>">
        </div>
        <div class="form-group">
          <label for="position_x">X области (px)</label>
          <input type="number" name="position_x" id="position_x" value="<?php echo $currentConfig['position_x']; ?>">
        </div>
        <div class="form-group">
          <label for="position_y">Y области (px)</label>
          <input type="number" name="position_y" id="position_y" value="<?php echo $currentConfig['position_y']; ?>">
        </div>
        <div class="form-group">
          <label for="width">Ширина области (px)</label>
          <input type="number" name="width" id="width" value="<?php echo $currentConfig['width']; ?>">
        </div>
        <div class="form-group">
          <label for="height">Высота области (px)</label>
          <input type="number" name="height" id="height" value="<?php echo $currentConfig['height']; ?>">
        </div>
        <button type="submit">Сохранить</button>
      </form>
    </div>
    <div class="right-panel">
      <canvas id="canvas" width="600" height="600"></canvas>
    </div>
  </div>

  <script>
    window.adminConfigs = <?php echo json_encode($configs, JSON_UNESCAPED_SLASHES); ?>;
    window.adminConfig  = <?php echo json_encode($currentConfig, JSON_UNESCAPED_SLASHES); ?>;
  </script>
  <script src="script_admin.js"></script>
</body>
</html>
