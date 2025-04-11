const textInput = document.getElementById('textInput');
const fontSizeInput = document.getElementById('textSizeInput');
const applyTextBtn = document.getElementById('applyTextBtn');
const angleBtn = document.getElementById('skewButton');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const geoSelect = document.getElementById('geoSelect');
const currencySelect = document.getElementById('currencySelect');

let currentText = '';
let currentFontSize = 45; // Начальное значение = 45
let currentAngle = 0;
const angles = [0, 0.93, 3, 4.05];
let angleIndex = 0;

let image = new Image();
image.crossOrigin = "anonymous"; // Если сервер поддерживает CORS.
image.src = 'assets/banner.png';
image.onload = () => {
  // Устанавливаем значение поля размера текста по умолчанию
  fontSizeInput.value = currentFontSize;
  drawCanvas(); // Отрисовываем на основном canvas (500x500)
};

applyTextBtn.addEventListener('click', () => {
  currentText = textInput.value.trim().toUpperCase();
  currentFontSize = parseInt(fontSizeInput.value, 10) || 45;
  drawCanvas();
});

angleBtn.addEventListener('click', () => {
  angleIndex = (angleIndex + 1) % angles.length;
  currentAngle = angles[angleIndex];
  angleBtn.textContent = `НАКЛОН: ${currentAngle}°`;
  drawCanvas();
});

downloadBtn.addEventListener('click', () => {
  downloadCanvasImage();
});

/**
 * Функция для отрисовки креатива на заданном canvas.
 * @param {CanvasRenderingContext2D} context - контекст рисования.
 * @param {number} cw - ширина canvas.
 * @param {number} ch - высота canvas.
 */
function drawOnCanvas(context, cw, ch) {
  context.clearRect(0, 0, cw, ch);
  const scale = Math.min(cw / image.width, ch / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const offsetX = (cw - scaledWidth) / 2;
  const offsetY = (ch - scaledHeight) / 2;

  // Рисуем изображение
  context.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

  // Рисуем промокод, если он введён
  if (currentText) {
    const radians = currentAngle * Math.PI / 180;
    const skewValue = Math.tan(radians);

    // Координаты для размещения текста относительно изображения
    const originalX = 360;
    const originalY = 575;
    const targetX = offsetX + originalX * scale;
    const targetY = offsetY + originalY * scale;

    context.save();
    context.translate(targetX, targetY);
    context.transform(1, 0, skewValue, 1, 0, 0);
    context.rotate(-radians);
    context.font = `900 italic ${currentFontSize * scale}px Inter`;
    context.fillStyle = '#4F5900';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(currentText, 0, 0);
    context.restore();
  }
}

function drawCanvas() {
  drawOnCanvas(ctx, canvas.width, canvas.height);
}

/**
 * Функция для скачивания изображения.
 * Создаётся оффскрин canvas размером 1000x1000, на который отрисовывается контент,
 * затем получается dataURL и инициируется скачивание файла.
 */
function downloadCanvasImage() {
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = 1000;
  offscreenCanvas.height = 1000;
  const offscreenCtx = offscreenCanvas.getContext('2d');

  // Отрисовываем креатив на оффскрин canvas с разрешением 1000x1000
  drawOnCanvas(offscreenCtx, offscreenCanvas.width, offscreenCanvas.height);

  // Формируем имя файла в формате: PROMOCODE_GEO_VAL.png
  const promoCode = (currentText || textInput.value.trim().toUpperCase() || 'PROMOCODE');
  const geoVal = geoSelect.value.trim().toUpperCase();
  const currencyVal = currencySelect.value.trim().toUpperCase();
  const fileName = `${promoCode}_${geoVal}_${currencyVal}.png`;

  const link = document.createElement('a');
  link.download = fileName;
  link.href = offscreenCanvas.toDataURL("image/png");
  if (link.href) {
    link.click();
  } else {
    console.error("Не удалось создать ссылку для скачивания.");
  }
}
