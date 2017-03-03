// lib/passport.js
import mongoose from 'mongoose';
import { facebookConfig, localConfig } from '../config/auth';
import { handleRegister } from '../auth/modules/employer/employer.handlers';

const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const Employer = mongoose.model('employer');
const Student = mongoose.model('student');

export default function(passport) {

	passport.serializeUser(function (user,done) {
       let userSession;
       if(user.fbId) {
           userSession = {
               _id: user._id,
               fbId: user.fbId,
               signed: user.signed
           }
       } else if(user.company) {
            userSession = {
                _id: user._id,
                company: user.company
            }
       }
       done(null, userSession);
    });

    passport.deserializeUser(function (user,done) {
    	if(user.fbId) {
    		Student.findById(user._id, function (err,doc) {
                let student = {_id: doc._id, fbId: doc.fbId,signed: doc.signed};
            	done(err,student);
        	});
    	} else if(user.company) {
    		Employer.findById(user._id, function (err,doc) {
                let employer = {_id: doc._id, company: doc.company};
            	done(err,employer);
        	});	
    	}
    });

    passport.use(new FacebookStrategy(facebookConfig, 
    	function(req, token, refreshToken, profile, done){
    		process.nextTick(()=>{
    			if(!req.user) {
	                Student.findOne({'fbId':profile.id})
                    .then((user)=>{
                        if(user) {	                            
                            user.token = token;
                            user.save((err)=>{
                               if(err) return done(err);
                               done(null, user);
                            });
                        } else {
                            const student = new Student();
                            student.fbId = profile.id;
                            student.token = token;
                            student.name = profile.name.givenName+' '+profile.name.familyName;
                            student.email = (profile._json.email || '').toLowerCase();
                            student.save((err)=>{
                                if(err) return done(err);
                                done(null, student);
                            });
                        }
                    })
                    .catch((err)=>done(err));                    
		        } else done(null,req.user);
    		});
    	}
    ));

    passport.use('employer-login',new LocalStrategy(localConfig,
        function(req, email, password, done) {
            Employer.getEmployerByEmail(Employer, email, function(err, user){
                if(err) return done(err);
                if(!user) return done(null, false);
                Employer.comparePassword(password, user.password, function(err, isMatch) {
                    if(err) return done(err);
                    if(isMatch) {
                    if(user.verified == false) 
                        return done(null, false, {
                            param: "notVerified", 
                            msg: "Please confirm Your email address to continue."
                        });                
                    done(null, user);
                    }
                    else done(null, false);
                });
            });
    }));

    passport.use('employer-signup', new LocalStrategy(localConfig,
        function (req, email, password, done) {
            handleRegister(req, email, password, done);
    }));
    
    passport.use('employer-confirm', new LocalStrategy(localConfig,
        function (req, email, password, done) {
            const id = req.params.id;
            Employer.findById(id)
                .then((user) => {
                    if (!user) {
                        return done(null, false, {param: "employer", msg: "noIdFound"});
                    }
                    if (user.verified == false) {
                        user.verified = true;
                        user.save();
                        return done(null, user, {param: "employer", msg:"verified"});
                    }
                    done(null, false, {param: "employer", msg: 'alreadyVerified'});
                })
                .catch((err)=>{
                    console.log(err);
                    done(err, false, {param: "employer", msg: 'wentWrong'});
                });
        }    
    ));

}