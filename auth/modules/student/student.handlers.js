// auth/modules/student/student.handlers.js
import mongoose from 'mongoose';
import expressValidator from 'express-validator';

import { ifAuth, isLoggedIn } from './student.functions';
import { validateInput, validatePhone, sanitizeInput, sanitizeLanguage } from './student.functions';

const Student = mongoose.model('student');

export function handleRegister(req,res,next) {

    let msg = null;
    if(req.url=='/register') {
        if(ifAuth(req,res,next)) return false;
        if(req.user) 
            if(req.user.signed)
                res.status(400).json({param:"student", msg: "You're already signed up"})
        msg = 'Register';
    }

    if(req.url=='/update'){
        if(!isLoggedIn(req,res,next)) return false;
        if(req.user) 
            if(!req.user.signed)
                res.status(400).json({param:"student", msg: "You're not signed up yet"})
        msg = 'Update';
    }

    if(Object.keys(req.body).length==0)
        return res.status(400).json({
            param: "all",
            msg: "Please fill in all fields."
        });

    validateInput(req);

    const errors = req.validationErrors();
    if(errors)
        return res.status(400).json({errors:errors});
    const notValidPhone = validatePhone(req.body.phone);
    if(notValidPhone)
        return res.status(400).json(notValidPhone);

    sanitizeInput(req);

    const { name, email, phone, university, year, faculty, skills} = req.body,
          id = req.user._id,
          languages = sanitizeLanguage(req.body.languages);

    Student.findByIdAndUpdate(id,
        {$set:{
                name, email, phone, university,
                year, faculty, languages, skills, signed: true
        }})
        .exec(function(err, student){
            if (err) {
                console.log(err);
                return res.json({param: "student", msg: msg + " Error"});
            }
            res.status(msg=='Register' ? 201 : 200).json({param: "student", msg: msg + " Success"});
    });
}

export function getStudent(req,res,next) {

    if(!isLoggedIn(req,res,next)) return false;

    Student.findById(req.user._id)
        .then((user)=>{
            if(!user) {
                return res.status(404).json({param: "student", msg: "No such user"});
            }
            let student = {
                fbId: user.fbId,
                name: user.name,
                email: user.email,
                phone: user.phone,
                university: user.university,
                faculty: user.faculty,
                year: user.year,
                languages: user.languages,
                skills: user.skills,
                signed: user.signed
            };
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
            res.setHeader("Cache-Control", "post-check=0, pre-check=0");
            res.setHeader("Pragma","no-cache");
            return res.json({student});
        })
        .catch((err)=>{
            console.log(err);
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
            res.setHeader("Cache-Control", "post-check=0, pre-check=0");
            res.setHeader("Pragma","no-cache");
            res.status(500).json({param: "student", msg: "Something went wrong."});
        });

}

export const handleUpdate = handleRegister;