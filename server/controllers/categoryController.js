const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        if (req.query.tree === 'true') {
            // Fetch all categories without sorting to preserve seeded order for children
            const categories = await Category.find();
            const categoryMap = {};
            categories.forEach(cat => {
                categoryMap[cat._id] = { ...cat._doc, children: [] };
            });
            const tree = [];
            categories.forEach(cat => {
                if (cat.parent) {
                    if (categoryMap[cat.parent]) {
                        categoryMap[cat.parent].children.push(categoryMap[cat._id]);
                    }
                } else {
                    tree.push(categoryMap[cat._id]);
                }
            });
            // Sort only root categories in descending order (Z-A) to show Thangka Art first
            tree.sort((a, b) => b.name.localeCompare(a.name));
            return res.json(tree);
        }

        const categories = await Category.find().sort({ name: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
    try {
        const { name, parent, description } = req.body;
        const categoryExists = await Category.findOne({ name });

        if (categoryExists) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let ancestors = [];

        if (parent) {
            const parentCategory = await Category.findById(parent);
            if (parentCategory) {
                ancestors = [...parentCategory.ancestors, parentCategory._id];
            }
        }

        const category = await Category.create({
            name,
            parent: parent || null,
            ancestors,
            description,
            slug
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
    try {
        const { name, parent, description } = req.body;
        const updateData = {};
        if (name) {
            updateData.name = name;
            updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }
        if (parent !== undefined) {
            updateData.parent = parent || null;
            if (parent) {
                const parentCategory = await Category.findById(parent);
                if (parentCategory) {
                    updateData.ancestors = [...parentCategory.ancestors, parentCategory._id];
                }
            } else {
                updateData.ancestors = [];
            }
        }
        if (description !== undefined) updateData.description = description;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if category has children
        const childCategories = await Category.find({ parent: req.params.id });
        if (childCategories.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete category with associated sub-categories. Delete children first.'
            });
        }

        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
