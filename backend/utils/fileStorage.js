const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure storage directory
const STORAGE_DIR = path.join(__dirname, '../uploads');
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:5000';

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

/**
 * Upload a file to storage
 * @param {Object} file - The file object from multer
 * @returns {Object} File data including URL and metadata
 */
exports.uploadToStorage = async (file) => {
  try {
    // Generate a unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(STORAGE_DIR, fileName);
    
    // Move file to storage directory
    await fs.promises.rename(file.path, filePath);
    
    // Return file data
    return {
      url: `${PUBLIC_URL}/uploads/${fileName}`,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Delete a file from storage
 * @param {String} fileUrl - The URL of the file to delete
 * @returns {Boolean} Success status
 */
exports.deleteFromStorage = async (fileUrl) => {
  try {
    // Extract filename from URL
    const fileName = fileUrl.split('/').pop();
    const filePath = path.join(STORAGE_DIR, fileName);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Delete file
      await fs.promises.unlink(filePath);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Get file info from storage
 * @param {String} fileUrl - The URL of the file
 * @returns {Object} File information
 */
exports.getFileInfo = async (fileUrl) => {
  try {
    // Extract filename from URL
    const fileName = fileUrl.split('/').pop();
    const filePath = path.join(STORAGE_DIR, fileName);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      const stats = await fs.promises.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    }
    
    return { exists: false };
  } catch (error) {
    console.error('Error getting file info:', error);
    throw new Error('Failed to get file information');
  }
}; 