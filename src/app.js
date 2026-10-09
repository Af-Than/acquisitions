import express from 'express';
import cors from 'cors';
import logger from '#config/logger..js';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { securityMiddleware } from '#middleware/security.middleware.js';
const app = express();
app.use(helmet());
app.use(securityMiddleware); // Apply security middleware globally
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));//combined means both in dev and production 
//logging library is winston and morgan is used to log http requests and responses in a combined format. The logs are written to the console and also to the log files defined in the logger.js file.

app.use(cookieParser());
app.get('/', (req, res) => {
  logger.info('Hello from the acquisitions microservice');
  res.send('hello from the acquisitions microservice');
});

app.use('/api/auth', (await import('#routes/auth.routes.js')).default);
app.use('/api/users', (await import('#routes/users.routes.js')).default);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'acquisitions microservice is healthy', timestamp: new Date() });
});


app.use((req,res)=>{
  res.status(404).json({ status: 'error', message: 'Route not found', timestamp: new Date() });
})
app.get('/api', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'acquisitions microservice API is working', timestamp: new Date() });
});
export default app;
