import express from 'express';
import cors from 'cors';

import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());



const PORT = process.env.PORT || 8001;
const startServer = async(): Promise<void> => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer().catch(console.error);




