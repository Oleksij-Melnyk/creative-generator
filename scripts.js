const imageInput = document.getElementById('imageInput');
const textInput = document.getElementById('textInput');
const fontSizeInput = document.getElementById('fontSizeInput');
const applyTextBtn = document.getElementById('applyTextBtn');
const angleBtn = document.getElementById('angleBtn');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let image = new Image();
let currentText = '';
let currentFontSize = 50;
let currentAngle = 0;
const angles = [0, 0.93, 3, 4.05];
let angleIndex = 0;

window.onload = () => {
  image.src = 'assets/banner.png';
  image.onload = () => {
    canvas.width = image.width;
    canvas.height = image.height;
    drawCanvas();
  };
};

imageInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = event => {
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        drawCanvas();
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

applyTextBtn.addEventListener('click', () => {
  currentText = textInput.value.toUpperCase();
  currentFontSize = parseInt(fontSizeInput.value, 10) || 50;
  drawCanvas();
});

angleBtn.addEventListener('click', () => {
  angleIndex = (angleIndex + 1) % angles.length;
  currentAngle = angles[angleIndex];
  angleBtn.textContent = `${currentAngle}°`;
  drawCanvas();
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'image.png';
  link.href = canvas.toDataURL();
  link.click();
});

function drawCanvas() {
  if (!image.src) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);

  if (currentText) {
    const radians = currentAngle * Math.PI / 180;
    const skewValue = Math.tan(radians);

    const centerX = 360;
    const centerY = 575;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.transform(1, 0, skewValue, 1, 0, 0);
    ctx.rotate(-radians);
    ctx.font = `900 italic ${currentFontSize}px Inter`;
    ctx.fillStyle = '#4F5900';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentText, 0, 0);
    ctx.restore();
  }
}
