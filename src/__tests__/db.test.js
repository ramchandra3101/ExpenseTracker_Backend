
import { sequelize, connectDB } from "../config/db.config";

describe("Database Connection", () => {
    beforeAll(async () => {
        const isConnected = await connectDB();
        expect(isConnected).toBe(true);
    });

    afterAll(async () => {
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