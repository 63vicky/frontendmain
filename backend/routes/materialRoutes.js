const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', materialController.getAllMaterials);
router.get('/:id', materialController.getMaterialById);
router.get('/class/:classId', materialController.getMaterialsByClass);

// Protected routes (require authentication)
router.use(authenticate);

// Teacher and admin routes
router.post('/', 
  authorize('teacher', 'admin'), 
  upload.single('file'), 
  materialController.createMaterial
);

router.put('/:id', 
  authorize('teacher', 'admin'), 
  upload.single('file'), 
  materialController.updateMaterial
);

router.delete('/:id', 
  authorize('teacher', 'admin'), 
  materialController.deleteMaterial
);

module.exports = router; 