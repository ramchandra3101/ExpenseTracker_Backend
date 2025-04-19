import { sequelize } from "../config/db.config.js";
import User from "../models/User.js";
import PaymentMethod from "../models/PaymentMethod.js";
import Category from "../models/Category.js";
import Expense from "../models/Expense.js";
import jwt from "jsonwebtoken";     
import dotenv from "dotenv";


dotenv.config();

let authenticatedUser;
let authtoken;
let testPaymentMethod;
let testCategory;

describe("Expense tests:", () => {
    beforeAll(async () => {
        await sequelize.sync({force: true});
        const userData = {
            username: "expensetestuser",
            first_name: "Expense",
            last_name: "Test",
            email:"expense@test.com",
            password_hash: "testpassword",
        }
        authenticatedUser = await User.create(userData);

        testCategory = await Category.create({
            user_id : authenticatedUser.user_id,
            name: "Telugu Movies",
        });
        testPaymentMethod = await PaymentMethod.create({
            user_id : authenticatedUser.user_id,
            name: "Discover Credit Card",
            type: "Credit",
        });

        authtoken = jwt.sign(
                    {id: authenticatedUser.user_id},
                    process.env.JWT_SECRET_KEY,
                    {
                        expiresIn: process.env.JWT_EXPIRES_IN
                    }   
                );
    });

    afterAll(async () => {
        await sequelize.close();
    });

    test("Should create a new expense", async () => {
        const expensedata = {
            user_id: authenticatedUser.user_id,
            category: testCategory.category_id,
            payment_method_id: testPaymentMethod.payment_method_id,
            amount: 100.50,
            description: "Test expense",
            expense_date: new Date('05/10/2023'),
            is_recurring: false,
        };
        const expense = await Expense.create(expensedata);

        expect(expense).toBeDefined();
        expect(expense.expense_id).toBeDefined();
        expect(expense.amount).toBe(expensedata.amount);
        expect(expense.description).toBe(expensedata.description);
        expect(expense.expense_date).toEqual(new Date('05/10/2023'));
        expect(expense.is_recurring).toBe(false)
    })

    test("Should test expense is stored in Database", async () => {
        const expenses = [
            {
                user_id : authenticatedUser.user_id,
                category: testCategory.category_id,
                payment_method_id: testPaymentMethod.payment_method_id,
                amount : 20.50,
                description: "Groceries",
                expense_date: new Date('2023-05-01')
            },
            {
                user_id : authenticatedUser.user_id,
                category: testCategory.category_id,
                payment_method_id: testPaymentMethod.payment_method_id,
                amount: 60.00,
                description:"Cienmark",
                expense_date: new Date('2024-07-01')
            }
        ]
        await Promise.all(expenses.map(expense=>Expense.create(expense)))

        const [results, metadata] = await sequelize.query(
            "SELECT * FROM expensestrack.expenses WHERE user_id= :user_id",
            {
                replacements: {user_id:authenticatedUser.user_id}
            }
        );
        expect(results).toBeDefined();
        expect(results.length).toBe(3);

        const expenseDescriptions = results.map(expense => expense.description);
        expect(expenseDescriptions).toContain("Groceries");
        expect(expenseDescriptions).toContain("Cienmark")


        const totalAmount  = results.reduce((sum, expense) => sum + parseFloat(expense.amount),0)
        expect(totalAmount).toBeCloseTo(181)
    });
})



