// auth/modules/student/student.routes.js
// auth/students/register && auth/students/update
import { Router } from 'express';
import passport from 'passport';

import { handleRegister, handleUpdate, getStudent } from './student.handlers';
import { ifAuth, isLoggedIn } from './student.functions';

export function init(app) {

  const router = new Router();

  router.get('/check', checkState);

  router.get('/signup', function (req, res, next) {
      if(ifAuth(req,res,next)) return false;
      return res.redirect('https://internify-simply.herokuapp.com/auth/students/facebook');
  });

  router.get('/login', function(req,res,next) {
      if(ifAuth(req,res,next)) return false;
      return res.redirect('https://internify-simply.herokuapp.com/auth/students/facebook');
  });

  router.get('/facebook', passport.authenticate('facebook', { scope : 'email' }));

  router.get('/facebook/callback',
      passport.authenticate('facebook', {
          successRedirect : 'https://internify-simply.herokuapp.com/auth/students/callback',
          failureRedirect : '/'
  }));

  router.get('/callback', function (req,res,next) {
      if(req.isAuthenticated()) {
          if(req.user.signed) 
              return res.redirect('https://internify-simply.herokuapp.com/profile');
          else
              return res.redirect('https://internify-simply.herokuapp.com/signup');
      } else return res.end('What are you doing here ? :)');
  });

  router.get('/student', getStudent);

  router.post('/register', handleRegister);

  router.post('/update', handleUpdate);

  router.get('/logout', function (req, res, next) {
      if(!isLoggedIn(req,res,next)) return false;
      req.logout();
      return res.redirect('https://internify-simply.herokuapp.com/');
  });


  app.use('/students', router);

}

function checkState(req,res,next) {
  if(req.isAuthenticated())
    if(req.user.fbId) {
        if(!req.user.signed) {
            return res.end('signup');
        }
        return res.end('isLoggedIn');
    }
  return res.end('notLoggedIn');
}

// check for forgery