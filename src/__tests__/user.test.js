import {sequelize} from "../config/db.config";
import User from "../models/User";




describe("User Creation", () => {



    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

   

    test("Should create a new user", async () => {
        const userData = {
            username : "testuser",
            first_name: "Test",
            last_name: "User",
            email: "test@example.com",
            password_hash: "password123",
        }
        const user = await User.create(userData);
        expect(user).toBeDefined();
        expect(user.user_id).toBeDefined();
        expect(user.username).toBe(userData.username);
        expect(user.email).toBe(userData.email);
    });

    test("Does user created in database", async () => {

        await sequelize.query("DELETE FROM expensestrack.users")

        const userData = {
            username : "testuser2unique",
            first_name: "Test",
            last_name: "User",
            email: "test3101@example.com",
            password_hash: "password123",
        }


        
        
        // Create the user
         const user = await User.create(userData);
         expect(user).toBeDefined();
        
        // // Query the database directly to verify the user was created
         const [results, metadata] = await sequelize.query(
             "SELECT * FROM expensestrack.users WHERE username = 'testuser2unique'", 
         );
         
        // // Check if results array exists and contains records
        expect(results).toBeDefined();
      
        expect(results.length).toBeGreaterThan(0);
        
        // Verify user data matches what we inserted
        const dbUser = results[0];
        expect(dbUser.username).toBe(userData.username);
        expect(dbUser.email).toBe(userData.email);
        expect(dbUser.first_name).toBe(userData.first_name);
        expect(dbUser.last_name).toBe(userData.last_name);
    });
    test("Should validate the password correctly", async () => {
        const userData = {
            username : "testuser2",
            first_name: "Test",
            last_name: "User",
            email:"test2@example.com",
            password_hash: "password123",
        };
        const user = await User.create(userData);
        expect(user).toBeDefined();
        const isValidPassword = await user.validatePassword("password123");
        expect(isValidPassword).toBe(true);
        const isInvalidPassword = await user.validatePassword("wrongpassword");
        expect(isInvalidPassword).toBe(false);;
    });

    test("Should Update Password and hash it", async () => {  
        const user = await User.create({
            username : "testuser3",
            first_name: "Test",
            last_name: "User",
            email:"test3@example.com",
            password_hash: "password123",
        })
        const oldPasswordHash = user.password_hash;
        user.password_hash = "newpassword123";
        await user.save();

        expect(user.password_hash).not.toBe(oldPasswordHash);
        const isValidPassword = await user.validatePassword("newpassword123");
        expect(isValidPassword).toBe(true);
    });

     test("Should enforce unique email and username", async () => {
        const userData = {
            username: "uniqueuser",
            first_name: "Unique",
            last_name: "User",
            email: "unique@example.com",
            password_hash: "uniquePassword",
        };
        await User.create(userData);
        await expect(
            User.create({
                username : "anotheruser",
                first_name: "Unique",
                last_name: "User",
                email: "unique@example.com",
                password_hash: "anotherPassword"
            })
        ).rejects.toThrow();

        await expect(
            User.create({
                username: "uniqueuser",
                first_name: "Unique",
                last_name: "User",
                email:"another@example.com",
                password_hash: "Password123"
            })
        ).rejects.toThrow();
     });
});

