/**
 * Validates exam data
 * @param {Object} examData - The exam data to validate
 * @returns {string|null} - Error message if validation fails, null if validation passes
 */
const validateExam = (examData) => {
  const { title, subject, class: className, chapter, duration, startDate, endDate, attempts } = examData;

  // Check required fields
  if (!title || !subject || !className || !chapter) {
    return 'All fields are required';
  }

  // Validate duration
  if (!duration || duration < 5 || duration > 180) {
    return 'Duration must be between 5 and 180 minutes';
  }

  // Validate attempts
  if (!attempts || attempts < 1 || attempts > 5) {
    return 'Maximum attempts must be between 1 and 5';
  }

  // Validate dates
  if (!startDate || !endDate) {
    return 'Start and end dates are required';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Invalid date format';
  }

  if (end <= start) {
    return 'End date must be after start date';
  }

  return null;
};

module.exports = {
  validateExam
}; 