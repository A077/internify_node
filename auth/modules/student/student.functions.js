// auth/modules/student.functions.js

// redirect if not authenticated
export function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()) return true;
    else {
        res.redirect('https://internify-simply.herokuapp.com/login');
        return false;
    }
}

// redirect if authenticated
export function ifAuth(req,res,next) {
    if(req.isAuthenticated())  {
        if(req.user.signed) {
            res.redirect("https://internify-simply.herokuapp.com/profile");
            return true;
        }
        else return false;
    } else return false;
}

/*
    Validators and sanitizers
*/

export function validateInput(req) {

    const universities = ["AUA","YSU"],
          faculties = ["CS","Business","EC"];

    req.checkBody('name', 'Please fill in Your name.').notEmpty();
    req.checkBody('email', 'Please fill in Your email.').notEmpty();
    req.checkBody('phone', 'Please fill in Your phone.').notEmpty();
    req.checkBody('university', 'Please choose an university.').notEmpty();
    req.checkBody('faculty', 'Please choose a faculty.').notEmpty();
    req.checkBody('year', 'Please choose a year.').notEmpty();
    req.checkBody('languages', 'Please choose at least one language.').notEmpty();
    req.checkBody('skills', 'Please choose at least one skill.').notEmpty();

    req.checkBody('email', 'Please provide a valid email address.').isEmail();

    req.checkBody('university', 'No such university.').isIn(universities);
    req.checkBody('faculty', 'No such faculty.').isIn(faculties);

    req.checkBody('name', 'Name should be between 3 and 32 characters.').isLength({min:3,max:32});
    req.checkBody('email', 'Email address should be between 6 and 32 characters.').isLength({min:6,max:32});

}

export function validatePhone(phone) {
    const armMobile = new RegExp(/^(((00)|\+)374|(0))(41|43|44|55|77|91|93|94|95|99)[0-9]{6}$/),
          armHome = new RegExp(/^(((00)|\+)374|(0))(10|11|60)[0-9]{6}$/);
    if(armMobile.test(phone) || armHome.test(phone)) return false;
    return {param:"phone",msg:"Please provide a valid armenian phone number."};
}

export function sanitizeInput(req) {
    req.sanitize('name').escape().trim();
    req.sanitize('email').escape().trim();
    req.sanitize('phone').escape().trim();
}

export function sanitizeLanguage(languages) {
    let languagesSan = languages.map( (item) => (item===1||item===0) ? item : 0 );
    return languagesSan;
}