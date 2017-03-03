// api/modules/students/student.routes.js
import { Router } from 'express';
import * as studentsHandler from './student.handlers';

export function init(api) {
  const router = new Router();

  router.get('/search', studentsHandler.search);

  api.use('/students', router);
}
