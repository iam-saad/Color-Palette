//Global Selectors
const colorDiv = document.querySelectorAll('.color');
const generate = document.querySelector('.generate');
const adjusts = document.querySelectorAll('.adjust');
const locks = document.querySelectorAll('.lock');
const slidersInput = document.querySelectorAll('.sliders input');
const controlIcons = document.querySelectorAll('.controls');
const currentHexes = document.querySelectorAll('.color h2');
const sliders = document.querySelectorAll('.sliders');
const popup = document.querySelector('.copied-container');
let initialHex;
let savedPalettes = [];

//function
const generateHex = () => {
	const hexColor = chroma.random();
	return hexColor;
};

const generateColor = () => {
	initialHex = [];
	colorDiv.forEach((div, index) => {
		const hex = generateHex();
		const hexText = div.children[0];

		if (locks[index].classList.contains('locked')) {
			initialHex.push(hexText.innerText);
			return;
		} else {
			//Adding Hex to initial Hex variable
			initialHex.push(hex.hex());
		}
		const color = chroma(hex);
		const slidersInput = div.querySelectorAll('.sliders input');
		const hue = slidersInput[0];
		const brightness = slidersInput[1];
		const saturation = slidersInput[2];

		div.style.backgroundColor = hex;
		hexText.innerText = hex;

		textContrast(hex, hexText);
		iconsContrast(hex, controlIcons[index].children);
		colorizeSlider(color, hue, brightness, saturation);
	});
	resetSliderValues();
};

const textContrast = (color, hexText) => {
	const luminance = chroma(color).luminance();
	luminance > 0.5
		? (hexText.style.color = 'black')
		: (hexText.style.color = 'white');
};

const iconsContrast = (color, icons) => {
	const luminance = chroma(color).luminance();
	Array.from(icons).forEach((icon) => {
		luminance > 0.5
			? (icon.style.color = 'black')
			: (icon.style.color = 'white');
	});
};

