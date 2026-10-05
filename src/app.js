import express from 'express';
import cors from 'cors';
import logger from '#config/logger..js';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
const app = express();
app.use(helmet());
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

export default app;
