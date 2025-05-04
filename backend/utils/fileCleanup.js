const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const BulkUpload = require('../models/BulkUpload');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

/**
 * Delete files that are older than the specified number of days
 * @param {number} days - Number of days to keep files
 * @returns {Promise<{success: boolean, deletedCount: number, errors: Array}>}
 */
const cleanupOldFiles = async (days = 7) => {
  try {
    // Calculate the date threshold
    const now = new Date();
    const threshold = new Date(now.setDate(now.getDate() - days));

    // Find all bulk uploads older than the threshold
    const oldUploads = await BulkUpload.find({
      createdAt: { $lt: threshold },
      fileDeleted: { $ne: true }
    }).lean();

    console.log(`Found ${oldUploads.length} uploads older than ${days} days`);

    // Track results
    const result = {
      success: true,
      deletedCount: 0,
      errors: []
    };

    // Delete each file
    for (const upload of oldUploads) {
      try {
        const filePath = path.join(__dirname, '..', 'uploads', upload.fileName);

        // Check if file exists
        try {
          await fs.access(filePath);

          // Delete the file
          await fs.unlink(filePath);

          // Update the BulkUpload record to mark file as deleted
          await BulkUpload.findByIdAndUpdate(upload._id, {
            $set: { fileDeleted: true }
          });

          result.deletedCount++;

          console.log(`Deleted file: ${upload.fileName}`);
        } catch (err) {
          // File doesn't exist, just log it
          console.log(`File not found: ${upload.fileName}`);
        }
      } catch (err) {
        result.errors.push({
          fileName: upload.fileName,
          error: err.message
        });
      }
    }

    return result;
  } catch (err) {
    console.error('Error cleaning up old files:', err);
    return {
      success: false,
      deletedCount: 0,
      errors: [{ error: err.message }]
    };
  }
};

module.exports = {
  cleanupOldFiles
};
