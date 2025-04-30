import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize, connectDB } from './config/db.config.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import paymentMethodRoutes from './routes/paymentMethodRoutes.js';
import helmet from 'helmet';



import authenticate from './middleware/auth.js';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());




//Test route
app.get('/api/test', (req,res)=>{
    res.json({message: 'api is working'});
});


//Error handling MiddileWare
app.use((err,req,res,next)=>{
    console.log(err.stack);
    res.status(500).send({message: 'Something went wrong', error: err.message});
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', authenticate, categoryRoutes);
app.use('/api/expenses', authenticate, expenseRoutes);
app.use('/api/payment-methods', authenticate, paymentMethodRoutes);
app.use(authenticate);

app.use((err,req,res,next)=>{
    console.log(err.stack);
    res.status(500).send({message: 'Something went wrong', error: err.message});
});

const startServer = async () => {
    const isConnected = await connectDB();
    const PORT = process.env.PORT || 8001;
    const IP_ADDRESS = process.env.IP_ADDRESS
    if (isConnected) {
        try{
            await sequelize.sync({alter: true});
            console.log('Database synced successfully');

            app.listen(PORT,IP_ADDRESS, () =>{
            console.log(`Server is running on port ${PORT}`);
         });
        } catch (error) {
            console.error('Error syncing database:', error);
        }
    }
};




startServer();


export default app;



