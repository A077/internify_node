# Node API Boilerplate

Forked from [Simply Technologies Repo](https://github.com/SimplyTechnologies/node-api-boilerplate)  
Team Members [Aramazd](https://github.com/a077), [Davit](https://github.com/davwwwx), [Narek](https://github.com/tnarek99)

## Installation

```bash
$ npm install
```
## Execution

```bash
$ npm start
```

## File structure

```
|-- api                             Api Express app export and init call
|   |-- index.js
|   `-- modules
|       |-- index.js                Api modules routes and models init
|       |-- skills
|       |   |-- skill.handlers.js
|       |   |-- skill.model.js
|       |   `-- skill.routes.js
|       `-- students
|           |-- student.handlers.js
|           `-- student.routes.js
|
|-- auth
|   |-- index.js                     Auth Express app export and init call
|   `-- modules
|       |-- index.js                 Auth modules routes and models init
|       |-- employer
|       |   |-- employer.functions.js
|       |   |-- employer.handlers.js
|       |   |-- employer.model.js
|       |   `-- employer.routes.js   
|       `-- student
|       	|-- student.functions.js
|           |-- student.handlers.js  
|           |-- student.model.js     
|           `-- student.routes.js    
|
|-- app.js                           Application entry point
|
|-- bin
|   `-- app                          Application main execution file
|
|-- bower.json
|
|-- config 
|   |-- auth.js                      PassportJS configuration
|   `-- index.js                     Database connection and port configuration
| 
|-- lib                              
|   |-- express.js                   Express application initalization
|   |-- passport.js                  PassportJS configuration and initialization
|   `-- mongoose.js                  Mongoose initalization
|
|-- package.json
|
`-- public                           Static files
    |-- index.html
    |-- favicon.ico
    |-- css
    |   |-- bootstrap.min.css
    |   |-- styles.css
    |   `-- toastr.min.css
    |-- img
    |   `-- background.jpeg
    |-- js
    |   |-- bootstrap.min.js
    |   |-- html5shiv.min.js
	|   |-- jquery-3.1.1.min.js
	|   `-- polyfill.min.js
	`-- src
        |-- bundle.js           React/Redux app
        `-- vendor.bundle.js

```