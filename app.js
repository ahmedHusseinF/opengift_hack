/** @type {!HTMLBodyElement} */
const $body = document.body;
/** @type {!HTMLImageElement} */
const $original = document.querySelector('img#original');
/** @type {!HTMLImageElement} */
const $optimized = document.querySelector('img#optimized');

const compressor = new Compress();

function disableEv(ev) {
  ev.stopPropagation();
  ev.preventDefault();
}

$body.addEventListener('dragover', disableEv, false);
$body.addEventListener('dragenter', disableEv, false);
$body.addEventListener('dragleave', disableEv, false);
$body.addEventListener('drop', async ev => {
  disableEv(ev);

  const file = ev.dataTransfer.files[0];
  if (!(file.type.includes('jpg') || file.type.includes('jpeg'))) {
    alert('The image must be a jpg or a jpeg image');
    return;
  }

  // send an array of files because the lib cries
  optimize([file]);
});

/**
 * @desc inject text content to an ONE element matching the selector
 * @param {!string} selector
 * @param {!string} data
 */
function injectTextIntoDOM(selector, data) {
  document.querySelector(selector).textContent = data;
}

/**
 * @desc the main function to trigger the algorithm
 * @param {File[]} image
 */
async function optimize(image) {
  const results = await compressor.compress(image, {
    size: 10,
    quality: 0.7,
    resize: true
  });

  const optimizedImage = results[0];

  const reader = new FileReader();
  reader.onload = function(event) {
    $original.src = event.target.result;
  };
  reader.readAsDataURL(image[0]);

  console.log({ optimizedImage });

  $optimized.alt = optimizedImage.alt;
  $optimized.src = `${optimizedImage.prefix}${optimizedImage.data}`;

  [...document.querySelectorAll('.hide')].map(el =>
    el.classList.remove('hide')
  );

  injectTextIntoDOM('#original-name', optimizedImage.alt);
  injectTextIntoDOM(
    '#original-size',
    `${optimizedImage.initialSizeInMb.toFixed(2)} MB`
  );
  injectTextIntoDOM(
    '#optimized-name',
    `${optimizedImage.alt.split('.')[0]}_optimized.${
      optimizedImage.alt.split('.')[1]
    }`
  );
  injectTextIntoDOM(
    '#optimized-size',
    `${optimizedImage.endSizeInMb.toFixed(2)} MB`
  );
  injectTextIntoDOM(
    '#optimized-percent',
    `${optimizedImage.sizeReducedInPercent.toFixed(2)}%`
  );
}
