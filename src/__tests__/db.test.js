
import { sequelize, connectDB, setupVectorExtension, executeVectorQuery } from "../config/db.config";

describe("Database Connection", () => {
    beforeAll(async () => {
        const isConnected = await connectDB();
        expect(isConnected).toBe(true);
    });

    afterAll(async () => {
        await sequelize.query("DELETE FROM expensestrack.expense_embeddings WHERE user_id = 'test-user'");
        await sequelize.close();
    });

    test("Should connect to Database and perform query", async () => {
        const [results] = await sequelize.query("SELECT 1 + 1 AS result");
        expect(results[0].result).toBe(2);
        console.log("Query Results:", results);
    });

    test("should commit a transaction", async() => {
        await sequelize.transaction(async (transaction) => {
            try {
                await sequelize.query("CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name VARCHAR(255))", { transaction });
                await sequelize.query("INSERT INTO test_table (name) VALUES ('Test Name')", { transaction });
                await sequelize.query("DROP TABLE IF EXISTS test_table", { transaction });
            
        
        
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        });
    }); 
});   

describe("Vector Exytension Tests", ()=>{
    test("Should setup vector extension and create tables", async() => {
        const result = await setupVectorExtension();
        expect(result).toBe(true);

        const [tableCheck] = await sequelize.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'expensestrack'
                AND table_name = 'expense_embeddings');`)
        expect(tableCheck[0].exists).toBe(true);

        const [columnCheck] = await sequelize.query(`
            SELECT column_name,data_type
            FROM information_schema.columns
            WHERE table_schema = 'expensestrack'
            AND table_name = 'expense_embeddings'`);

            const columnNames = columnCheck.map(col => col.column_name);
            expect(columnNames).toContain('id');
            expect(columnNames).toContain('expense_id');
            expect(columnNames).toContain('user_id');
            expect(columnNames).toContain('content');
            expect(columnNames).toContain('embedding');
            expect(columnNames).toContain('created_at');

            const [extensionCheck] = await sequelize.query(`
                SELECT EXISTS (
                SELECT FROM pg_extension WHERE extname='vector'
                );
            `);
            expect(extensionCheck[0].exists).toBe(true);
    }); 
})


