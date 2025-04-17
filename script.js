const textInput = document.getElementById('textInput');
const fontSizeInput = document.getElementById('textSizeInput');
const angleBtn = document.getElementById('skewButton');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const geoSelect = document.getElementById('geoSelect');
const currencySelect = document.getElementById('currencySelect');

let currentFontSize = (window.adminConfig && window.adminConfig.text_size) ? parseInt(window.adminConfig.text_size) : 45;
let currentAngle = (window.adminConfig && window.adminConfig.skew_angle) ? parseFloat(window.adminConfig.skew_angle) : 0;
const angles = (window.adminConfig && window.adminConfig.angles) ? window.adminConfig.angles : [0, 0.93, 3, 4.05];
const originalX = (window.adminConfig && window.adminConfig.position_x) ? window.adminConfig.position_x : 360;
const originalY = (window.adminConfig && window.adminConfig.position_y) ? window.adminConfig.position_y : 575;
const fontWeight = (window.adminConfig && window.adminConfig.font_weight) ? window.adminConfig.font_weight : 900;
const defaultTextColor = (window.adminConfig && window.adminConfig.text_color) ? window.adminConfig.text_color : '#4F5900';
const defaultTextAlign = (window.adminConfig && window.adminConfig.text_alignment) ? window.adminConfig.text_alignment : 'center';

let currentText = '';

let image = new Image();
image.crossOrigin = "anonymous";
image.src = 'assets/banner.png';
image.onload = () => {
  fontSizeInput.value = currentFontSize;
  drawCanvas();
};

function updateCanvas() {
  currentText = textInput.value.trim().toUpperCase();
  currentFontSize = parseInt(fontSizeInput.value, 10) || currentFontSize;
  drawCanvas();
}

textInput.addEventListener('input', updateCanvas);
fontSizeInput.addEventListener('input', updateCanvas);

angleBtn.addEventListener('click', () => {
  let index = angles.indexOf(currentAngle);
  index = (index + 1) % angles.length;
  currentAngle = angles[index];
  angleBtn.textContent = `НАКЛОН: ${currentAngle}°`;
  drawCanvas();
});

downloadBtn.addEventListener('click', () => {
  downloadCanvasImage();
});

function drawOnCanvas(context, cw, ch) {
  context.clearRect(0, 0, cw, ch);
  const scale = Math.min(cw / image.width, ch / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const offsetX = (cw - scaledWidth) / 2;
  const offsetY = (ch - scaledHeight) / 2;

  context.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

  if (currentText) {
    const radians = currentAngle * Math.PI / 180;
    const skewValue = Math.tan(radians);
    const targetX = offsetX + originalX * scale;
    const targetY = offsetY + originalY * scale;

    context.save();
    context.translate(targetX, targetY);
    context.transform(1, 0, skewValue, 1, 0, 0);
    context.rotate(-radians);
    context.font = `${fontWeight} italic ${currentFontSize * scale}px Inter`;
    context.fillStyle = defaultTextColor;
    context.textAlign = defaultTextAlign;
    context.textBaseline = 'middle';
    context.fillText(currentText, 0, 0);
    context.restore();
  }
}

function drawCanvas() {
  drawOnCanvas(ctx, canvas.width, canvas.height);
}

function downloadCanvasImage() {
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = 1000;
  offscreenCanvas.height = 1000;
  const offscreenCtx = offscreenCanvas.getContext('2d');

  drawOnCanvas(offscreenCtx, offscreenCanvas.width, offscreenCanvas.height);

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
