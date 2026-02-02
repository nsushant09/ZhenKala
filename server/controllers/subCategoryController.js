const SubCategory = require('../models/SubCategory');

// @desc    Get all sub-categories
// @route   GET /api/subcategories
// @access  Public
exports.getSubCategories = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category) {
            query.category = category;
        }
        const subCategories = await SubCategory.find(query)
            .populate('category', 'name')
            .sort({ name: 1 });
        res.json(subCategories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new sub-category
// @route   POST /api/subcategories
// @access  Private/Admin
exports.createSubCategory = async (req, res) => {
    try {
        const { name, category } = req.body;

        // Check if sub-category already exists in the same category
        const subCategoryExists = await SubCategory.findOne({ name, category });
        if (subCategoryExists) {
            return res.status(400).json({ message: 'Sub-category already exists in this category' });
        }

        const subCategory = await SubCategory.create({ name, category });
        const populatedSubCategory = await subCategory.populate('category', 'name');
        res.status(201).json(populatedSubCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update sub-category
// @route   PUT /api/subcategories/:id
// @access  Private/Admin
exports.updateSubCategory = async (req, res) => {
    try {
        const subCategory = await SubCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('category', 'name');

        if (!subCategory) {
            return res.status(404).json({ message: 'Sub-category not found' });
        }

        res.json(subCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete sub-category
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
exports.deleteSubCategory = async (req, res) => {
    try {
        const subCategory = await SubCategory.findByIdAndDelete(req.params.id);

        if (!subCategory) {
            return res.status(404).json({ message: 'Sub-category not found' });
        }

        res.json({ message: 'Sub-category removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
