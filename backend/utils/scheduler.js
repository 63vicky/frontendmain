const { cleanupOldFiles } = require('./fileCleanup');

/**
 * Initialize scheduled tasks
 */
const initScheduledTasks = () => {
  // Schedule file cleanup to run daily
  setInterval(async () => {
    console.log('Running scheduled file cleanup task...');
    
    try {
      // Keep files for 7 days
      const result = await cleanupOldFiles(7);
      
      if (result.success) {
        console.log(`File cleanup completed. Deleted ${result.deletedCount} files.`);
        
        if (result.errors.length > 0) {
          console.warn('Some files could not be deleted:', result.errors);
        }
      } else {
        console.error('File cleanup failed:', result.errors);
      }
    } catch (err) {
      console.error('Error running file cleanup task:', err);
    }
  }, 24 * 60 * 60 * 1000); // Run every 24 hours
  
  console.log('Scheduled tasks initialized');
};

module.exports = {
  initScheduledTasks
};
