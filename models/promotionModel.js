import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const promotionSchema = new mongoose.Schema({
  name: { type: String },
  value: { type: String }
});

const Promotion = mongoose.model('promotion', promotionSchema);

export default Promotion;