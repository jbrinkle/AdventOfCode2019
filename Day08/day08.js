const { readFileInput } = require('../utils/readInput')
const imageData = readFileInput('input', '\n', false)[0]

console.log('-----DAY 6-----')

function transformData(dataStr) {
  return dataStr.toString().split('').map(c => parseInt(c));
}

function extractLayers(data, width, height) {
  const layerLength = width * height;
  if (!data || data.length % layerLength !== 0) {
    throw 'Corrupt data';
  }

  const layers = [];

  let layer = data.splice(0, layerLength);
  while (layer.length) {
    layers.push(layer);
    layer = data.splice(0, layerLength);
  }

  return layers;
}

function classifyPixels(layers) {
  return layers.map(layer => {
    const pixelData = {};
    layer.forEach(pixel => {
      pixelData[pixel] = (pixelData[pixel] ?? 0) + 1
    });
    return pixelData;
  });
}

function mergeLayers(layers) {
  const finalImage = Array(layers[0].length).fill(2);
  layers.forEach(layer => {
    layer.forEach((pixel, idx) => {
      finalImage[idx] = finalImage[idx] === 2 ? pixel : finalImage[idx]
    });
  });
  return finalImage;
}

function printLayer(layer, width) {
  let row = layer.splice(0, width);
  while (row.length) {
    console.log(row.join('').replaceAll('0', ' ').replaceAll('1', '*'));
    row = layer.splice(0, width);
  }
}


// const testData = '111116789012';
// const testData = '0222112222120000'
// const img_width = 3;
// const img_height = 2;

const img_width = 25;
const img_height = 6;
const data = transformData(imageData);
const layers = extractLayers(data, img_width, img_height);
const pixelData = classifyPixels(layers);

// part 1 - integrity check
let layerWithLeastZeros = undefined;
pixelData.forEach(layerPxData => {
  layerWithLeastZeros = layerWithLeastZeros === undefined || layerPxData['0'] < layerWithLeastZeros['0']
    ? layerPxData
    : layerWithLeastZeros
});

console.log(`Integrity check: ${layerWithLeastZeros['1'] * layerWithLeastZeros['2']}`);

// part 2 - image processing (finding top most visible pixel)

const mergedImg = mergeLayers(layers);
printLayer(mergedImg, 25)