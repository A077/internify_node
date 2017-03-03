// auth/modules/employer/employer.handlers.js
import mongoose from 'mongoose';
import expressValidator from 'express-validator';
import passport from 'passport';
import fs from 'fs';
import crypto from 'crypto';
import nodeMailer from 'nodemailer';
import bcrypt from 'bcryptjs';

import { ifAuth, isLoggedIn } from './employer.functions';
import { validateInput, validatePhone, sanitizeInput } from './employer.functions';

const Employer = mongoose.model('employer');
const Student  = mongoose.model('student');

export function handleRegister(req, email, password, done) {

    if(Object.keys(req.body).length==0)
        done(null, false, {
            param: "all",
            msg: "Please fill in the fields."
        });

    validateInput(req);

    const errors = req.validationErrors();
    if(errors)
        return done(null, false, {errors:errors});
    const notValidPhone = validatePhone(req.body.phone);
    if(notValidPhone)
        return done(null, false, notValidPhone);

    sanitizeInput(req);

    const { company, name, phone, passwordConf } = req.body;
    const mail = req.body.email.toLowerCase();

    Employer.findOne({email: mail})
        .then((user)=>{
            if(user) return done(null, false,{ param:"email", msg:"Such email is already used." });
            let newEmployer = new Employer({
               company,
               email: mail,
               name,
               phone,
               password
            });
            Employer.createEmployer(newEmployer, function(err, user){
                if(err){
                   console.log(err);
                   done(null, false, {param: "employer", msg:"Something went wrong when registering."});
                }
                done(null, user, {param: "employer", msg:"Please confirm Your email to finish registration."});
            });
        })
        .catch((err)=>{
            console.log(err);
            done(null, false, {param: "employer", msg:"Something went wrong when registering."});
        });

}

export function handleUpdate(req,res,next) {

    if(!isLoggedIn(req,res,next)) return false;

    if(Object.keys(req.body).length==0)
        return res.status(400).json({
            param: "all",
            msg: "Please fill in the fields."
        });

    validateInput(req, true);

    const errors = req.validationErrors();
    if(errors)
        return res.status(400).json({errors:errors});
    const notValidPhone = validatePhone(req.body.phone);
    if(notValidPhone)
        return res.status(400).json(notValidPhone);

    sanitizeInput(req);

    const { company, name, phone } = req.body;
    const email = req.body.email.toLowerCase();

    Employer.findByIdAndUpdate(req.user._id,
        {$set:{
            name, email, phone, company
        }})
        .exec(function(err, doc){
            if (err) {
                console.log(err);
                return res.json({param: "employer",msg: "Something went wrong when updating."});
            }
            res.json({param: "employer",msg: "Profile successfully updated."});
        })

}

export function getEmployer(req,res,next){

    if(!isLoggedIn(req,res,next)) false;

    Employer.findById(req.user._id)
       .then((user)=>{
           if(!user) {
               return res.status(404).json({param: "employer", msg: "No such user."});
           }
           let employer = {
               name: user.name,
               email: user.email,
               phone: user.phone,
               company: user.company
           };
           return res.status(200).json({employer});
       })
       .catch((err)=>{
           console.log(err);
           res.status(500).json({param: "employer", msg: "Something went wrong when getting info."});
       });
  
}

export function confirmEmployer(req, res, next) {
    const id = req.params.id;

    Employer.findById(id)
        .then((user) => {
            if (!user) {
                return res.status(400).json({param: "employer", msg: "Broken confirmation URL."});
            }

            if (user.verified == false) {
                user.verified = true;
                user.save()
                    .then((user) => {
                        req.session.passport = {
                            user : {
                                _id: user._id,
                                company: user.company
                            }
                        };
                        return res.redirect("https://internify-simply.herokuapp.com/profile");
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).end("verifWentWrong");
                    });

            } else return res.status(400).end("alreadyVerified");
        })
        .catch((err)=>{
            console.log(err);
            res.status(400).end("wentWrong");
        });

}

export function forgotSenderHandler(req, res, next) {
    
    if (Object.keys(req.body).length == 0)
        return res.status(400).json({param: "employer", msg:"Please fill in your email"});

    req.checkBody('email', 'Please provide a valid email address.').isEmail();

    const errors = req.validationErrors();
    if(errors)
        return res.status(400).json({errors});

    const { email } = req.body;

    Employer.findOne({email}).then((employer) => {

        if(!employer)
            return res.status(404)
                      .json({param: "employer", msg: "No user found with such email."});

        if(employer.forgotToken)
            if(employer.forgotToken.length > 0)
                return res.status(400)
                          .json({param: "employer", msg: "You've already received an email for your new password."});

        const randToken = crypto.randomBytes(20).toString('hex');
        employer.forgotToken = randToken;
        employer.save()
          .then((employer) => {
              
              const transporter = nodeMailer.createTransport({
                  service: "gmail",
                  auth: {
                      user: "you@gmail.com",
                      pass: "yourpassword"
                  }
              });

              fs.readFile('./mailers/emailForgot.html', 'utf8', (err,html)=>{

                  if (err)
                      return res.json({param: "employer", msg: "Something went wrong when sending email message..."});


                  html = html.replace('employer_token', employer.forgotToken);

                  const mailOptions = {
                      from: "\"Internify App\" <internify.simply@gmail.com>",
                      to: employer.email,
                      subject: 'Internify Reset Password',
                      text: `Please go to http://localhost/auth/employers/forgot/post/${employer.forgotToken} to reset your password.`,
                      html
                  };

                  transporter.sendMail(mailOptions, function (error, info) {
                      if (error) console.log(error);
                      else console.log('Message %s sent: %s', info.messageId, info.response);
                  });

                  return res.json({param: "employer", msg: "We sent a message to Your email for further steps. Please check Your inbox."});

              });

          })
        })
    .catch((err)=>{
      console.log(err);
      return res.status(500)
            .json({param: "all", msg: "Something went wrong when sending email message..."});
    });
}

