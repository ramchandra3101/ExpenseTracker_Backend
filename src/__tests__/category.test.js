import {sequelize} from "../config/db.config.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

let authenticatedUser;
let authtoken;

describe("Testing Category model",() => {
    beforeAll(async () => {
        await sequelize.sync({force:true})

        // Create a test user
        const userData = {
            username: 'categorytest2',
            first_name: 'Category',
            last_name: 'Test',
            email:'category2@test.com',
            password_hash: 'password123'
        }

        authenticatedUser = await User.create(userData);
        authtoken = jwt.sign({id: authenticatedUser.user_id}, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    test("Should create a new category", async () => {

        await sequelize.query("DELETE FROM expensestrack.categories")
        const categoryData = {
            user_id: authenticatedUser.user_id,
            name: "Test Category",
            icon: "test-icon",
            color: "#4CAF50",
            is_default: false,
            is_income: false
        };

        const category = await Category.create(categoryData);
        expect(category).toBeDefined();
        expect(category.category_id).toBeDefined();
        expect(category.name).toBe(categoryData.name);
        expect(category.icon).toBe(categoryData.icon);
        expect(category.color).toBe(categoryData.color);
        expect(category.is_default).toBe(false);
        expect(category.is_income).toBe(false);
    })

    test("Should create an income category", async () => {
        const categoryData = {
          user_id: authenticatedUser.user_id,
          name: "Salary",
          icon: "cash",
          color: "#2196F3",
          is_income: true
        };
        
        const category = await Category.create(categoryData);
        
        expect(category).toBeDefined();
        expect(category.category_id).toBeDefined();
        expect(category.name).toBe(categoryData.name);
        expect(category.is_income).toBe(true);
      });
      
//       test("Should create a default category", async () => {
//         const categoryData = {
//           user_id: authenticatedUser.user_id,
//           name: "Miscellaneous",
//           is_default: true
//         };
        
//         const category = await Category.create(categoryData);
        
//         expect(category).toBeDefined();
//         expect(category.is_default).toBe(true);
//       });
      
    test("Should verify categories are stored in the database", async () => {
        // Create several categories
        const categories = [
          {
            user_id: authenticatedUser.user_id,
            name: "Food",
            icon: "restaurant",
            color: "#F44336"
          },
          {
            user_id: authenticatedUser.user_id,
            name: "Transport",
            icon: "car",
            color: "#9C27B0"
          },
          {
            user_id: authenticatedUser.user_id,
            name: "Entertainment",
            icon: "movie",
            color: "#FF9800"
          }
        ];
        
        // Create all categories
        await Promise.all(categories.map(cat => Category.create(cat)));
        
        // Query the database directly
        const results =
        await sequelize.query(
          "SELECT * FROM expensestrack.categories WHERE user_id = :user_id",
          { 
            replacements: { user_id: authenticatedUser.user_id }
          }
        );
        console.log("Results: ", results[0]);
       
        // Verify results
        expect(results).toBeDefined();
        expect(results[0].length).toBe(5);
        
        // Check if all categories were created
        const categoryNames = results[0].map(cat => cat.name);
        console.log("Category Names: ", categoryNames);
        expect(categoryNames).toContain("Food");
        expect(categoryNames).toContain("Transport");
        expect(categoryNames).toContain("Entertainment");
      });
      
      test("Should get categories for a specific user only", async () => {
        // Create a second test user
        const secondUser = await User.create({
          username: "seconduser",
          first_name: "Second",
          last_name: "User",
          email: "second@test.com",
          password_hash: "password123"
        });
        
        // Create categories for both users
        await Category.create({
          user_id: authenticatedUser.user_id,
          name: "First User Category"
        });
        
        await Category.create({
          user_id: secondUser.user_id,
          name: "Second User Category"
        });
        
        // Get categories for first user
        const firstUserCategories = await Category.findAll({
          where: { user_id: authenticatedUser.user_id }
        });
        
        // Get categories for second user
        const secondUserCategories = await Category.findAll({
          where: { user_id: secondUser.user_id }
        });
        console.log("First User Categories: ", firstUserCategories);
        console.log("Second User Categories: ", secondUserCategories);
      // Verify user isolation
        expect(firstUserCategories.length).toBe(6);
        expect(firstUserCategories[5].name).toBe("First User Category");
        
        expect(secondUserCategories.length).toBe(1);
        expect(secondUserCategories[0].name).toBe("Second User Category");
      });
      
//       test("Should update a category", async () => {
//         // Create a category
//         const category = await Category.create({
//           user_id: authenticatedUser.user_id,
//           name: "Old Name",
//           icon: "old-icon",
//           color: "#000000"
//         });
        
//         // Update the category
//         category.name = "New Name";
//         category.icon = "new-icon";
//         category.color = "#FFFFFF";
//         await category.save();
        
//         // Fetch the updated category
//         const updatedCategory = await Category.findByPk(category.category_id);
        
//         // Verify updates
//         expect(updatedCategory.name).toBe("New Name");
//         expect(updatedCategory.icon).toBe("new-icon");
//         expect(updatedCategory.color).toBe("#FFFFFF");
//       });
      
      test("Should delete a category", async () => {
        // Create a category
        const category = await Category.create({
          user_id: authenticatedUser.user_id,
          name: "To Be Deleted",
          icon: "delete",
          color: "#FF0000"
        });
        
        // Verify it exists
        const categoryExists = await Category.findByPk(category.category_id);
        expect(categoryExists).toBeDefined();
        
        // Delete the category
        await category.destroy();
        
        // Verify it's deleted
        const categoryDeleted = await Category.findByPk(category.category_id);
        expect(categoryDeleted).toBeNull();
      });
   
})
