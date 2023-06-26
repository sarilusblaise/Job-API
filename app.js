//allow to store secret variable in .env file
require('dotenv').config();
// for a custom error handle in async function, no need to write try an catch block, just trowing the error
require('express-async-errors');

// extra security packages
//Helmet helps secure Express apps by setting HTTP response headers.
const helmet = require('helmet');
//Cross-origin resource sharing (CORS) is a mechanism that allows restricted resources on
//a web page to be accessed from another domain outside the domain from which the first resource was served.
const cors = require('cors');
//xss is a module used to filter input from users to prevent XSS attacks.
const xss = require('xss-clean');
//The ratelimiter npm package is a Node.js module that provides rate limiting functionality
// for web applications. It helps developers control and limit the number of requests
//that can be made to an API or a specific route within a certain time period
const rateLimiter = require('express-rate-limit');

const express = require('express');
const app = express();

//connect mongoDB
const connectDB = require('./db/connect');

//authentication
const authenticateUser = require('./middleware/authentication');
//routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
app.set('trust proxy', 1);
app.use(
	rateLimiter({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // limit each IP to 100 requests per windowMs
	})
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(express.json());
// extra packages

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
	try {
		await connectDB(process.env.MONGO_URI);
		app.listen(port, () =>
			console.log(`Server is listening on port ${port}...`)
		);
	} catch (error) {
		console.log(error);
	}
};

start();
