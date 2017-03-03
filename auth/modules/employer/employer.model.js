// auth/modules/employer/employer.model.js
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const employerSchema = new Schema({
  company: Schema.Types.String,
  name: Schema.Types.String,
  email: Schema.Types.String,
  password: Schema.Types.String,
  phone: {
      type: Schema.Types.String,
      default: ''
  },
  verified: {
      type: Schema.Types.Boolean,
      default: false
  },
  forgotToken: Schema.Types.String
});

employerSchema.statics.createEmployer = function (newUser, cb) {
    bcrypt.genSalt(10, function (err, salt) {
       bcrypt.hash(newUser.password, salt, function (err,hash) {
          newUser.password = hash;
          newUser.save(cb);
       });
    });
};

employerSchema.statics.getEmployerByEmail = function (Employer, email, cb) {
    const query = {email:email.toLowerCase()};
    Employer.findOne(query, cb);
};

employerSchema.statics.comparePassword = function (password, hash, cb) {
    bcrypt.compare(password, hash, function (err, isMatch) {
        if(err) throw err;
        cb(null, isMatch);
    });
};

const Employer = mongoose.model('employer', employerSchema);
export default Employer;
