// lib/express.js
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import expressValidator from 'express-validator';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import passport from 'passport';
import session from 'express-session';

import api from '../api';
import auth from '../auth';
import { init as initDb } from './mongoose';

import passConf from './passport';

initDb();

const app = express();

//passport config
passConf(passport);

//express middle
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(),'../public')));
app.use(helmet());

//passport middleware and sessions
app.use(session({
    name: 'BANANAAAAAAAAAAAA', //cookie name here
    secret: 'correcthorsebatterystaple', //secret here
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        httpOnly: true,
        maxAge: 120 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());


//CORS
app.use(function (req, res, next) {
	//HSTS
	res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Access-Control-Allow-Origin', 'https://internify-simply.herokuapp.com/');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

//validator errorFormatter
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }

        return {
            param : formParam,
            msg   : msg
        };
    }
}));

//skills provider api
app.use('/api', api);

//authentication api
app.use('/auth', auth);

//any other request
app.use('*', function(req,res,next) {
    res.sendFile('public/index.html', { root: process.cwd() });
});

export default app;
