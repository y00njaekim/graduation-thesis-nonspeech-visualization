const styleEditor = (() => {
  const rootFontSize = 16;

  function create(item, onSave, onClickOutside) {
    console.log('styleEditor create');
    const container = document.createElement('div');
    container.classList.add('style-editor');
    container.innerHTML = `
    <div class="container">
    <div class="grid">
      <div class="form-group">
        <label for="font">Font</label>
        <select id="font">
          <option value="" disabled selected>Select font</option>
          <option value="sans-serif">Sans-serif</option>
          <option value="serif">Serif</option>
          <option value="Nanum Pen Script">Nanum Pen Script</option>
          <option value="Nanum Brush Script">Nanum Brush Script</option>
          <option value="Black Han Sans">Black Han Sans</option>
        </select>
      </div>
      <div class="form-group">
        <label for="outline-width">Outline-width</label>
        <input id="outline-width" placeholder="42" type="number">
      </div>
      <div class="form-group">
        <label for="weight">Weight</label>
        <select id="weight">
          <option value="" disabled selected>Select weight</option>
          <option value="thin">Thin</option>
          <option value="extra-light">Extra-light</option>
          <option value="light">Light</option>
          <option value="normal">Normal</option>
          <option value="medium">Medium</option>
          <option value="semi-bold">Semi-bold</option>
          <option value="bold">Bold</option>
          <option value="extra-bold">Extra-bold</option>
          <option value="black">Black</option>
        </select>
      </div>
      <div class="form-group">
        <label for="outline-color">Outline-color</label>
        <input id="outline-color" type="color">
      </div>
      <div class="form-group">
        <label for="size">Size</label>
        <input id="size" placeholder="42" type="number">
      </div>
      <div class="form-group">
        <label for="shadow-hor">Shadow-hor</label>
        <input id="shadow-hor" placeholder="42" type="number">
      </div>
      <div class="form-group">
        <label for="letter-spacing">Letter-spacing</label>
        <input id="letter-spacing" placeholder="42" type="number">
      </div>
      <div class="form-group">
        <label for="shadow-vert">Shadow-vert</label>
        <input id="shadow-vert" placeholder="42" type="number">
      </div>
      <div class="form-group">
        <label for="color">Color</label>
        <input id="color" type="color">
      </div>
      <div class="form-group">
        <label for="shadow-blur">Shadow-blur</label>
        <input id="shadow-blur" placeholder="42" type="number">
      </div>
      <div class="form-group">
        <label for="shadow-color">Shadow-color</label>
        <input id="shadow-color" type="color">
      </div>
    </div>
  </div>
    `;

    const fontFamilySelect = container.querySelector('#font');
    const fontWeightSelect = container.querySelector('#weight');
    const outlineWidthInput = container.querySelector('#outline-width');
    const outlineColorPicker = container.querySelector('#outline-color');
    const fontSizeInput = container.querySelector('#size');
    const textShadowHorizontalInput = container.querySelector('#shadow-hor');
    const letterSpacingInput = container.querySelector('#letter-spacing');
    const textShadowVerticalInput = container.querySelector('#shadow-vert');
    const fontColorPicker = container.querySelector('#color');
    const textShadowBlurInput = container.querySelector('#shadow-blur');
    const textShadowColorPicker = container.querySelector('#shadow-color');

    fontFamilySelect.value = item.font_family;

    const fontWeightMap = {
      100: 'thin',
      200: 'extra-light',
      300: 'light',
      400: 'normal',
      500: 'medium',
      600: 'semi-bold',
      700: 'bold',
      800: 'extra-bold',
      900: 'black',
    };

    const fontWeightValue = fontWeightMap[item.font_weight];
    if (fontWeightValue) {
      fontWeightSelect.value = fontWeightValue;
    } else {
      fontWeightSelect.selectedIndex = 0;
    }

    const outlineMatch = item.outline.match(/(\d+)px solid (#[\da-fA-F]+)/);
    if (outlineMatch) {
      outlineWidthInput.value = outlineMatch[1];
      outlineColorPicker.value = outlineMatch[2];
    }

    if (item.font_size.includes('rem')) {
      fontSizeInput.value = parseFloat(item.font_size) * rootFontSize;
    } else {
      fontSizeInput.value = parseFloat(item.font_size);
    }
    letterSpacingInput.value = parseInt(item.letter_spacing);
    fontColorPicker.value = item.font_color;

    const textShadowMatch = item.text_shadow.match(/(-?\d+)px (-?\d+)px (\d+)px (#[\da-fA-F]+)/g);
    if (textShadowMatch) {
      const [shadow1, shadow2, shadow3] = textShadowMatch;
      const [, hor1, ver1, blur1, color1] = shadow1.match(
        /(-?\d+)px (-?\d+)px (\d+)px (#[\da-fA-F]+)/,
      );
      textShadowHorizontalInput.value = hor1;
      textShadowVerticalInput.value = ver1;
      textShadowBlurInput.value = blur1;
      textShadowColorPicker.value = color1;
    }


    const dispatchChangeEvent = () => {
      console.log('dispatchChangeEvent');
      const changeEvent = new CustomEvent('stylechange', {
        detail: {
          font_family: fontFamilySelect.value,
          font_weight: fontWeightSelect.value,
          font_size: fontSizeInput.value / rootFontSize + 'rem',
          font_color: fontColorPicker.value,
          letter_spacing: letterSpacingInput.value + 'px',
          text_stroke: `${outlineWidthInput.value}px ${outlineColorPicker.value}`,
          text_shadow: `${textShadowHorizontalInput.value}px ${textShadowVerticalInput.value}px ${textShadowBlurInput.value}px ${textShadowColorPicker.value}`,
        },
        bubbles: true,
      });
      container.dispatchEvent(changeEvent);
    };

    const handleClickOutside = (e) => {
      const updatedStyle = {
        font_family: fontFamilySelect.value,
        font_weight: fontWeightSelect.value,
        font_size: fontSizeInput.value / rootFontSize + 'rem',
        font_color: fontColorPicker.value,
        letter_spacing: letterSpacingInput.value + 'px',
        text_stroke: `${outlineWidthInput.value}px ${outlineColorPicker.value}`,
        text_shadow: `${textShadowHorizontalInput.value}px ${textShadowVerticalInput.value}px ${textShadowBlurInput.value}px ${textShadowColorPicker.value}`,
      };
      if (onClickOutside(e, updatedStyle)) {
        document.removeEventListener('click', handleClickOutside);
      }
    };

    outlineWidthInput.addEventListener('input', dispatchChangeEvent);
    outlineColorPicker.addEventListener('input', dispatchChangeEvent);
    fontFamilySelect.addEventListener('change', dispatchChangeEvent);
    fontWeightSelect.addEventListener('change', dispatchChangeEvent);
    fontSizeInput.addEventListener('input', dispatchChangeEvent);
    textShadowHorizontalInput.addEventListener('input', dispatchChangeEvent);
    letterSpacingInput.addEventListener('input', dispatchChangeEvent);
    textShadowVerticalInput.addEventListener('input', dispatchChangeEvent);
    fontColorPicker.addEventListener('input', dispatchChangeEvent);
    textShadowBlurInput.addEventListener('input', dispatchChangeEvent);
    textShadowColorPicker.addEventListener('input', dispatchChangeEvent);

    document.addEventListener('click', handleClickOutside);

    return container;
  }

  function remove(container) {
    container.remove();
  }

  return {
    create,
    remove,
  };
})();

export default styleEditor;
