const Material = require('../models/Material');
const Class = require('../models/Class');
const { uploadToStorage, deleteFromStorage } = require('../utils/fileStorage');
const { handleError } = require('../utils/errorHandler');

/**
 * Get all materials with optional filtering
 */
exports.getAllMaterials = async (req, res) => {
  try {
    const { classId, search } = req.query;
    const query = {};

    // Filter by class if provided
    if (classId) {
      query.class = classId;
    }

    // Search by title or description if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const materials = await Material.find(query)
      .populate('class', 'name section')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: materials
    });
  } catch (error) {
    handleError(res, error, 'Error fetching materials');
  }
};

/**
 * Get a single material by ID
 */
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('class', 'name section')
      .populate('uploadedBy', 'name');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    handleError(res, error, 'Error fetching material');
  }
};

/**
 * Create a new material
 */
exports.createMaterial = async (req, res) => {
  try {
    const { title, description, classId } = req.body;
    
    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Handle file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload file to storage (cloud storage or local)
    const fileData = await uploadToStorage(req.file);

    // Create material
    const material = new Material({
      title,
      description,
      class: classId,
      uploadedBy: req.user._id,
      fileUrl: fileData.url,
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      fileSize: fileData.fileSize
    });

    await material.save();

    res.status(201).json({
      success: true,
      data: material,
      message: 'Material created successfully'
    });
  } catch (error) {
    handleError(res, error, 'Error creating material');
  }
};

/**
 * Update a material
 */
exports.updateMaterial = async (req, res) => {
  try {
    const { title, description, classId } = req.body;
    const materialId = req.params.id;

    // Find material
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if user is authorized to update
    if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this material'
      });
    }

    // Update fields
    if (title) material.title = title;
    if (description) material.description = description;
    if (classId) {
      // Check if class exists
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }
      material.class = classId;
    }

    // Handle file update if provided
    if (req.file) {
      // Delete old file
      await deleteFromStorage(material.fileUrl);
      
      // Upload new file
      const fileData = await uploadToStorage(req.file);
      
      // Update file data
      material.fileUrl = fileData.url;
      material.fileName = fileData.fileName;
      material.fileType = fileData.fileType;
      material.fileSize = fileData.fileSize;
    }

    await material.save();

    res.status(200).json({
      success: true,
      data: material,
      message: 'Material updated successfully'
    });
  } catch (error) {
    handleError(res, error, 'Error updating material');
  }
};

/**
 * Delete a material
 */
exports.deleteMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;

    // Find material
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if user is authorized to delete
    if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this material'
      });
    }

    // Delete file from storage
    await deleteFromStorage(material.fileUrl);

    // Delete material from database
    await material.remove();

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    handleError(res, error, 'Error deleting material');
  }
};

/**
 * Get materials by class ID
 */
exports.getMaterialsByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    
    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const materials = await Material.find({ class: classId })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: materials
    });
  } catch (error) {
    handleError(res, error, 'Error fetching materials by class');
  }
}; 