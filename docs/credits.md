# Credits and rights

Application: Tomoya Nishimura / ACLab. Application source is rights-reserved unless a separate license is provided by its owner.

## Example photograph

The bundled chair example is credited to Antonio Borrillo / Wikimedia Commons and supplied under CC0. Its source link and exact attribution are preserved in `public/samples/ATTRIBUTION.txt`. It is used as an input to the real detector; a particular object or confidence score is not hardcoded as a demonstration result. Other development photographs and test fixtures are excluded from the public source snapshot.

## Pretrained models and runtimes

- SSD MobileNet V2 Open Images V4: Google / TensorFlow Authors, Apache-2.0. The app distributes a converted ONNX artifact with weight-only int8 storage and float32 activations, without retraining.
- EfficientDet-Lite2: Google / TensorFlow, Apache-2.0. The model is used unchanged.
- ONNX Runtime Web: Microsoft Corporation, MIT.
- MediaPipe Tasks Vision: Google / MediaPipe Authors, Apache-2.0.

Full notices, source locations, modifications and hashes are in `public/THIRD_PARTY.txt`, `public/detector/manifest.json` and `public/expanded/manifest.json`, with full license texts alongside them. Those manifests describe the exact artifacts used by this app.

Legacy model attribution in the retained aggregate notice is historical; legacy model files are excluded from the current build and public source export. Authored vocabulary and translations are application content, separate from the pretrained models.
