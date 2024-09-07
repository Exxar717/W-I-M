const express = require('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, liketheBlog } = require('../controller/blogCtrl');

const router = express.Router();

router.get('/', getAllBlogs);
router.post('/', authMiddleware, isAdmin, createBlog);
router.put('/likes', authMiddleware, liketheBlog);

router.put('/:id', authMiddleware, isAdmin, updateBlog);
router.get('/:id', getBlog);
router.delete('/:id', authMiddleware, isAdmin, deleteBlog);


module.exports = router;