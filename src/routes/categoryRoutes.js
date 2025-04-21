import express from 'express';
import { getUserCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js'
 

const router = express.Router();


router.post('/createCategory', createCategory);
router.get('/getCategories', getUserCategories);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;

