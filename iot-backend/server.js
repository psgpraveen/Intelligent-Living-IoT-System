import express from 'express';
import dotenv from 'dotenv'; dotenv.config();
import connectDB from './config/database.js';
import helmet from 'helmet'; import cors from 'cors';
import rateLimit from 'express-rate-limit'; import morgan from 'morgan';

import authRoutes      from './routes/auth.js';
import deviceRoutes    from './routes/devices.js';
import applianceRoutes from './routes/appliances.js';
import dataRoutes      from './routes/data.js';
import streamRoutes    from './routes/stream.js';
import errorHandler    from './middleware/errorHandler.js';

connectDB();
const app = express(), PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(rateLimit({ windowMs:15*60*1000, max:100 }));
app.use(cors({ origin:['http://localhost:3000','https://intelligent-living-io-t-system.vercel.app/api'
], credentials:true }));
app.use(express.json());
if(process.env.NODE_ENV==='development') app.use(morgan('dev'));

app.use('/api/auth',      authRoutes);
app.use('/api/devices',   deviceRoutes);
app.use('/api/appliances',applianceRoutes);
app.use('/api/data',      dataRoutes);
app.use('/api/stream',    streamRoutes);

app.get('/api/health', (req,res)=>res.json({ status:'OK' }));
app.use((req,res)=>res.status(404).json({ message:'Not found' }));
app.use(errorHandler);

app.listen(PORT, ()=>console.log(`Backend running on ${PORT}`));
