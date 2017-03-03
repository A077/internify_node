// auth/modules/employer/employer.functions.js
// redirect if authenticated
export function ifAuth(req,res,next) {
    if(req.isAuthenticated()) {
        res.json({param: "employer", msg: "You're already logged in"});
        return true;
    } else return false;
}

// redirect if not authenticated
export function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()) return true;
    else {
        res.json({param: "employer", msg: "You're not logged in"});
        return false;
    }
}

/*
	Validators and sanitizers
*/

export function validateInput(req, update) {
    //not empty
    req.checkBody('company', 'Please fill in company field.').notEmpty();
    req.checkBody('email', 'Please fill in Your email.').notEmpty();
    req.checkBody('name', 'Please fill in Your name').notEmpty();
    req.checkBody('phone', 'Please fill in Your phone number.').notEmpty();
    if(!update)
        req.checkBody('password', 'Please provide a password.').notEmpty();
    //valid email
    req.checkBody('email', 'Please provide a valid email address.').isEmail();
    //passwords match
    if(!update)
        req.checkBody('passwordConf', 'Passwords do not match.').equals(req.body.password);
    //params length
    req.checkBody('company', 'Company name should be between 3 and 32 characters').isLength({min:3,max:32});
    req.checkBody('name', 'Name should be between 3 and 32 characters').isLength({min:3,max:32});
    req.checkBody('email', 'Email address should be between 6 and 32 characters').isLength({min:6,max:32});
    if(!update)
        req.checkBody('password', 'Password should be between 6 and 32 characters').isLength({min:6,max:32});
}

export function validatePhone(phone) {
    const armMobile = new RegExp(/^(((00)|\+)374|(0))(41|43|44|55|77|91|93|94|95|99)[0-9]{6}$/),
          armHome = new RegExp(/^(((00)|\+)374|(0))(10|11|60)[0-9]{6}$/);
    if(armMobile.test(phone) || armHome.test(phone)) return false;
    return {param:"phone",msg:"Please provide a valid armenian phone number."};
}

export function sanitizeInput(req) {
    req.sanitize('email').escape().trim();
    req.sanitize('company').escape().trim();
    req.sanitize('name').escape().trim();
    req.sanitize('phone').escape().trim();
}