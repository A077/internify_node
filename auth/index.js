// auth/index.js
import express from 'express';

import { init } from './modules';

const auth = express();

init(auth);

export default auth;
