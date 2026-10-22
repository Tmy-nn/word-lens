# Reproducibility and attribution

## Source checkout

Use Node.js 22 and the committed npm lockfile:

```sh
npm ci --ignore-scripts
npm run prepare:assets
npm run verify:assets
npm test
npm run build
npm run dev
```

The public source snapshot excludes model weights, runtime bundles and WebAssembly binaries. `prepare:assets` reconstructs them and validates each file's size and SHA-256 against the committed manifests. Existing matching files are reused. Existing mismatching files cause failure and are never overwritten. Interrupted downloads are not written before their checks pass.

- MediaPipe runtime files are copied from the pinned npm package.
- ONNX Runtime files are copied from the pinned npm package.
- The unchanged EfficientDet-Lite2 model is downloaded from Google's model storage URL recorded in its manifest.
- The converted Open Images ONNX model is downloaded from the existing Word Lens static distribution. It is an app-maintained conversion, not an official Google ONNX release. Its hash and provenance are recorded in `public/expanded/manifest.json`.
- Licenses, notices and labels are included in the source snapshot.

The ONNX download depends on that existing public distribution remaining available. A durable release artifact or other approved mirror should replace that dependency if the project needs independent long-term distribution. A hash mismatch fails closed; do not simply edit a manifest to bypass it.

## Model conversion provenance

The expanded manifest records the official TensorFlow source archive, its digest, the label-map source and conversion settings. The recorded process used TensorFlow 2.15.1, tf2onnx 1.16.1 and ONNX opset 13, then stored large weight tensors as per-output-channel int8 values decoded to float32. It did not retrain the model. Preprocessing and classwise NMS run in the app's worker.

The public snapshot provides reproducible acquisition of the recorded model artifact, not a promise of byte-identical model regeneration from TensorFlow. Conversion tooling and development history are intentionally outside this snapshot. The label source URL in the historical manifest points to an upstream branch; the checked-in labels and hashes pin the artifact actually used by the app.

## Verification boundaries

On 2026-10-22, an isolated source snapshot was verified with a fresh npm dependency installation, remote model acquisition, asset hash verification, unit tests and a production build. The installed dependencies were not copied from the development workspace. The browser end-to-end script also passed against that snapshot's production build. This verifies acquisition of the currently hosted artifacts, not their permanent availability. See [release checks](release-checks.md) for scope and remaining device checks.

Unit tests exercise vocabulary coverage, object selection, geometry and voice selection. CI also prepares and verifies assets and builds the static application. CI does not exercise a real camera, listen to speech, prove recognition accuracy across the trained classes, or test an iPhone. Browser end-to-end checks and device testing are separate release checks.

The exported `e2e-event.mjs` is independent of private fixtures. After building, run `npm run test:e2e` with a locally installed Chrome browser. Alternatively install Playwright's Chromium (`npx playwright install chromium`) and set `LENS_BROWSER_CHANNEL=chromium` in your shell. The script serves the built output with the shipped CSP and exercises the bundled sample against the real models. Camera frames and speech playback are simulated. Screenshots go to the operating system's temporary directory, or to an explicit external directory set through `LENS_QA_DIR`.

Historical performance figures from development are not benchmarks for every phone or browser. A model supporting a class does not mean every instance of that class is recognized.

## Licenses

Third-party software and model notices live in `public/THIRD_PARTY.txt`, `public/detector/LICENSE.txt`, and `public/expanded/`. Runtime and model licenses do not automatically license the app's own source. The owner must choose an application source license before describing this repository as open source; until then do not assume permission to redistribute or modify the application code.

## Hosting

The generated `wrangler.jsonc` uses a generic demo Worker name with no production route or account binding. Build locally and inspect `dist-detector/` before a separately authorized deployment. Do not publish the source repository directory as the assets directory. Hosting account setup, terms and deployment authorization are separate from CI; the workflow never deploys.
