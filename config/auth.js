module.exports= {
	facebookConfig: {
		clientID: 'CLIENT_ID_HERE',
    	clientSecret: 'CLIENT_SECRET_HERE',
    	callbackURL: 'https://internify-simply.herokuapp.com/auth/students/facebook/callback',
    	profileURL: 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',    
    	session: true,
    	passReqToCallback: true
	},
	localConfig: {
		usernameField: 'email',
    	passwordField: 'password',
    	session: true,
   		passReqToCallback: true
	}
};