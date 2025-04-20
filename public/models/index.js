// Model paths for face-api.js
export const TINY_FACE_DETECTOR_PATH = '/models/tiny_face_detector';
export const FACE_EXPRESSION_PATH = '/models/face_expression_model';

// For use directly within the EmotionDetector component
export const MODEL_PATHS = {
  TINY_FACE_DETECTOR: '/models/tiny_face_detector',
  FACE_EXPRESSION: '/models/face_expression_model'
};

// Fallback CDNs for remote loading
export const FALLBACK_CDNS = {
  TINY_FACE_DETECTOR: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json',
  FACE_EXPRESSION: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json'
};

// CDN URLs for face-api.js models - using multiple CDN options for better reliability
export const CDN_URLS = {
  // Primary CDN - unpkg (reliable and fast)
  TINY_FACE_DETECTOR: 'https://unpkg.com/@vladmandic/face-api@1.7.12/model/tiny_face_detector',
  FACE_EXPRESSION: 'https://unpkg.com/@vladmandic/face-api@1.7.12/model/face_expression_model'
};

// Direct model manifest URLs (with specific model.json paths)
export const DIRECT_MODEL_URLS = {
  // Direct model.json URLs to avoid CORS and path issues
  TINY_FACE_DETECTOR: 'https://unpkg.com/@vladmandic/face-api@1.7.12/model/tiny_face_detector/model.json',
  FACE_EXPRESSION: 'https://unpkg.com/@vladmandic/face-api@1.7.12/model/face_expression_model/model.json'
};

// Local application paths (fallback when all remote options fail)
export const LOCAL_PATHS = {
  TINY_FACE_DETECTOR: TINY_FACE_DETECTOR_PATH,
  FACE_EXPRESSION: FACE_EXPRESSION_PATH
};
