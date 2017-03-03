// api/modules/index.js
import glob from 'glob';
import path from 'path';

export function init(app) {
  const routes = glob.sync(path.join(process.cwd(), '/**/*.routes.js'));
  const models = glob.sync(path.join(process.cwd(), '/**/*.model.js'));


  models.forEach(model => require(model));  // eslint-disable-line

  routes.forEach(route => require(route).init(app)); // eslint-disable-line

  return app;
}

