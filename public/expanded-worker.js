/* SSD MobileNetV2 OpenImages V4, local CPU inference in a classic Worker.
 * Model attribution and modifications: expanded/THIRD_PARTY.txt.
 */
let session, labelNames, initialization, busy = false;
let canvas, context, pixelsFloat;
const assets = new URL('./expanded/', self.location.href).href;
const progress = (value, message) => self.postMessage({ type: 'progress', progress: value, percent: value, message });
const fail = (phase, error, id) => self.postMessage({ type: 'error', phase, id, message: error?.message || String(error) });
const closeBitmap = bitmap => { if (bitmap instanceof ImageBitmap) bitmap.close(); };
const clip = value => Math.max(0, Math.min(1, value));

async function initialize() {
  if (session) return;
  if (!initialization) initialization = (async () => {
    progress(0, 'Preparing the on-device engine');
    if (!self.ort) importScripts(assets + 'ort.wasm.min.js');
    ort.env.wasm.wasmPaths = assets;
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.proxy = false;
    const labelsResponse = await fetch(assets + 'labels.json');
    if (!labelsResponse.ok) throw Error('Could not load category labels');
    const labels = await labelsResponse.json();
    if (labels.length !== 601 || new Set(labels.map(item => item.id)).size !== 601 || labels.some(item => !Number.isInteger(item.id) || item.id < 1 || item.id > 601 || typeof item.label !== 'string')) throw Error('Invalid category labels');
    labelNames = Object.fromEntries(labels.map(item => [item.id, item.label]));
    progress(20, 'Loading the expanded object detector');
    const modelResponse = await fetch(assets + 'openimages-int8-weights.onnx');
    if (!modelResponse.ok) throw Error('Could not load the detector model');
    const model = await modelResponse.arrayBuffer();
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', model)), byte => byte.toString(16).padStart(2, '0')).join('');
    if (hash !== 'f9705e45c0b402217c74b1c03bb93007e780c9350962fe3caf132ad89a15613b') throw Error('Model integrity check failed');
    progress(75, 'Preparing on-device inference');
    session = await ort.InferenceSession.create(model, { executionProviders: ['wasm'] });
    progress(100, 'Ready to detect objects');
  })().catch(error => { initialization = undefined; throw error; });
  await initialization;
}

function iou(a, b) {
  const area = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
    * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return area / Math.max(1e-9, a.width * a.height + b.width * b.height - area);
}

self.onmessage = async ({ data }) => {
  if (data?.type === 'init') {
    try { await initialize(); self.postMessage({ type: 'ready' }); }
    catch (error) { fail('init', error, data.id); }
    finally { closeBitmap(data.bitmap); }
    return;
  }
  if (data?.type !== 'infer') { closeBitmap(data?.bitmap); return; }
  const { bitmap, id, timestamp } = data;
  if (busy) { closeBitmap(bitmap); fail('infer', new Error('Detector is busy'), id); return; }
  busy = true;
  let inputTensor, outputTensors;
  try {
    if (!session) throw Error('Detector has not been initialized');
    if (!(bitmap instanceof ImageBitmap) || !bitmap.width || !bitmap.height) throw Error('A nonempty ImageBitmap is required');
    if (!Number.isFinite(timestamp)) throw Error('A finite timestamp is required');
    const started = performance.now();
    canvas ||= new OffscreenCanvas(300, 300);
    context ||= canvas.getContext('2d', { alpha: false, willReadFrequently: true });
    pixelsFloat ||= new Float32Array(300 * 300 * 3);
    const ratio = 300 / Math.max(bitmap.width, bitmap.height);
    const width = bitmap.width * ratio, height = bitmap.height * ratio;
    const left = (300 - width) / 2, top = (300 - height) / 2;
    context.fillStyle = '#000'; context.fillRect(0, 0, 300, 300);
    context.drawImage(bitmap, left, top, width, height);
    const rgba = context.getImageData(0, 0, 300, 300).data;
    for (let offset = 0, destination = 0; offset < rgba.length; offset += 4) {
      pixelsFloat[destination++] = rgba[offset] / 127.5 - 1;
      pixelsFloat[destination++] = rgba[offset + 1] / 127.5 - 1;
      pixelsFloat[destination++] = rgba[offset + 2] / 127.5 - 1;
    }
    inputTensor = new ort.Tensor('float32', pixelsFloat, [1, 300, 300, 3]);
    outputTensors = await session.run({ 'Preprocessor/sub:0': inputTensor });
    const scores = outputTensors['Postprocessor/convert_scores:0'];
    const boxes = outputTensors['Postprocessor/Decode/transpose_1:0'];
    if (scores.dims.at(-1) !== 602 || boxes.dims.at(-1) !== 4) throw Error('Unexpected detector output');
    const candidates = [];
    for (let anchor = 0; anchor < boxes.dims[0]; anchor++) {
      const y = clip((boxes.data[anchor * 4] * 300 - top) / height);
      const x = clip((boxes.data[anchor * 4 + 1] * 300 - left) / width);
      const bottom = clip((boxes.data[anchor * 4 + 2] * 300 - top) / height);
      const right = clip((boxes.data[anchor * 4 + 3] * 300 - left) / width);
      if (![x, y, right, bottom].every(Number.isFinite) || right <= x || bottom <= y) continue;
      for (let category = 1; category <= 601; category++) {
        const score = scores.data[anchor * 602 + category];
        // Original model's published pipeline uses score 0.3 and classwise IoU 0.6.
        if (Number.isFinite(score) && score >= 0.3) candidates.push({ label: labelNames[category], score, box: { x, y, width: right - x, height: bottom - y } });
      }
    }
    candidates.sort((a, b) => b.score - a.score);
    const detections = [];
    for (const candidate of candidates) {
      if (detections.some(kept => kept.label === candidate.label && iou(kept.box, candidate.box) > 0.6)) continue;
      detections.push(candidate);
      if (detections.length >= 12) break;
    }
    self.postMessage({ type: 'result', id, timestamp, detections, ms: Math.round(performance.now() - started) });
  } catch (error) { fail('infer', error, id); }
  finally {
    for (const tensor of Object.values(outputTensors || {})) tensor.dispose();
    inputTensor?.dispose();
    closeBitmap(bitmap);
    busy = false;
  }
};
