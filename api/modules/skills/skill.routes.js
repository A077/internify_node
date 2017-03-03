// api/modules/skills/skill.routes.js
import { Router } from 'express';
import * as skillHandlers from './skill.handlers';

export function init(api) {
  const router = new Router();

  router.get('/:search', skillHandlers.handleGet);

  api.use('/skills', router);
}
