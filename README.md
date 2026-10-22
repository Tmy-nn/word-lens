# Word Lens

**Point at an object. Select it. Learn its name in another language.**

Word Lens is a browser-based visual vocabulary app by Tomoya Nishimura / ACLab. Object detection runs on your device, with no inference API credential or metered AI API. Camera images are not uploaded by the app. Browser-provided speech may depend on remote voice services.

[Try Word Lens](https://word-lens.ai-knowledge-board.workers.dev/) · [Source on GitHub](https://github.com/Tmy-nn/word-lens)

## Try it

Open the app in a current browser. Use **Try a sample photo** to try the bundled chair photograph without granting camera access, or start the camera and point it at an everyday object. Select a detected box or object name, choose a translation language, and press the pronunciation button. English interface text and Spanish vocabulary are the defaults; saved choices take priority.

The model downloads on first use. Recognition is limited to the model's trained categories, and small or partly hidden objects can be missed. Changing the detector can help with different scenes. Use HTTPS or localhost for the camera. A supported browser and available device voices are required; this is not a guarantee of recognition accuracy or pronunciation quality on every device.

## Run locally

Prerequisites: Node.js 22, npm and internet access for dependency/model downloads.

```sh
npm ci --ignore-scripts
npm run prepare:assets
npm test
npm run build
npm run dev
```

Open the localhost URL printed by Vite. No account or inference service setup is required. The public source export supplies `prepare:assets`; the original development workspace uses separate preparation tools. See [reproducibility](docs/reproducibility.md) for asset sources, hashes and verification limits.

## What this demonstrates

- Browser-side computer vision using Web Workers, ONNX Runtime Web and MediaPipe.
- Explicit object selection with bounding boxes, authored multilingual vocabulary and device speech synthesis.
- A camera-free example that runs through the same real detector rather than showing a canned recognition result.
- Separate source and production asset allowlists, model provenance and checksummed acquisition.

The expanded Open Images detector supports 601 trained categories; the standard COCO detector supports 80. Those are model category counts, not a claim that every category has been tested in real scenes. These pretrained detectors are third-party models; the app does not claim to have trained them.

## Inspect the implementation

[Architecture](docs/architecture.md) explains the browser/worker boundaries. [Reproducibility and licenses](docs/reproducibility.md) covers setup, artifact download dependencies, CI and device-testing limits. [Credits](docs/credits.md) identifies the example photo and model/runtime notices.

The CI included in the public export installs locked dependencies, verifies model/runtime assets, runs unit tests and builds the static output. It does not deploy. Unit/CI checks do not prove real-camera accuracy, physical phone compatibility or audible speech quality; device testing is a separate release check.

## License status

Application source rights are reserved unless the owner supplies a separate source license. This is a portfolio source sample, not a grant of open-source reuse rights. Third-party models and runtimes retain their own licenses and notices under `public/`; the bundled example photograph has its own attribution. See [credits](docs/credits.md).
