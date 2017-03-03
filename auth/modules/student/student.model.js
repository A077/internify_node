// auth/modules/student/student.model.js
import mongoose, { Schema } from 'mongoose';

const studentSchema = new Schema({
  fbId: Schema.Types.String,
  name: Schema.Types.String,
  email: Schema.Types.String,
  token: Schema.Types.String,
  university: {
      type: Schema.Types.String,
      default: ''
  },
  faculty: {
      type: Schema.Types.String,
      default: ''
  },
  year: {
      type: Schema.Types.Number,
      default: 1
  },
  phone: {
      type: Schema.Types.String,
      default: ''
  },
  languages: [
      Schema.Types.Number
  ],
  skills: [
      Schema.Types.Object
  ],
  signed: {
      type: Schema.Types.Boolean,
      default: false
  }
});

const Student = mongoose.model('student', studentSchema);
export default Student;
