import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const shoppingCartsSchema = new mongoose.Schema({
  user_id: { type: String },
  course_id: { type: String }
});

const ShoppingCart = mongoose.model('shopping-carts', shoppingCartsSchema);

export default ShoppingCart;
