
(function() {
  const imageInput     = document.getElementById('imageInput');
  const downloadBtn    = document.getElementById('downloadBtn');
  const textInput      = document.getElementById('textInput');
  const sizeInput      = document.getElementById('textSizeInput');
  const skewButton     = document.getElementById('skewButton');
  const skewAngleInput = document.getElementById('skew_angle');
  const canvas         = document.getElementById('canvas');
  const ctx            = canvas.getContext('2d');
  const geoSelect      = document.getElementById('geoSelect');
  const currencySelect = document.getElementById('currencySelect');


  const adminConfigs = window.adminConfig || {};
  let config = {};
  const keys = Object.keys(adminConfigs);
  if (keys.length) {
    config = adminConfigs[keys[keys.length - 1]];
  }

  let rectX = parseInt(config.position_x, 10) || 0;
  let rectY = parseInt(config.position_y, 10) || 0;
  let rectW = parseInt(config.width, 10)      || 100;
  let rectH = parseInt(config.height, 10)     || 50;

  let currentFontSize = parseInt(config.text_size, 10)   || 45;
  let currentAngle    = parseFloat(config.skew_angle)     || 0;
  let currentAlign    = config.text_alignment             || 'center';
  let currentColor    = config.text_color                 || '#000000';
  const fontWeight    = config.font_weight                || 900;
  const angles        = config.angles                     || [currentAngle];

  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    if (sizeInput)      sizeInput.value      = currentFontSize;
    if (skewAngleInput) skewAngleInput.value = currentAngle;
    if (skewButton)     skewButton.textContent = `НАКЛОН: ${currentAngle}°`;
    drawCanvas();
  };
  image.src = config.custom_image || 'assets/banner.png';

  if (imageInput) {
    imageInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const filename = file.name;
      const reader = new FileReader();
      reader.onload = ev => { image.src = ev.target.result; };
      reader.readAsDataURL(file);
      if (adminConfigs[filename]) {
        const c = adminConfigs[filename];
        rectX = parseInt(c.position_x, 10) || rectX;
        rectY = parseInt(c.position_y, 10) || rectY;
        rectW = parseInt(c.width, 10)      || rectW;
        rectH = parseInt(c.height, 10)     || rectH;
        currentFontSize = parseInt(c.text_size, 10) || currentFontSize;
        {
        const newAngle = parseFloat(c.skew_angle);
        if (!isNaN(newAngle)) currentAngle = newAngle;
      }
        currentAlign    = c.text_alignment           || currentAlign;
        currentColor    = c.text_color               || currentColor;
        if (sizeInput)      sizeInput.value      = currentFontSize;
        if (skewAngleInput) skewAngleInput.value = currentAngle;
        if (skewButton)     skewButton.textContent = `НАКЛОН: ${currentAngle}°`;
      }
    });
  }

  function getScaleOffsets() {
    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.min(cw / image.width, ch / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    return { scale, ox: (cw - w) / 2, oy: (ch - h) / 2 };
  }

  function drawCanvas() {
    if (!image.width) return;
    const { scale, ox, oy } = getScaleOffsets();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, ox, oy, image.width * scale, image.height * scale);

    const txt = textInput?.value.trim().toUpperCase() || '';
    if (!txt) return;

    const fs = parseInt(sizeInput?.value, 10);
    if (!isNaN(fs)) currentFontSize = fs;
    const ang = parseFloat(skewAngleInput?.value);
    if (!isNaN(ang)) currentAngle = ang;

    const rad = currentAngle * Math.PI / 180;
    const skew = Math.tan(rad);
    const cx = ox + rectX * scale;
    const cy = oy + rectY * scale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.transform(1, 0, skew, 1, 0, 0);
    ctx.rotate(-rad);

    ctx.font = `${fontWeight} italic ${currentFontSize * scale}px Inter`;
    ctx.fillStyle = currentColor;
    ctx.textAlign = currentAlign;
    ctx.textBaseline = 'middle';

    let x0;
    if (currentAlign === 'left') x0 = -rectW / 2 * scale;
    else if (currentAlign === 'right') x0 = rectW / 2 * scale;
    else x0 = 0;

    ctx.fillText(txt, x0, 0);
    ctx.restore();
  }

  textInput?.addEventListener('input', drawCanvas);
  sizeInput?.addEventListener('input', drawCanvas);
  skewAngleInput?.addEventListener('input', drawCanvas);

  skewButton?.addEventListener('click', () => {
    let idx = angles.indexOf(currentAngle);
    idx = (idx + 1) % angles.length;
    currentAngle = angles[idx];
    if (skewAngleInput) skewAngleInput.value = currentAngle;
    if (skewButton) skewButton.textContent = `НАКЛОН: ${currentAngle}°`;
    drawCanvas();
  });

  downloadBtn?.addEventListener('click', () => {
    const off = document.createElement('canvas');
    off.width  = 1000;
    off.height = 1000;
    const octx = off.getContext('2d');
  
    octx.clearRect(0, 0, off.width, off.height);
    const scale = Math.min(off.width  / image.width, 
                           off.height / image.height);
    const w     = image.width  * scale;
    const h     = image.height * scale;
    const ox    = (off.width  - w) / 2;
    const oy    = (off.height - h) / 2;
    octx.drawImage(image, ox, oy, w, h);
  
    const txt = textInput.value.trim().toUpperCase();
    if (txt) {
      const rad    = currentAngle * Math.PI / 180;
      const skew   = Math.tan(rad);
      const tx     = ox + rectX * scale;
      const ty     = oy + rectY * scale;
  
      octx.save();
      octx.translate(tx, ty);
      octx.transform(1, 0, skew, 1, 0, 0);
      octx.rotate(-rad);
      octx.font         = `${fontWeight} italic ${currentFontSize * scale}px Inter`;
      octx.fillStyle    = currentColor;
      octx.textAlign    = currentAlign;
      octx.textBaseline = 'middle';
      let x0;
      if (currentAlign === 'left')  x0 = -rectW/2 * scale;
      else if (currentAlign === 'right') x0 = rectW/2 * scale;
      else x0 = 0;
      octx.fillText(txt, x0, 0);
      octx.restore();
    }
  
    const promo = txt || 'PROMOCODE';
    const geo   = geoSelect.value.trim().toUpperCase();
    const cur   = currencySelect.value.trim().toUpperCase();
    const name  = `${promo}_${geo}_${cur}.png`;
  
    off.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href    = url;
      a.download= name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  });
  
    if (image.complete) drawCanvas();
})();
