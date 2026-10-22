# Event preparation checks

Status: English interface deployed to the existing Word Lens URL. Physical phone checks remain pending.

## Verified on 2026-10-22

- Fresh source snapshot: npm dependencies installed without reusing the development node_modules; downloaded both models using the documented setup script; every model/runtime file matched its pinned manifest.
- Unit tests: 14 passed, none failed. Production build passed in both the development workspace and the isolated public source snapshot.
- Real-model browser checks: sample detection with both model families, explicit selection, Spanish/English/Japanese words, missing-voice feedback, voice API calls, camera permission rejection and recovery, simulated camera stream, stopping, model failures and recovery, and stopping during loading.
- Layout checks at viewport widths 375, 390, 768 and 1440 px: no horizontal overflow; visible interactive elements at least 44 px tall.
- Browser checks under the shipped CSP: no page exceptions or cross-origin application requests in the tested flow; local OGP/favicon/license/sample routes returned 200 and protected source/credential/unknown routes returned 404. JavaScript-disabled guidance was readable.
- Independent reviewer checked desktop/phone-width screenshots, code and contrast. The missing-voice explanation was moved beside the result and the sample button wrapping issue was corrected.
- Creative checks: CSS type/spacing/radius checker passed; muted text on white 5.74:1; white on primary button 6.14:1; input border on white 3.71:1.

## Design decision

ACLab branding; application UI and web quality rules. Retain the existing Superhuman-based direction: one accent color, two radius values (6/20 px), and a .96 line-height for the large translated word. The working photo and selected word carry the interface; advanced voice/detector controls are disclosed on demand. The English display heading uses a system sans face so first use does not depend on remote fonts. The sample is a CC0 photo processed by the actual model.

## Remaining release checks

- Physical phone camera, especially iPhone/Safari, and speech playback listened to on the actual device.
- Production browser checks and response-header verification are recorded in the release report.
- Owner-selected application source license if open-source reuse is intended. Hosted CI results are independent of physical phone testing.
- First-use loading on venue/mobile networks. Models require a download; offline operation is not promised.

The simulated camera and mocked speech API are not evidence of real-camera accuracy or audible speech quality. No performance guarantee or real-scene coverage claim is made.

## Self-check

4/5 preparation gates verified: source/attribution, clean rebuild, browser flow, independent UI review. The remaining gate is a physical-device demonstration with camera and audible speech. The next improvement is to test the event phone on mobile data before the event. Deployment was explicitly authorized and completed; physical-device testing remains outside the automated preparation gates.

## Publication

The English interface was deployed to https://word-lens.ai-knowledge-board.workers.dev/ with Cloudflare Worker version `af6331f4-988f-4b05-a195-0f411d51c778`. The public source repository is https://github.com/Tmy-nn/word-lens. Application source rights remain reserved; public visibility is not an open-source license grant.

## Live verification

The deployed English build passed the real-model browser end-to-end checks on 2026-10-22: both sample detectors, language changes, explicit selection, camera-denial recovery, model-error recovery, cancellation, and protected source paths returning 404. Viewports 375/390/768/1440 px had no horizontal overflow and visible interactive elements were at least 44 px tall. No page exceptions or cross-origin application requests were recorded in the tested flow. Camera frames and speech output were simulated; physical camera and audible voice checks remain pending.

The production HTML returned HTTP 200 and lang=en, with the GitHub source link. CSP, camera-only permissions policy and nosniff headers were verified in the browser. Independent phone-width/desktop screenshot review found no blocking display issue.

GitHub Actions passed for source commit e456bbbe091e9b27f874cd6e4ac965ec5ebf250d: https://github.com/Tmy-nn/word-lens/actions/runs/39849209017 . It installs dependencies, retrieves and verifies the pinned assets, runs unit tests and builds the app on Linux.
