import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Source URLs for models - using a more reliable source
const MODELS = {
  TINY_FACE_DETECTOR: {
    MODEL: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json',
    WEIGHTS: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1',
    MANIFEST: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json'
  },
  FACE_EXPRESSION: {
    MODEL: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json',
    WEIGHTS: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1',
    MANIFEST: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json'
  }
};

// Target directories relative to project root
const MODEL_DIRS = {
  TINY_FACE_DETECTOR: path.resolve(path.join(__dirname, '../public/models/tiny_face_detector')),
  FACE_EXPRESSION: path.resolve(path.join(__dirname, '../public/models/face_expression_model'))
};

/**
 * Downloads a file from a URL
 */
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${destination}...`);
    
    const file = fs.createWriteStream(destination);
    
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${url} successfully`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(destination, () => {}); // Delete the file on error
      reject(err);
    });
    
    file.on('error', err => {
      fs.unlink(destination, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

/**
 * Ensures the model directory exists
 */
async function ensureModelDirExists(dir) {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } catch (err) {
    console.error(`Error creating directory ${dir}:`, err);
    throw err;
  }
}

/**
 * Downloads all models
 */
async function downloadModels() {
  try {
    console.log('Starting model download...');
    
    // Ensure model directories exist
    await Promise.all([
      ensureModelDirExists(MODEL_DIRS.TINY_FACE_DETECTOR),
      ensureModelDirExists(MODEL_DIRS.FACE_EXPRESSION)
    ]);
    
    // Download Tiny Face Detector models
    await Promise.all([
      downloadFile(
        MODELS.TINY_FACE_DETECTOR.MODEL, 
        path.join(MODEL_DIRS.TINY_FACE_DETECTOR, 'model.json')
      ),
      downloadFile(
        MODELS.TINY_FACE_DETECTOR.WEIGHTS, 
        path.join(MODEL_DIRS.TINY_FACE_DETECTOR, 'tiny_face_detector_model-shard1')
      ),
      downloadFile(
        MODELS.TINY_FACE_DETECTOR.MANIFEST, 
        path.join(MODEL_DIRS.TINY_FACE_DETECTOR, 'tiny_face_detector_model-weights_manifest.json')
      )
    ]);
    
    // Download Face Expression models
    await Promise.all([
      downloadFile(
        MODELS.FACE_EXPRESSION.MODEL, 
        path.join(MODEL_DIRS.FACE_EXPRESSION, 'model.json')
      ),
      downloadFile(
        MODELS.FACE_EXPRESSION.WEIGHTS, 
        path.join(MODEL_DIRS.FACE_EXPRESSION, 'face_expression_model-shard1')
      ),
      downloadFile(
        MODELS.FACE_EXPRESSION.MANIFEST, 
        path.join(MODEL_DIRS.FACE_EXPRESSION, 'face_expression_model-weights_manifest.json')
      )
    ]);
    
    console.log('All models downloaded successfully!');
  } catch (error) {
    console.error('Error downloading models:', error);
    process.exit(1);
  }
}

// Run the download
downloadModels(); 