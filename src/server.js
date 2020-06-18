import express from 'express';
import { config } from './config';

const app = express();

app.get('/', (req, res) => res.send('API running'))

const PORT = config.PORT || 5000;

app.listen(PORT, () => console.log(`${config.PORT} Server running on port ${PORT}`));
