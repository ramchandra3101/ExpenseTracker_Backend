import { sequelize } from '../config/db.config.js';
import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import PaymentMethod from '../models/PaymentMethod.js';
import EmbeddingService from './EmbeddingService.js';
import { Op } from '@sequelize/core';

class RetrievalService {
    /**
     * Find similar expenses using vector similarity
     * @param {Array<number>} embedding - Query embedding vector
     * @param {number} userId - User ID for filtering
     * @param {number} limit - Maximum number of results
     * @returns {Promise<Array>} - Similar expenses
     */
    async findSimilarExpenses(embedding, userId, limit = 5) {
        try {
            // Convert embedding to PostgreSQL array format
            const embeddingString = `[${embedding.join(',')}]`;
            
            // Query using vector similarity
            const results = await sequelize.query(`
                SELECT e.*, c.name as category_name, pm.name as payment_method_name,
                    1 - (ee.embedding <=> :embedding) as similarity
                FROM expensestrack.expense_embeddings ee
                JOIN expensestrack.expenses e ON e.expense_id = ee.expense_id
                JOIN expensestrack.categories c ON c.category_id = e.category_id
                JOIN expensestrack.payment_methods pm ON pm.payment_method_id = e.payment_method_id
                WHERE e.user_id = :userId
                ORDER BY ee.embedding <=> :embedding
                LIMIT :limit
            `, {
                replacements: { 
                    embedding: embeddingString,
                    userId,
                    limit 
                },
                type: sequelize.QueryTypes.SELECT
            });
        }
    }
}