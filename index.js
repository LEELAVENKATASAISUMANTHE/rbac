import app from './app.js';
import {dbtestrun,dbhealth} from './db/dbset.js';
import dotenv from 'dotenv';
import { simpleAuth } from './utils/jwt.js';
dotenv.config();

const PORT = process.env.PORT || 4001;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`url for the server is http://localhost:${PORT}`);
  await dbtestrun();
});

app.get('/',simpleAuth,async (req, res) => {
    res.send('Server is up and running for rbac');
});

