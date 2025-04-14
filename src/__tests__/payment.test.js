import { sequelize } from "../config/db.config.js";
import User from "../models/User.js";
import PaymentMethod from "../models/PaymentMethod.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

let authenticatedUser;
let authtoken;


describe("PaymentMethod Tests", () => {
    // Set Up before all tests

    beforeAll(async () => {
        await sequelize.sync({force:true})
        const userData = {
            username : "paymenttest",
            first_name : "Payment",
            last_name : "Test",
            email: "payment@test.com",
            password_hash: "password123"
        }

        authenticatedUser = await User.create(userData);

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
    //Lets cleanup after each test
    afterEach(async () => {
        await PaymentMethod.destroy({where:{}});
    });
    test ("Should create a new payment method", async () => {
        const paymentMethodData = {
            user_id: authenticatedUser.user_id,
            name: "Credit Card",
            type: "Card",
            bank_name: "CITIBANK",
        };

        const paymentMethod = await PaymentMethod.create(paymentMethodData);

        expect(paymentMethod).toBeDefined();
        expect(paymentMethod.payment_method_id).toBeDefined();
        expect(paymentMethod.name).toBe(paymentMethodData.name);
        expect(paymentMethod.type).toBe(paymentMethodData.type);
        expect(paymentMethod.bank_name).toBe(paymentMethodData.bank_name);
    })

    test("Should create a payment method without bank name", async () => {
        const paymentData = {
          user_id: authenticatedUser.user_id,
          name: "Cash",
          type: "Cash"
        };
        
        const paymentMethod = await PaymentMethod.create(paymentData);
        
        expect(paymentMethod).toBeDefined();
        expect(paymentMethod.payment_method_id).toBeDefined();
        expect(paymentMethod.name).toBe(paymentData.name);
        expect(paymentMethod.type).toBe(paymentData.type);
        expect(paymentMethod.bank_name).toBeNull();
    });
    test("Should not create a payment method without required fields", async () => {
        // Missing name
        const paymentData1 = {
          user_id: authenticatedUser.user_id,
          type: "Card",
          bank_name: "Test Bank"
        };
        
        await expect(PaymentMethod.create(paymentData1)).rejects.toThrow();
        
        // Missing type
        const paymentData2 = {
          user_id: authenticatedUser.user_id,
          name: "Credit Card",
          bank_name: "Test Bank"
        };
        
        await expect(PaymentMethod.create(paymentData2)).rejects.toThrow();
        
        // Missing user_id
        const paymentData3 = {
          name: "Credit Card",
          type: "Card",
          bank_name: "Test Bank"
        };
        
        await expect(PaymentMethod.create(paymentData3)).rejects.toThrow();
      });

       test("Should verify payment methods are stored in the database", async () => {
        // Create several payment methods
        const paymentMethods = [
          {
            user_id: authenticatedUser.user_id,
            name: "Visa Card",
            type: "Credit Card",
            bank_name: "First Bank"
          },
          {
            user_id: authenticatedUser.user_id,
            name: "Debit Card",
            type: "Debit Card",
            bank_name: "Second Bank"
          },
          {
            user_id: authenticatedUser.user_id,
            name: "Cash",
            type: "Cash"
          }
        ];
        
       // Create all payment methods
        await Promise.all(paymentMethods.map(payment => PaymentMethod.create(payment)));
        
        // Query the database directly
        const [results, metadata] = await sequelize.query(
          "SELECT * FROM expensestrack.payment_methods WHERE user_id = :user_id",
          { 
            replacements: { user_id: authenticatedUser.user_id }
          }
        );

        console.log("Results: ", results);
        
        // Verify results
        expect(results).toBeDefined();

        expect(results.length).toBe(3);
        
        // Check if all payment methods were created
        const paymentNames = results.map(payment => payment.name);
        expect(paymentNames).toContain("Visa Card");
        expect(paymentNames).toContain("Debit Card");
        expect(paymentNames).toContain("Cash");
      });
  
      
      test("Should get payment methods for a specific user only", async () => {
        // Create a second test user
        const secondUser = await User.create({
          username: "seconduser",
          first_name: "Second",
          last_name: "User",
          email: "second@test.com",
          password_hash: "password123"
        });
    
        // Create payment methods for both users
        await PaymentMethod.create({
          user_id: authenticatedUser.user_id,
          name: "First User Payment",
          type: "Cash"
        });
        
        await PaymentMethod.create({
          user_id: secondUser.user_id,
          name: "Second User Payment",
          type: "Card",
          bank_name: "User 2 Bank"
        });
        
        // Get payment methods for first user
        const firstUserPayments = await PaymentMethod.findAll({
          where: { user_id: authenticatedUser.user_id }
        });
        
        // Get payment methods for second user
        const secondUserPayments = await PaymentMethod.findAll({
          where: { user_id: secondUser.user_id }
        });
        
        // Verify user isolation
        expect(firstUserPayments.length).toBe(1);
        expect(firstUserPayments[0].name).toBe("First User Payment");
        
        expect(secondUserPayments.length).toBe(1);
        expect(secondUserPayments[0].name).toBe("Second User Payment");
      });

        
      test("Should update a payment method", async () => {
        // Create a payment method
        const paymentMethod = await PaymentMethod.create({
          user_id: authenticatedUser.user_id,
          name: "Old Card",
          type: "Credit",
          bank_name: "Old Bank"
        });
        
        // Update the payment method
        paymentMethod.name = "New Card";
        paymentMethod.type = "Debit";
        paymentMethod.bank_name = "New Bank";
        await paymentMethod.save();
        
        // Fetch the updated payment method
        const updatedPayment = await PaymentMethod.findByPk(paymentMethod.payment_method_id);
        
        // Verify updates
        expect(updatedPayment.name).toBe("New Card");
        expect(updatedPayment.type).toBe("Debit");
        expect(updatedPayment.bank_name).toBe("New Bank");
      });


      
      test("Should delete a payment method", async () => {
        // Create a payment method
        const paymentMethod = await PaymentMethod.create({
          user_id: authenticatedUser.user_id,
          name: "To Be Deleted",
          type: "Card",
          bank_name: "Delete Bank"
        });
        
        // Verify it exists
        const paymentExists = await PaymentMethod.findByPk(paymentMethod.payment_method_id);
        expect(paymentExists).toBeDefined();
        
        // Delete the payment method
        await paymentMethod.destroy();
        
        // Verify it's deleted
        const paymentDeleted = await PaymentMethod.findByPk(paymentMethod.payment_method_id);
        expect(paymentDeleted).toBeNull();
      });
    
    })
    
    

    

// })
