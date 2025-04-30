import { vectorPool, safeQuery, connectVectorDB } from '../config/vector.config.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('Vector Database Tests', () => {
  // Test database connection
  describe('Database Connection', () => {
    it('should connect to the database', async () => {
      const client = await vectorPool.connect();
      console.log('Connected to the database');
      const result = await client.query('SELECT 1 as result');
      client.release();
      
      expect(result.rows[0].result).to.equal(1);
    });
    
    it('should initialize the vector extension and create tables', async () => {
      const success = await connectVectorDB();
      expect(success).to.be.true;
      
      // Verify table exists
      const client = await vectorPool.connect();
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'expensestrack' 
          AND table_name = 'expense_embeddings'
        );
      `);
      client.release();
      
      expect(result.rows[0].exists).to.be.true;
    });
  });
  
  // Test safeQuery function
  describe('safeQuery Function', () => {
    // Create a test record
    const testUserId = 'test-user-123';
    const testExpenseId = 'test-expense-' + Date.now();
    const testEmbedding = Array(1536).fill(0.1);
    
    it('should insert a record with valid parameters', async () => {
      const query = `
        INSERT INTO expensestrack.expense_embeddings(user_id, embedding, expense_id)
        VALUES($1, $2, $3)
        RETURNING id
      `;
      
      const result = await safeQuery(query, [testUserId, testEmbedding, testExpenseId]);
      expect(result.rows[0].id).to.be.a('number');
    });
    
    it('should retrieve the inserted record', async () => {
      const query = `
        SELECT * FROM expensestrack.expense_embeddings
        WHERE expense_id = $1
      `;
      
      const result = await safeQuery(query, [testExpenseId]);
      expect(result.rows.length).to.equal(1);
      expect(result.rows[0].user_id).to.equal(testUserId);
    });
    
    it('should throw an error for invalid embedding values', async () => {
      const query = `
        INSERT INTO expensestrack.expense_embeddings(user_id, embedding, expense_id)
        VALUES($1, $2, $3)
      `;
      
      const invalidEmbedding = Array(1536).fill('not-a-number');
      
      try {
        await safeQuery(query, [testUserId, invalidEmbedding, 'another-id']);
        // Should not reach here
        expect.fail('Expected an error but none was thrown');
      } catch (error) {
        expect(error.message).to.include('Invalid embedding value');
      }
    });
    
    it('should throw an error for invalid user_id type', async () => {
      const query = `
        SELECT * FROM expensestrack.expense_embeddings
        WHERE user_id = $1
      `;
      
      try {
        await safeQuery(query, [{ invalid: 'object' }]);
        // Should not reach here
        expect.fail('Expected an error but none was thrown');
      } catch (error) {
        expect(error.message).to.include('Invalid user ID type');
      }
    });
  });
  
  // Clean up after tests
  afterAll(async () => {
    // Remove test data
    const client = await vectorPool.connect();
    await client.query('DELETE FROM expensestrack.expense_embeddings WHERE user_id LIKE $1', ['test-user-%']);
    client.release();
    
    // Close pool
    await vectorPool.end();
  });
});