export function forgotPostHandler(req, res, next) {
    const token = req.params.token;

    Employer.findOne({forgotToken: token}).then((employer) => {
        if (!employer)
            return res.status(404).json({param: "employer", msg: "No user found with such token"});

        req.session.forgotToken = token;
        return res.redirect('https://internify-simply.herokuapp.com/recover');
    })
}

export function forgotRecoverHandler(req, res, next) {
    const token = req.session.forgotToken;
    if(Object.keys(req.body).length == 0)
        return res.json({param: "employer", msg: "Empty body"});

    req.checkBody('passwordConf', 'Passwords do not match.').equals(req.body.newPassword);
    const errors = req.validationErrors();
    if(errors)
        return res.status(400).json({errors:errors});

    const { newPassword } = req.body;
    Employer.findOne({forgotToken: token}).then((employer) => {

        if (!employer)
            return res.status(404).json({param: "employer", msg: "No user found with such token"});

        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(newPassword, salt, function (err,hash) {
            employer.password = hash;
            employer.forgotToken = undefined;

            employer.save().then((employer) => {
              req.session.destroy();
              return res.json({param:"employer",msg:"Your password has successfully been reset."})
            });            
          });
        });    

    });
}

export function isForgotPassword(req, res, next) {
    if (req.session.forgotToken)
        res.end("true");
    else res.end("false");
}

export function sendInvitation(req, res, next) {

    if (Object.keys(req.body).length == 0)
        return res.json({param: "employer", msg:"Please write your email."});

    const keys = Object.keys(req.body);
    const message = req.body.message;
    const query = {};

    keys.forEach((key)=>{
      if(key!="message") {
        let param;
        try { param = JSON.parse(req.body[key]) } 
        catch(err){ param = req.body[key] }
        if(param) {
            if(key=='languages') {
                let check = false;
                param.forEach((i)=>{
                    if(i==1) check=true;
                });
                if(!check) return 0;
            } else if(key=='skills') {
                if(param.length==0) return 0;
                let skillfx = param.map((item)=>{
                    return {
                        name: item.name,
                        _id: item._id
                    }
                });
                query[key] = {$in: skillfx};
                return 0;
            }
            query[key] = param;            
        }
      }
    });
    query.signed = true;

    const employerId = req.user._id;
    Employer.findById(employerId).then((employer)=>{

        Student.find(query).then((students)=>{

          let send_to = "";
          students.forEach((student)=>{
            send_to += `${student.email};`;
          });

          const transporter = nodeMailer.createTransport({
              service: "gmail",
              auth: {
                  user: "you@gmail.com",
                  pass: "yourpassword"
              }
          });


          fs.readFile('./mailers/emailInvitation.html', 'utf8', (err,html)=>{
              if(err) {
                console.log(err);
                return res.status(500).end("something went wrong");
              }
              const htmlMessage = message.replace(/(?:\r\n\r\n|\r\r|\n\n)/g, `</p><br/><p style="margin:0 0 0 10px;margin:0 0 0 10px;margin:0;margin-bottom:10px;margin-bottom:10px;text-indent:30px;color:#0a0a0a;font-family:Helvetica, Arial, sans-serif;font-weight:normal;padding:0;margin:0;font-size:16px;line-height:1.3;text-align:left;">`);
              html = html.replace('__company_name', employer.company);
              html = html.replace('__employer_name', employer.name);
              html = html.replace('__employer_email', employer.email);
              html = html.replace('__employer_phone', employer.phone);
              html = html.replace('__employer_message', htmlMessage);
              const mailOptions = {
                  from: "\"Internify App\" <internify.simply@gmail.com>",
                  to: send_to,
                  subject: 'Internship Invitation - Internify',
                  text: `You are invited to an internship!`,
                  html
              };
              transporter.sendMail(mailOptions, function (error, info) {
                  if(error) {
                    console.log(error);
                    return res.status(500).end("something went wrong");
                  }                      
                  else console.log('Message %s sent: %s', info.messageId, info.response);
              });
              return res.json({param: "employer", msg: "The message has been sent to students."});
            });


        })

    })
    .catch((err)=>{
      console.log(err);
      return res.status(500)
                .json({param: "all", msg: "Something went wrong when filtering students."});
    });
}