(function() {
  const fileInput   = document.getElementById('custom_image');
  const hiddenInput = document.getElementById('current_image');
  const textInput   = document.getElementById('textInput');
  const sizeInput   = document.getElementById('text_size');
  const angleInput  = document.getElementById('skew_angle');
  const alignSelect = document.getElementById('text_alignment');
  const colorInput  = document.getElementById('text_color');
  const posXInput   = document.getElementById('position_x');
  const posYInput   = document.getElementById('position_y');
  const widthInput  = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const canvasEl    = document.getElementById('canvas');
  const ctx         = canvasEl.getContext('2d');

  const config     = window.adminConfig || {};
  const fontWeight = config.font_weight || 900;

  let image = new Image();
  image.crossOrigin = 'anonymous';

  // Rectangle parameters (center-based)
  let rect = {
      x: config.position_x || 0,
      y: config.position_y || 0,
      width: config.width || 100,
      height: config.height || 50,
      fill: 'rgba(255,0,0,0.7)'
  };

  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  function getScaleOffsets() {
    const cw    = canvasEl.width;
    const ch    = canvasEl.height;
    const scale = Math.min(cw / image.width, ch / image.height);
    const w     = image.width * scale;
    const h     = image.height * scale;
    return { scale, offsetX: (cw - w) / 2, offsetY: (ch - h) / 2 };
  }

  function draw() {
    if (!image.width) return;
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    const { scale, offsetX, offsetY } = getScaleOffsets();
    ctx.drawImage(image, offsetX, offsetY, image.width * scale, image.height * scale);

    // Determine angle properly, without fallback overriding zero
    let angle = parseFloat(angleInput.value);
    if (isNaN(angle)) {
      angle = (typeof config.skew_angle === 'number' ? config.skew_angle : 0);
    }
    const radians  = angle * Math.PI / 180;
    const skewValue = Math.tan(radians);
    const centerX  = offsetX + rect.x * scale;
    const centerY  = offsetY + rect.y * scale;

    // Draw skewed rectangle
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.transform(1, 0, skewValue, 1, 0, 0);
    ctx.rotate(-radians);
    ctx.fillStyle = rect.fill;
    ctx.fillRect(-rect.width/2 * scale, -rect.height/2 * scale, rect.width * scale, rect.height * scale);
    ctx.restore();

    // Draw text over rectangle
    const text = (textInput.value.trim() || '').toUpperCase();
    if (text) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.transform(1, 0, skewValue, 1, 0, 0);
      ctx.rotate(-radians);
      ctx.font         = `${fontWeight} italic ${(parseInt(sizeInput.value, 10) || config.text_size || 45) * scale}px Inter`;
      ctx.fillStyle    = colorInput.value;
      ctx.textAlign    = alignSelect.value;
      ctx.textBaseline = 'middle';

      let textX;
      if (alignSelect.value === 'left') {
        textX = -rect.width/2 * scale;
      } else if (alignSelect.value === 'right') {
        textX = rect.width/2 * scale;
      } else {
        textX = 0;
      }
      ctx.fillText(text, textX, 0);
      ctx.restore();
    }
  }

  function toCanvasCoords(e) {
    const rectCanvas = canvasEl.getBoundingClientRect();
    return {
      x: (e.clientX - rectCanvas.left),
      y: (e.clientY - rectCanvas.top)
    };
  }

  // Mouse down: start drag if inside rectangle bounds
  canvasEl.addEventListener('mousedown', e => {
    const { scale, offsetX, offsetY } = getScaleOffsets();
    const m = toCanvasCoords(e);
    const imgX = (m.x - offsetX) / scale;
    const imgY = (m.y - offsetY) / scale;
    if (imgX >= rect.x - rect.width/2 && imgX <= rect.x + rect.width/2 &&
        imgY >= rect.y - rect.height/2 && imgY <= rect.y + rect.height/2) {
      isDragging = true;
      dragOffset.x = imgX - rect.x;
      dragOffset.y = imgY - rect.y;
    }
  });

  // Mouse move: update rectangle center and inputs
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const { scale, offsetX, offsetY } = getScaleOffsets();
    const m = toCanvasCoords(e);
    const imgX = (m.x - offsetX) / scale;
    const imgY = (m.y - offsetY) / scale;

    rect.x = imgX - dragOffset.x;
    rect.y = imgY - dragOffset.y;
    posXInput.value = Math.round(rect.x);
    posYInput.value = Math.round(rect.y);
    draw();
  });

  // Mouse up: stop dragging
  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // On image load: initialize inputs and draw
  image.onload = () => {
    posXInput.value   = rect.x;
    posYInput.value   = rect.y;
    widthInput.value  = config.width || rect.width;
    heightInput.value = config.height || rect.height;
    // Initialize angle input to config if empty
    if (!angleInput.value) angleInput.value = config.skew_angle || 0;
    draw();
  };

  // File selection: load new image
  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (!f) return;
    hiddenInput.value = f.name;
    const reader = new FileReader();
    reader.onload = e => { image.src = e.target.result; };
    reader.readAsDataURL(f);
  });

  // On any input change: update rect params and redraw
  [textInput, sizeInput, angleInput, alignSelect, colorInput,
   posXInput, posYInput, widthInput, heightInput]
    .forEach(el => el.addEventListener('input', () => {
      rect.x      = parseInt(posXInput.value, 10) || rect.x;
      rect.y      = parseInt(posYInput.value, 10) || rect.y;
      rect.width  = parseInt(widthInput.value, 10) || rect.width;
      rect.height = parseInt(heightInput.value, 10) || rect.height;
      draw();
    }));

  // Load initial image if set
  if (config.custom_image) image.src = config.custom_image;
})();

