import express from 'express';
import cors  from 'cors';
import cookieParser from 'cookie-parser';
import roleRouter from './routers/role.route.js';
import permissionRouter from './routers/permission.route.js';
import rolePermissionRouter from './routers/rolePermission.route.js';
import userRouter from './routers/user.route.js';

const app = express();
app.use(cors());
app.use(express.json({limit: "26kb"}));//middleware for parseing json data
app.use(express.urlencoded({ //middleware to take care of url encodeing
    extended:true,//takes care of boject in object
    limit:"16kb"//limit setting
}))
app.use(express.static("public"));
app.use(cookieParser());
const allowedOrigins = [
    'http://localhost:4001',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://api-gateway-ohmz.onrender.com',
    'https://rbac-jb0z.onrender.com',
    'https://frontend-for-placement.vercel.app'
  ];
app.set("trust proxy", 1);
app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
     credentials: true, // Very important for sending cookies
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Or specific methods you use
    allowedHeaders: ['Content-Type', 'Authorization'] // Or specific headers you use

  }));

// Routes

app.use('/roles', roleRouter);
app.use('/permissions', permissionRouter);
app.use('/role-permissions', rolePermissionRouter);
app.use('/users', userRouter);

export default app;