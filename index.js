import app from './app.js';
import {dbtestrun,dbhealth} from './db/dbset.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 4001;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`url for the server is http://localhost:${PORT}`);
  await dbtestrun();
});

app.get('/', async (req, res) => {
    res.send('Server is up and running for rbac');
});

