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
  const canvasEl    = document.getElementById('canvas');
  const ctx         = canvasEl.getContext('2d');
  const colorPreview = document.getElementById('colorPreview');
  const templateList = document.getElementById('templateList');
  const addTemplateBtn = document.getElementById('addTemplateBtn');
  const geoSelect = document.getElementById('geoSelect');
  const currencySelect = document.getElementById('currencySelect');
  const addGeoBtn = document.getElementById('addGeoBtn');
  const addCurrencyBtn = document.getElementById('addCurrencyBtn');
  const templateName = document.getElementById('templateName');
  const templateNameDisplay = document.getElementById('templateNameDisplay');
  const addTemplateNameBtn = document.getElementById('addTemplateNameBtn');
  const geoListInput = document.getElementById('geo_list');
  const currencyListInput = document.getElementById('currency_list');
  const configs     = window.adminConfigs || {};
  const config     = window.adminConfig || {};
  const fontWeight = config.font_weight || 900;

  let geoList = Array.isArray(config.geo_list) ? [...config.geo_list] : [];
  let currencyList = Array.isArray(config.currency_list) ? [...config.currency_list] : [];
  let countryCurrency = {};

  fetch('../config/country_curr.json')
    .then(res => res.json())
    .then(data => { 
      countryCurrency = data;
      currencies = [...new Set(Object.values(data))];
    })
    .catch(error => {
      console.error('Error loading JSON file:', error);
    });

  function renderGeoList() {
    geoSelect.innerHTML = '<option value=""></option>';
    geoList.forEach(val => {
      const option = document.createElement('option');
      option.value = val;
      option.textContent = val;
      geoSelect.appendChild(option);
    });
    geoListInput.value = JSON.stringify(geoList);
  }
  function renderCurrencyList() {
    currencySelect.innerHTML = '<option value=""></option>';
    currencyList.forEach(val => {
      const option = document.createElement('option');
      option.value = val;
      option.textContent = val;
      currencySelect.appendChild(option);
    });
    currencyListInput.value = JSON.stringify(currencyList);
  }

  const geoInput = document.getElementById('geoInput');
  const geoSuggestions = document.getElementById('geoSuggestions');
  const currencyInput = document.getElementById('currencyInput');
  const currencySuggestions = document.getElementById('currencySuggestions');

  addGeoBtn.addEventListener('click', () => {
    geoSelect.style.display = 'none';
    geoInput.style.display = 'block';
    geoInput.value = '';
    geoInput.focus();
    geoSuggestions.style.display = 'none';
  });

  addCurrencyBtn.addEventListener('click', () => {
    currencySelect.style.display = 'none';
    currencyInput.style.display = 'block';
    currencyInput.value = '';
    currencyInput.focus();
    currencySuggestions.style.display = 'none';
  });

  addTemplateNameBtn.addEventListener('click', () => {
    templateNameDisplay.style.display = 'none';
    templateName.style.display = 'block';
    templateName.focus();
  });

  // Add event listeners to manage active state of buttons
  function setupAddButtonHighlight(button, input) {
    input.addEventListener('focus', () => {
      button.classList.add('active-button');
    });
    input.addEventListener('blur', () => {
      // Delay removing the class to allow click events on suggestions
      setTimeout(() => {
        if (!input.matches(':focus')) { // Check if focus is still not on input
          button.classList.remove('active-button');
        }
      }, 100);
    });
  }

  setupAddButtonHighlight(addTemplateNameBtn, templateName);
  setupAddButtonHighlight(addGeoBtn, geoInput);
  setupAddButtonHighlight(addCurrencyBtn, currencyInput);

  geoInputHandler = function(e) {
    const val = geoInput.value.trim().toLowerCase();
    if (!val || Object.keys(countryCurrency).length === 0) {
      geoSuggestions.style.display = 'none';
      return;
    }
    const matches = Object.keys(countryCurrency).filter(
      c => c.toLowerCase().startsWith(val) && !geoList.includes(c)
    );
    if (matches.length === 0) {
      geoSuggestions.style.display = 'none';
      return;
    }
    geoSuggestions.innerHTML = matches.map(
      c => `<div class="autocomplete-suggestion">${c}</div>`
    ).join('');
    geoSuggestions.style.display = 'block';
  };

  currencyInputHandler = function(e) {
    const val = currencyInput.value.trim().toLowerCase();
    if (!val || !currencies || currencies.length === 0) {
      currencySuggestions.style.display = 'none';
      return;
    }
    const matches = currencies.filter(
      c => c.toLowerCase().startsWith(val) && !currencyList.includes(c)
    );
    if (matches.length === 0) {
      currencySuggestions.style.display = 'none';
      return;
    }
    currencySuggestions.innerHTML = matches.map(
      c => `<div class="autocomplete-suggestion">${c}</div>`
    ).join('');
    currencySuggestions.style.display = 'block';
    geoInput.style.display = 'none';
    geoSuggestions.style.display = 'none';
    geoSelect.style.display = 'block';
    geoSelect.focus();
  };

  geoSuggestionClickHandler = function(e) {
    if (!e.target.classList.contains('autocomplete-suggestion')) return;
    const country = e.target.textContent;
    geoList.push(country);
    renderGeoList();
    geoSelect.value = country;
    geoListInput.value = JSON.stringify(geoList);
    const curr = countryCurrency[country];
    if (curr && !currencyList.includes(curr)) {
      currencyList.push(curr);
      renderCurrencyList();
      currencySelect.value = curr;
      currencyListInput.value = JSON.stringify(currencyList);
    }
    geoInput.style.display = 'none';
    geoSuggestions.style.display = 'none';
    geoSelect.style.display = 'block';
  };

  currencySuggestionClickHandler = function(e) {
    if (!e.target.classList.contains('autocomplete-suggestion')) return;
    const currency = e.target.textContent;
    currencyList.push(currency);
    renderCurrencyList();
    currencySelect.value = currency;
    currencyListInput.value = JSON.stringify(currencyList);
    currencyInput.style.display = 'none';
    currencySuggestions.style.display = 'none';
    currencySelect.style.display = 'block';
    currencySelect.focus();
  };

  document.addEventListener('click', function(e) {
    const isGeoInput = e.target === geoInput || geoInput.contains(e.target);
    const isGeoSelect = e.target === geoSelect || geoSelect.contains(e.target);
    const isGeoBtn = e.target === addGeoBtn;
    const isGeoSuggestions = e.target === geoSuggestions || geoSuggestions.contains(e.target);

    const isCurrencyInput = e.target === currencyInput || currencyInput.contains(e.target);
    const isCurrencySelect = e.target === currencySelect || currencySelect.contains(e.target);
    const isCurrencyBtn = e.target === addCurrencyBtn;
    const isCurrencySuggestions = e.target === currencySuggestions || currencySuggestions.contains(e.target);

    if (!isGeoInput && !isGeoSelect && !isGeoBtn && !isGeoSuggestions) {
      geoInput.style.display = 'none';
      geoSuggestions.style.display = 'none';
      geoSelect.style.display = 'block';
    }

    if (!isCurrencyInput && !isCurrencySelect && !isCurrencyBtn && !isCurrencySuggestions) {
      currencyInput.style.display = 'none';
      currencySuggestions.style.display = 'none';
      currencySelect.style.display = 'block';
    }

    if (!templateName.contains(e.target) && e.target !== addTemplateNameBtn) {
      templateName.blur();
    }
  });

  geoInput.addEventListener('input', geoInputHandler);
  geoSuggestions.addEventListener('mousedown', geoSuggestionClickHandler);
  currencyInput.addEventListener('input', currencyInputHandler);
  currencySuggestions.addEventListener('mousedown', currencySuggestionClickHandler);

  function removeEmptyOption(event) {
    const selectElement = event.target;
    if (selectElement.options.length > 0 && selectElement.options[0].value === '') {
      selectElement.remove(0);
    }
  }

  // Remove mousedown event listeners
  // geoSelect.removeEventListener('mousedown', removeEmptyOption);
  // currencySelect.removeEventListener('mousedown', removeEmptyOption);

  // Add change event listeners instead
  geoSelect.addEventListener('change', function() {
    removeEmptyOption({ target: this });
    geoListInput.value = JSON.stringify(geoList);
    const country = this.value;
    const curr = countryCurrency[country];
    if (curr) {
      if (!currencyList.includes(curr)) {
        currencyList.push(curr);
        renderCurrencyList();
      }
      currencySelect.value = curr;
      currencyListInput.value = JSON.stringify(currencyList);
    }
    updateSectionTitle();
  });
  
  currencySelect.addEventListener('change', function() {
    removeEmptyOption({ target: this });
    currencyListInput.value = JSON.stringify(currencyList);
    updateSectionTitle();
  });

  function updateSectionTitle() {
    const selectedGeo = geoSelect.value;
    const selectedCurrency = currencySelect.value;
    const titleSpan = document.getElementById('selectedGeoCurrency');
    
    if (selectedGeo || selectedCurrency) {
      titleSpan.textContent = `${selectedGeo || ''}${selectedGeo && selectedCurrency ? ' / ' : ''}${selectedCurrency || ''}`;
    } else {
      titleSpan.textContent = 'Гео / Валюта';
    }
  }

  function loadTemplate(filename) {
    const templateConfig = configs[filename];
    if (!templateConfig) return;

    hiddenInput.value = filename;
    templateName.value = templateConfig.template_name || '';
    templateNameDisplay.textContent = templateConfig.template_name || 'Введите название шаблона';
    sizeInput.value = templateConfig.text_size;
    angleInput.value = templateConfig.skew_angle;
    alignSelect.value = templateConfig.text_alignment;
    colorInput.value = templateConfig.text_color.replace('#', '');
    posXInput.value = templateConfig.position_x;
    posYInput.value = templateConfig.position_y;
    const directionSelect = document.getElementById('directionSelect');
    if (directionSelect && templateConfig.direction) {
      directionSelect.value = templateConfig.direction;
    }

    geoList = Array.isArray(templateConfig.geo_list) ? [...templateConfig.geo_list] : [];
    currencyList = Array.isArray(templateConfig.currency_list) ? [...templateConfig.currency_list] : [];
    renderGeoList();
    renderCurrencyList();
    updateSectionTitle();

    rect.x = templateConfig.position_x;
    rect.y = templateConfig.position_y;

    updateColorPreview();
    
    if (templateConfig.image_data) {
      image.src = templateConfig.image_data;
      document.getElementById('image_data').value = templateConfig.image_data;
    } else {
      image.src = '';
      document.getElementById('image_data').value = '';
    }
  }

  addTemplateBtn.addEventListener('click', () => {
    document.getElementById('configForm').reset();
    hiddenInput.value = '';
    templateName.value = '';
    colorInput.value = '';
    rect.x = 0;
    rect.y = 0;
    geoList = [];
    currencyList = [];
    renderGeoList();
    renderCurrencyList();
    updateColorPreview();
    image.src = '';
    draw();
    updateTemplateList();
  });

  renderGeoList();
  renderCurrencyList();

  function updateTemplateList() {
    const items = templateList.querySelectorAll('.template-item');
    items.forEach(item => {
      item.classList.remove('active');
      if (item.dataset.filename === hiddenInput.value) {
        item.classList.add('active');
      }
    });
  }

  function updateColorPreview() {
    let hex = colorInput.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0,6);
    colorInput.value = hex;
    colorPreview.style.backgroundColor = hex ? `#${hex}` : 'transparent';
  }

  updateColorPreview();

  colorInput.addEventListener('input', updateColorPreview);

  let image = new Image();
  image.crossOrigin = 'anonymous';

  let rect = {
    x: config.position_x || 0,
    y: config.position_y || 0,
    width: 450,
    height: 100,
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

    let angle = parseFloat(angleInput.value);
    if (isNaN(angle)) {
      angle = (typeof config.skew_angle === 'number' ? config.skew_angle : 0);
    }
    const radians  = angle * Math.PI / 180;
    const skewValue = Math.tan(radians);
    const centerX  = offsetX + rect.x * scale;
    const centerY  = offsetY + rect.y * scale;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.transform(1, 0, skewValue, 1, 0, 0);
    ctx.rotate(-radians);
    ctx.fillStyle = rect.fill;
    ctx.fillRect(-rect.width/2 * scale, -rect.height/2 * scale, rect.width * scale, rect.height * scale);
    ctx.restore();

    const text = (textInput.value.trim() || '').toUpperCase();
    if (text) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.transform(1, 0, skewValue, 1, 0, 0);
      ctx.rotate(-radians);
      ctx.font         = `${fontWeight} italic ${(parseInt(sizeInput.value, 10) || config.text_size || 45) * scale}px Inter`;
      ctx.fillStyle    = '#' + colorInput.value.trim();
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

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  image.onload = () => {
    posXInput.value   = rect.x;
    posYInput.value   = rect.y;
    if (!angleInput.value) angleInput.value = config.skew_angle || 0;
    draw();
    updateTemplateList();
  };

  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (!f) return;
    hiddenInput.value = f.name;
    const reader = new FileReader();
    reader.onload = e => { 
      const base64Data = e.target.result;
      image.src = base64Data;
      document.getElementById('image_data').value = base64Data;
    };
    reader.readAsDataURL(f);
  });

  [textInput, sizeInput, angleInput, alignSelect, colorInput,
   posXInput, posYInput]
    .forEach(el => el.addEventListener('input', () => {
      rect.x      = parseInt(posXInput.value, 10) || rect.x;
      rect.y      = parseInt(posYInput.value, 10) || rect.y;
      draw();
    }));

  if (config.custom_image) image.src = config.custom_image;

  const deleteModal = document.getElementById('deleteModal');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  let templateToDelete = null;

  templateList.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.delete-template-btn');
    if (delBtn) {
      templateToDelete = delBtn.dataset.filename;
      deleteModal.style.display = 'flex';
      return;
    }
    const item = e.target.closest('.template-item');
    if (!item) return;
    loadTemplate(item.dataset.filename);
    updateTemplateList();
  });

  cancelDeleteBtn.addEventListener('click', () => {
    deleteModal.style.display = 'none';
    templateToDelete = null;
  });

  confirmDeleteBtn.addEventListener('click', () => {
    if (!templateToDelete) return;
    fetch('admin.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'delete_template=' + encodeURIComponent(templateToDelete)
    })
    .then(() => {
      const el = templateList.querySelector(`[data-filename="${templateToDelete}"]`);
      if (el) el.remove();
      deleteModal.style.display = 'none';
      templateToDelete = null;
      if (hiddenInput.value === templateToDelete) {
        document.getElementById('configForm').reset();
        hiddenInput.value = '';
        templateName.value = '';
        colorInput.value = '';
        rect.x = 0;
        rect.y = 0;
        geoList = [];
        currencyList = [];
        renderGeoList();
        renderCurrencyList();
        updateColorPreview();
        image.src = '';
        draw();
        updateTemplateList();
      }
    });
  });

  document.getElementById('configForm').addEventListener('submit', function(e) {
    if (!fileInput.files.length && hiddenInput.value) {
      const existingConfig = configs[hiddenInput.value];
      if (existingConfig && existingConfig.image_data) {
        const imageDataInput = document.createElement('input');
        imageDataInput.type = 'hidden';
        imageDataInput.name = 'image_data';
        imageDataInput.value = existingConfig.image_data;
        
        const existingInput = document.querySelector('input[name="image_data"]');
        if (existingInput) {
          existingInput.remove();
        }
        
        this.appendChild(imageDataInput);
      }
    }
  });

  window.addEventListener('load', function() {
    if (window.lastSavedTemplate) {
      const templateItem = document.querySelector(`.template-item[data-filename="${window.lastSavedTemplate}"]`);
      if (templateItem) {
        templateItem.click();
      }
    }
  });

  const uploadToClientBtn = document.getElementById('uploadToClientBtn');

  uploadToClientBtn.addEventListener('click', () => {
    const currentTemplate = document.querySelector('.template-item.active');
    if (!currentTemplate) {
      alert('Пожалуйста, выберите шаблон для загрузки на клиент');
      return;
    }

    const filename = currentTemplate.dataset.filename;
    const templateConfig = configs[filename];
    if (!templateConfig) {
      alert('Ошибка: шаблон не найден');
      return;
    }
    alert('Шаблон успешно загружен на клиент');
  });

  templateName.addEventListener('blur', function() {
    if (this.value.trim()) {
      templateNameDisplay.textContent = this.value;
    } else {
      templateNameDisplay.textContent = 'Введите название шаблона';
    }
    templateName.style.display = 'none';
    templateNameDisplay.style.display = 'block';
  });

  templateName.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      this.blur();
    }
  });
})();