const colorizeSlider = (color, hue, brightness, saturation) => {
	//Brightness variables
	const midBright = color.set('hsl.l', 0.5);
	const brightScale = chroma.scale(['black', midBright, 'white']);

	//Saturation variables
	const noSat = color.set('hsl.s', 0);
	const fullSat = color.set('hsl.s', 1);
	const satScale = chroma.scale([noSat, color, fullSat]);

	//Saturation Input
	saturation.style.backgroundImage = `linear-gradient(to right,${satScale(
		0
	)},${satScale(1)})`;

	//Brightness Input
	brightness.style.backgroundImage = `linear-gradient(to right,${brightScale(
		0
	)},${brightScale(0.5)} ,${brightScale(1)})`;

	//Hue Input
	hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75), rgb(75,204,75), rgb(75, 204,204), rgb(75,75,204), rgb(204,75,204), rgb(75,75,75))`;
};

const hslControler = (e) => {
	const index =
		e.target.getAttribute('data-hue') ||
		e.target.getAttribute('data-bright') ||
		e.target.getAttribute('data-sat');

	const slidersInputs = colorDiv[index].querySelectorAll('input[type="range"');
	const hue = slidersInputs[0];
	const brightness = slidersInputs[1];
	const saturation = slidersInputs[2];

	const divColor = initialHex[index];
	const color = chroma(divColor)
		.set('hsl.h', hue.value)
		.set('hsl.l', brightness.value)
		.set('hsl.s', saturation.value);

	colorDiv[index].style.backgroundColor = color;
	colorizeSlider(color, hue, brightness, saturation);
};

const updateDivText = (slider) => {
	const index =
		slider.getAttribute('data-hue') ||
		slider.getAttribute('data-bright') ||
		slider.getAttribute('data-sat');

	const div = colorDiv[index];
	const color = div.style.backgroundColor;
	const hex = div.querySelector('h2');
	hex.innerHTML = chroma(color).hex();

	textContrast(color, hex);
	iconsContrast(color, controlIcons[index].children);
};

const openSlider = (index) => {
	const slider = sliders[index];
	const close = slider.querySelector('.close-adjustment');
	const activeSliders = document.querySelectorAll('.sliders.active');

	if (activeSliders.length === 0) {
		slider.classList.add('active');
	} else {
		activeSliders.forEach((activeSlider) => {
			if (
				activeSlider.classList.contains('active') ===
				slider.classList.contains('active')
			) {
				slider.classList.remove('active');
			} else {
				activeSlider.classList.remove('active');
				slider.classList.add('active');
			}
		});
	}

	close.addEventListener('click', () => {
		slider.classList.remove('active');
	});
};

const resetSliderValues = () => {
	const sliders = document.querySelectorAll('.sliders input');

	sliders.forEach((slider) => {
		switch (slider.name) {
			case 'hue-input':
				const hueColor = initialHex[slider.getAttribute('data-hue')];
				const hueValue = chroma(hueColor).hsl()[0];
				slider.value = Math.floor(hueValue);
				break;
			case 'brightness-input':
				const brightColor = initialHex[slider.getAttribute('data-bright')];
				const brightValue = chroma(brightColor).hsl()[1];
				slider.value = Math.floor(brightValue * 100) / 100;
				break;
			case 'saturation-input':
				const satColor = initialHex[slider.getAttribute('data-sat')];
				const satValue = chroma(satColor).hsl()[2];
				slider.value = Math.floor(satValue * 100) / 100;
				break;
		}
	});
};

const copiedToClipboard = (hex) => {
	const e = document.createElement('textarea');
	e.value = hex.innerText;
	document.body.appendChild(e);
	e.select();
	document.execCommand('copy');
	document.body.removeChild(e);

	//Popup animation
	const popupBox = popup.children[0];
	popup.classList.add('active');
	popupBox.classList.add('active');
};

//Event Listeners
generate.addEventListener('click', generateColor);

slidersInput.forEach((slider) => {
	slider.addEventListener('input', hslControler);
	slider.addEventListener('change', () => {
		updateDivText(slider);
	});
});

adjusts.forEach((adjust, index) => {
	adjust.addEventListener('click', () => {
		openSlider(index);
	});
});

locks.forEach((lock) => {
	lock.addEventListener('click', () => {
		if (!lock.classList.contains('locked')) {
			lock.children[0].classList.remove('fa-lock-open');
			lock.children[0].classList.add('fa-lock');
			lock.classList.add('locked');
		} else {
			lock.children[0].classList.add('fa-lock-open');
			lock.children[0].classList.remove('fa-lock');
			lock.classList.remove('locked');
		}
	});
});

currentHexes.forEach((hex) => {
	hex.addEventListener('click', () => {
		copiedToClipboard(hex);
	});
});

popup.addEventListener('transitionend', () => {
	const popupBox = popup.children[0];
	popup.classList.remove('active');
	popupBox.classList.remove('active');
});

//function call
generateColor();

//LOCAL STORAGE STUFF, save and library palette
const saveBtn = document.querySelector('.save');
const saveCont = document.querySelector('.save-container');
const savePopup = saveCont.children[0];
const closeSave = document.querySelector('.close-save');
const saveInput = document.querySelector('.save-palette');
const submitBtn = document.querySelector('.save-submit');
const library = document.querySelector('.library');
const libCont = document.querySelector('.library-container');
const libPopup = libCont.children[0];
const closeLib = document.querySelector('.close-library');

const openPalette = () => {
	saveCont.classList.add('active');
	savePopup.classList.add('active');
};

const closePalette = () => {
	saveCont.classList.remove('active');
	savePopup.classList.remove('active');
};

const savePalette = () => {
	if (saveInput.value) {
		const localPalettes = checkLocalStorage();
		const name = saveInput.value;
		if (localPalettes === false) {
			paletteNr = savedPalettes.length;
		} else {
			paletteNr = localPalettes[localPalettes.length - 1].nr + 1;
		}

		const colors = [];
		currentHexes.forEach((hex) => {
			colors.push(hex.innerText);
		});

		saveInput.value = '';
		const paletteObj = { name, colors, nr: paletteNr };
		savedPalettes.push(paletteObj);
		storeToLocal(paletteObj);
		closePalette();
	} else {
		alert('Please enter a palette name');
	}
};
const storeToLocal = (paletteObj) => {
	if (localStorage.getItem('palettes') === null) {
		localPalettes = [];
	} else {
		localPalettes = JSON.parse(localStorage.getItem('palettes'));
	}
	localPalettes.push(paletteObj);
	localStorage.setItem('palettes', JSON.stringify(localPalettes));
};

const deletePaletteFromLocal = (index, length) => {
	localPalettes = JSON.parse(localStorage.getItem('palettes'));

	if (length === 1) {
		localStorage.removeItem('palettes');
	} else {
		localPalettes.splice(index, 1);
		localStorage.setItem('palettes', JSON.stringify(localPalettes));
	}
	showSavePalette();
};

const checkLocalStorage = () => {
	if (localStorage.getItem('palettes') === null) {
		return false;
	} else {
		localPalettes = JSON.parse(localStorage.getItem('palettes'));
		return localPalettes;
	}
};

const selectPaletteFromLocal = (index) => {
	initialHex = [];
	const localPalettes = checkLocalStorage();
	const colors = localPalettes[index].colors;

	colors.forEach((color, colorIndex) => {
		const colorObj = chroma(color);
		const slidersInput =
			colorDiv[colorIndex].querySelectorAll('.sliders input');
		const hue = slidersInput[0];
		const brightness = slidersInput[1];
		const saturation = slidersInput[2];

		initialHex.push(color);

		colorDiv[colorIndex].style.backgroundColor = color;
		currentHexes[colorIndex].innerText = color;
		textContrast(colorObj, currentHexes[colorIndex]);
		iconsContrast(colorObj, controlIcons[colorIndex].children);
		colorizeSlider(colorObj, hue, brightness, saturation);
	});
	resetSliderValues();
};

const showSavePalette = () => {
	const paletteDivs = document.querySelectorAll('.custom-palette');
	paletteDivs.forEach((paletteDiv) => {
		libPopup.children[1].removeChild(paletteDiv);
	});
	if (localStorage.getItem('palettes') === null) {
		const div = document.createElement('div');
		div.classList.add('custom-palette');
		div.innerText = 'No Saved Palettes';
		libPopup.children[1].appendChild(div);
	} else {
		palettes = JSON.parse(localStorage.getItem('palettes'));
		palettes.forEach((palette) => {
			const paletteDiv = document.createElement('div');
			paletteDiv.classList.add('custom-palette');
			const title = document.createElement('h3');
			title.classList.add('palette-name');
			title.innerText = palette.name;
			const preview = document.createElement('div');
			preview.classList.add('small-preview');
			palette.colors.forEach((colorDiv) => {
				const smallDiv = document.createElement('div');
				smallDiv.style.backgroundColor = colorDiv;
				preview.appendChild(smallDiv);
			});
			const actionDiv = document.createElement('div');
			actionDiv.classList.add('actionDiv');
			const btnSelect = document.createElement('button');
			btnSelect.classList.add('pick-palette-select');
			btnSelect.classList.add(palette.nr);
			btnSelect.innerText = 'Select';
			const btnDelete = document.createElement('button');
			btnDelete.classList.add('pick-palette-delete');
			btnDelete.classList.add(palette.nr);
			btnDelete.innerText = 'Delete';

			actionDiv.appendChild(btnSelect);
			actionDiv.appendChild(btnDelete);

			paletteDiv.appendChild(title);
			paletteDiv.appendChild(preview);
			paletteDiv.appendChild(actionDiv);
			libPopup.children[1].appendChild(paletteDiv);
		});
		const selectBtns = document.querySelectorAll('.pick-palette-select');
		const deleteBtns = document.querySelectorAll('.pick-palette-delete');

		deleteBtns.forEach((deleteBtn, index) => {
			deleteBtn.addEventListener('click', () => {
				deletePaletteFromLocal(index, deleteBtns.length);
			});
		});

		selectBtns.forEach((selectBtn, index) => {
			selectBtn.addEventListener('click', () => {
				selectPaletteFromLocal(index);
			});
		});
	}
};

const openLibrary = () => {
	libCont.classList.add('active');
	libPopup.classList.add('active');
	showSavePalette();
};

const closeLibrary = () => {
	libCont.classList.remove('active');
	libPopup.classList.remove('active');
};

saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitBtn.addEventListener('click', savePalette);

library.addEventListener('click', openLibrary);
closeLib.addEventListener('click', closeLibrary);
