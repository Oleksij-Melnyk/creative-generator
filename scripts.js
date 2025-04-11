const textInput = document.getElementById('textInput');
const fontSizeInput = document.getElementById('textSizeInput');
const applyTextBtn = document.getElementById('applyTextBtn');
const angleBtn = document.getElementById('skewButton');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let image = new Image();
let currentText = '';
let currentFontSize = 50;
let currentAngle = 0;
const angles = [0, 0.93, 3, 4.05];
let angleIndex = 0;

image.src = 'assets/banner.png';
image.onload = () => {
  drawCanvas();
};

applyTextBtn.addEventListener('click', () => {
  currentText = textInput.value.toUpperCase();
  currentFontSize = parseInt(fontSizeInput.value, 10) || 50;
  drawCanvas();
});

angleBtn.addEventListener('click', () => {
  angleIndex = (angleIndex + 1) % angles.length;
  currentAngle = angles[angleIndex];
  angleBtn.textContent = `НАКЛОН: ${currentAngle}°`;
  drawCanvas();
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'creative.png';
  link.href = canvas.toDataURL();
  link.click();
});

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const offsetX = (canvas.width - scaledWidth) / 2;
  const offsetY = (canvas.height - scaledHeight) / 2;

  ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

  if (currentText) {
    const radians = currentAngle * Math.PI / 180;
    const skewValue = Math.tan(radians);

    const originalX = 360;
    const originalY = 575;
    const targetX = offsetX + originalX * scale;
    const targetY = offsetY + originalY * scale;

    ctx.save();
    ctx.translate(targetX, targetY);
    ctx.transform(1, 0, skewValue, 1, 0, 0);
    ctx.rotate(-radians);
    ctx.font = `900 italic ${currentFontSize * scale}px Inter`;
    ctx.fillStyle = '#4F5900';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentText, 0, 0);
    ctx.restore();
  }
}
