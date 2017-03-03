// auth/modules/employer/employer.routes.js
import { Router } from 'express';
import passport from 'passport';
import fs from 'fs';

import { ifAuth, isLoggedIn } from './employer.functions';
import nodeMailer from 'nodemailer';
import { handleRegister, 
         handleUpdate, 
         getEmployer, 
         confirmEmployer,
         forgotPostHandler,
         forgotRecoverHandler,
         forgotSenderHandler,
         isForgotPassword,
         sendInvitation } from './employer.handlers';

export function init(app) {

  const router = new Router();

  router.get('/check', checkState);

  router.get('/confirm/:id', confirmEmployer);

  router.post('/register', regEmployer);

  router.post('/login', authEmployer);

  router.get('/employer', getEmployer);

  router.post('/update', handleUpdate);

  router.post('/forgot/send', forgotSenderHandler);

  router.get('/forgot/check', isForgotPassword);

  router.get('/forgot/post/:token', forgotPostHandler);

  router.post('/forgot/recover', forgotRecoverHandler);

  router.post('/invite', sendInvitation);

  router.get('/logout', function(req,res,next){
      if(!isLoggedIn(req,res,next)) return false;
      req.logout();      
      return res.redirect('https://internify-simply.herokuapp.com/');
  });

  app.use('/employers', router);
}

function checkState(req,res,next) {
  if(req.isAuthenticated())
    if(req.user.company){
        return res.end('isLoggedIn');
    }
  return res.end('notLoggedIn');
}

// passport check login credentials
function authEmployer(req,res,next) {
    if(ifAuth(req,res,next)) return false;
    passport.authenticate('employer-login',function (err,user,info) {
        if(err) return next(err);
        if(info)
          if(info.param == "notVerified")
            return res.status(401).json(info);
        if(!user) return res.status(403).json({param: "employer", msg:"Wrong email of password."});          
        req.login(user, function (err) {
            if(err) return next(err);
            return res.json({param: "employer", msg: 'loginSuccess'});
        });
    })(req,res,next);
}

function regEmployer(req, res, next) {
    if(ifAuth(req, res, next)) return false;
    passport.authenticate('employer-signup', function (err, user, info) {
        if (err) return next(err);
        if (!user) return res.status(400).json(info);
        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'you@gmail.com',
                pass: 'yourpassword'
            }
        });

        fs.readFile('./mailers/emailConfirm.html', 'utf8', (err,html)=>{

            html = html.replace('some_url_here', user._id);

            const mailOptions = {
                from: "\"Internify App\" <internify.simply@gmail.com>",
                to: user.email,
                subject: 'Internify Registration',
                text: `You successfully registered! 
                Please go to https://internify-simply.herokuapp.com/auth/employers/confirm/${user._id} to confirm.`,
                html
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) console.log(error);
                else console.log('Message %s sent: %s', info.messageId, info.response);
            });

            return res.status(201).json(info);

        });

        
    })(req, res, next);
}