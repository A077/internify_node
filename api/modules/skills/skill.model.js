import mongoose, { Schema } from 'mongoose';

const skills = new Schema({
  _id:	Schema.Types.ObjectId,
  name: String
});

mongoose.model('skill', skills);
