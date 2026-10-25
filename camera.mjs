import { FaceLandmarker, FilesetResolver } from './libs/tasks-vision.mjs';

export async function loadLandmarker() {
  const vision = await FilesetResolver.forVisionTasks('./wasm');
  let failure;
  for (const delegate of ['GPU', 'CPU']) {
    try {
      return await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: './models/face_landmarker.task', delegate },
        runningMode: 'VIDEO', numFaces: 2,
        minFaceDetectionConfidence: 0.6, minFacePresenceConfidence: 0.6, minTrackingConfidence: 0.6
      });
    } catch (error) { failure = error; }
  }
  throw new Error('The offline vision model could not start. Reload the app or use camera-free activities.', { cause: failure });
}

export function cameraError(error) {
  if (!window.isSecureContext) return 'Camera access needs HTTPS or localhost. Open the secure app address.';
  if (error?.name === 'NotAllowedError') return 'Camera permission was denied. Allow camera access in browser settings, then try again.';
  if (error?.name === 'NotFoundError') return 'No camera was found. You can still use the camera-free activities.';
  if (error?.name === 'NotReadableError') return 'The camera is busy. Close other camera apps and try again.';
  return error?.message || 'Camera could not start. Try again or choose a camera-free activity.';
}

export class CameraSession {
  constructor(video) { this.video = video; this.generation = 0; this.stream = null; }
  async start() {
    this.stop();
    const token = this.generation;
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access needs a supported browser on HTTPS or localhost.');
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
    if (token !== this.generation) { stream.getTracks().forEach(t => t.stop()); return false; }
    this.stream = stream;
    this.video.srcObject = stream;
    try { await this.video.play(); } catch (error) { if (token !== this.generation) return false; this.stop(); throw error; }
    return token === this.generation;
  }
  stop() {
    this.generation++;
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.video.srcObject = null;
  }
}
