import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import StatusCodes from 'http-status-codes';
import express, { Request, Response, NextFunction } from 'express';
import cron from "node-cron";
import 'express-async-errors';
import BaseRouter from './routes/api';
import logger from 'jet-logger';
import { CustomError } from './shared/errors';
import envVars from './shared/env-vars';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from "cors";
import BookingService from "./services/BookingService";
import InventoryService from "./services/InventoryService";
// **** Init express **** //

const app = express();


// **** Set basic express settings **** //
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(envVars.cookieProps.secret));

app.use(cors());
// app.use(function (req, res, next) {
//   //Enabling CORS
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");

//     next();
//   });

// Show routes called in console during development
if (envVars.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Security
if (envVars.nodeEnv === 'production') {
  app.use(helmet());
}
//Connect mongodb
// mongoose
//   .connect(envVars.mongoDB.url)
//   .then(() => console.log('Connected!'));

// DB Connection here
mongoose.connect(envVars.mongoDB.url)
  .then(() => console.log("Database connected"))
  .catch(error => {
    if (error) console.log('Failed to connect DB')
    process.exit(1);
    // take necessary action

  })
// **** Add API routes **** //
// Add APIs
app.use(express.static('public'));

app.get('/privacy-policy', (req, res)=>{
  res.sendFile(path.join(process.cwd(), 'public', 'terms-and-conditions.html'));
});
app.use('/api/v1', BaseRouter);

// Error handling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error | CustomError, req: Request, res: Response, _: NextFunction) => {
  logger.err(err, true);
  const status = (err instanceof CustomError ? err.HttpStatus : StatusCodes.BAD_REQUEST);
  return res.status(status).json({
    error: err.message,
  });
});


// Set static directory (files).
const staticDir = path.join(__dirname, envVars.folder);
app.use(express.static(staticDir));

// Run cron job twice a day at 9:00 AM and 4:00 PM
cron.schedule("0 9,16 * * *", async () => {
  await BookingService.getAndSaveBrandNewReservations();
  await BookingService.getAndSavePreviousReservations();
});

//Run cron job every day at 09.30am CET to send whatsapp message
cron.schedule("30 9 * * *", async () => {
  await BookingService.sendMessagesToWhatsapp();
});


// Run cron job every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  await InventoryService.calculationOfUsage();
});

// Run corn job every thursday at 10:00 PM
cron.schedule('0 22 * * 4', async () => {
  await InventoryService.thursdayMorning();
});

// // Run cron job every Thursday at 11:59 PM
// cron.schedule('59 23 * * 4', async () => {
//   await InventoryService.thursdayEvening();
// });
// **** Export default **** //

export default app;
