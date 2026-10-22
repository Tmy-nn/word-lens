/* Classic Worker: all model execution stays off the UI thread. */
let detector;
let initialization;
let busy = false;
let lastTimestamp = -1;
let inputCanvas;
let inputContext;

const progress = (stage, value, message) => self.postMessage({ type: 'progress', stage, progress: value, message });
const fail = (phase, error, id) => self.postMessage({ type: 'error', phase, id, message: error?.message || String(error) });
const closeBitmap = bitmap => { if (bitmap instanceof ImageBitmap) bitmap.close(); };

async function initialize() {
  if (detector) return;
  if (!initialization) {
    initialization = (async () => {
      progress('runtime', 0, 'Preparing the on-device engine');
      importScripts('./detector/vision_bundle.js');
      const vision = await Vision.FilesetResolver.forVisionTasks(new URL('./detector/wasm', self.location.href).href);
      progress('model', 0.3, 'Loading the everyday object detector');
      detector = await Vision.ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: new URL('./detector/efficientdet_lite2.tflite', self.location.href).href,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        maxResults: 12,
        scoreThreshold: 0.45,
        displayNamesLocale: 'en',
      });
      progress('ready', 1, 'Ready to detect objects');
    })().catch(error => { initialization = undefined; throw error; });
  }
  await initialization;
}

const clamp = value => Math.max(0, Math.min(1, value));
self.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    try { await initialize(); self.postMessage({ type: 'ready' }); }
    catch (error) { fail('init', error, data.id); }
    return;
  }
  if (data.type !== 'infer') { closeBitmap(data.bitmap); return; }
  const { bitmap, id } = data;
  if (busy) { closeBitmap(bitmap); fail('infer', new Error('Detector is busy'), id); return; }
  busy = true;
  try {
    if (!detector) throw new Error('Detector has not been initialized');
    if (!(bitmap instanceof ImageBitmap) || !bitmap.width || !bitmap.height) throw new Error('A nonempty ImageBitmap is required');
    if (!Number.isFinite(data.timestamp)) throw new Error('A finite timestamp is required');
    // Preserve increasing graph timestamps even if the camera is restarted.
    const timestamp = Math.max(lastTimestamp + 1, data.timestamp);
    const started = performance.now();
    // The model expects square input. Letterbox rather than stretch tall/wide
    // camera frames; transform its pixel boxes back into the original bitmap.
    inputCanvas ||= new OffscreenCanvas(640, 640);
    inputContext ||= inputCanvas.getContext('2d', { alpha: false });
    const scale = 640 / Math.max(bitmap.width, bitmap.height);
    const drawnWidth = bitmap.width * scale, drawnHeight = bitmap.height * scale;
    const offsetX = (640 - drawnWidth) / 2, offsetY = (640 - drawnHeight) / 2;
    inputContext.fillStyle = '#000';
    inputContext.fillRect(0, 0, 640, 640);
    inputContext.drawImage(bitmap, offsetX, offsetY, drawnWidth, drawnHeight);
    const result = detector.detectForVideo(inputCanvas, timestamp);
    lastTimestamp = timestamp;
    const detections = result.detections.flatMap(({ boundingBox: box, categories }) => {
      const category = categories?.[0];
      if (!box || !category?.categoryName || !Number.isFinite(category.score)) return [];
      const x = clamp((box.originX - offsetX) / drawnWidth), y = clamp((box.originY - offsetY) / drawnHeight);
      const right = clamp((box.originX + box.width - offsetX) / drawnWidth), bottom = clamp((box.originY + box.height - offsetY) / drawnHeight);
      if (right <= x || bottom <= y) return [];
      return [{ label: category.categoryName, score: category.score, box: { x, y, width: right - x, height: bottom - y } }];
    });
    self.postMessage({ type: 'result', id, timestamp: data.timestamp, detections, ms: Math.round(performance.now() - started) });
  } catch (error) { fail('infer', error, id); }
  finally { closeBitmap(bitmap); busy = false; }
};
