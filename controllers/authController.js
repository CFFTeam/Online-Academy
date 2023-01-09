import { NOTIMP } from "dns";
import express from "express";
import User from '../models/userModel.js';
import catchAsync from "../utilities/catchAsync.js";
import sendEmail from "../utilities/sendEmail.js";
import crypto from 'crypto'
import jwt from 'jsonwebtoken';
import validateUser from '../middlewares/auth.mdw.js';



// handle for login (method GET)
export const renderLoginForm = async (req, res) => {
  res.locals.HTMLTitle = 'Login';
  res.render("auth/login.hbs", { layout: "auth.hbs" });
};


// handle for login (method POST)
export const handleLoginForm = catchAsync(async (req, res, next) => {
  res.locals.handlebars = 'auth/login';
  res.locals.layout = "auth.hbs";
  res.locals.props = { historyEmail: req.body.email };
  res.locals.HTMLTitle = 'Login';

  const { email, password } = req.body;
  const foundUser = await User.findOne({ email: email }).select('+password');
  if (foundUser && !foundUser.password) {
    return next(new Error('This account is already used with social media platform. Please try again.'));
  }
  if (!foundUser || !(await foundUser.correctPassword(password, foundUser.password))) {
    return next(new Error('Incorrect email or password. Please try again.'));
  }
  if (!foundUser.active) res.render("auth/login.hbs", {layout: "auth.hbs", message: "Your account has been disabled. Contact your administrator for more information."});
  // set session for request
  req.session.auth = true;
  req.session.authUser = {
    _id: foundUser._id,
    name: foundUser.name,
    email: foundUser.email,
    sex: foundUser.sex,
    role: foundUser.role,
    photo: foundUser.photo,
    phoneNumber: foundUser.phoneNumber,
    birthday: foundUser.birthday,
    address: foundUser.address,
    active: foundUser.active,
    myCourses: foundUser.myCourses
  }
  if (foundUser.role === 'instructor' && foundUser.active) return res.redirect('/instructor/my-courses');
  if (foundUser.role === 'admin' && foundUser.active) return res.redirect('/admin/categories');
  res.render("auth/login.hbs", { layout: "auth.hbs", message: "success" });
});

// handle for register (method GET)
export const renderSignupForm = (req, res) => {
  res.locals.HTMLTitle = 'Signup';
  res.render("auth/signup.hbs", { layout: "auth.hbs" });
};

// handle for register (method POST)
export const handleSignupForm = catchAsync(async (req, res, next, err) => {
  res.locals.handlebars = 'auth/signup';
  res.locals.layout = "auth.hbs";
  res.locals.props = {
    historyName: req.body.name,
    historyEmail: req.body.email
  }
  res.locals.HTMLTitle = 'Signup';

  // Find user by email to check it existed or not.
  const foundUser = await User.findOne({ email: req.body.email });
  if (foundUser) return next(new Error("This email already exists. Please try again."));

  // create OTP 
  const verificationCode = crypto.randomBytes(3).toString('hex');
  const message = `Your verification code is ${verificationCode}. Please enter it to register your account.`;
  try {
    await sendEmail({
      email: req.body.email,
      subject: "Your verification code (valid for 10 minutes)",
      message
    });
  }
  catch (err) {
    return next(new Error('There was an error sending the email. Try again later!'));
  }
  // create payload field in token
  const payload = {
    verificationCode: verificationCode,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  }
  const userVerifyToken = jwt.sign(payload,
    process.env.USER_VERIFY_TOKEN_SECRET);
  res.redirect(`/account/verify-otp?u=${userVerifyToken}`);
});


export const renderOTPForm = (req, res) => {
  res.locals.HTMLTitle = 'Verify OTP';

  res.render('auth/OTP.hbs', { layout: 'auth.hbs' });
};

export const handleOTPForm = catchAsync(async (req, res, next, err) => {
  // set up local
  res.locals.handlebars = 'auth/OTP';
  res.locals.layout = "auth.hbs";
  res.locals.HTMLTitle = 'Verify OTP';

  let msg = "";
  const candidateCode = req.body.verificationCode;
  const userVerifyToken = req.query.u;
  await jwt.verify(userVerifyToken, process.env.USER_VERIFY_TOKEN_SECRET, async (err, decoded) => {
    if (err) return next(err);
    const { verificationCode, name, email, password } = decoded;
    if (verificationCode == candidateCode) {
      if (name) {
        await User.create({
          email,
          name,
          password,
          myCourses: [],
          wishlist: []
        });
        msg = "success-sign-up";
      }
      else msg = "reset-pwd";
    }
    // else return next(new Error('Invalid verification code'));
    else return next(new Error('Invalid verification code'));
  })
  if (msg == "success-sign-up") res.render('auth/OTP.hbs', { layout: 'auth.hbs', message: msg });
  else if (msg == "reset-pwd") res.redirect(`/account/new-password/?u=${userVerifyToken}`);
});

export const renderForgotPasswordForm = async (req, res) => {
  res.locals.HTMLTitle = 'Forgot password';
  res.render('auth/forgotPassword.hbs', { layout: 'auth.hbs' });
}

export const handleForgotPasswordForm = catchAsync(async (req, res, next, err) => {
  res.locals.handlebars = 'auth/forgotPassword';
  res.locals.layout = "auth.hbs";
  res.locals.props = { historyEmail: req.body.email };
  res.locals.HTMLTitle = 'Forgot password';

  const foundUser = await User.findOne({ email: req.body.email }).select('+password');
  if (!foundUser) return next(new Error("This email does not exist. Please try again."));
  if (foundUser && !foundUser.password) {
    return next(new Error('You can not use this feature because this account is already used with social media platform.'));
  }
  // create OTP 
  const verificationCode = crypto.randomBytes(3).toString('hex');
  const message = `Your verification code is ${verificationCode}. Please enter it to register your account.`;
  try {
    await sendEmail({
      email: req.body.email,
      subject: "Your verification code (valid for 10 minutes)",
      message
    });
  }
  catch (err) {
    return next(new Error('There was an error sending the email. Try again later!'));
  }
  // create payload field in token
  const payload = {
    verificationCode: verificationCode,
    email: req.body.email
  }
  const userVerifyToken = jwt.sign(payload,
    process.env.USER_VERIFY_TOKEN_SECRET);
  res.redirect(`/account/verify-otp?u=${userVerifyToken}`);
});


export const renderNewPasswordForm = async (req, res) => {
  res.locals.HTMLTitle = 'Reset password';
  
  res.render('auth/newPassword.hbs', { layout: 'auth.hbs' });
}

export const handleNewPasswordForm = catchAsync(async (req, res, next) => {
  res.locals.handlebars = 'auth/newPassword';
  res.locals.layout = "auth.hbs";
  res.locals.HTMLTitle = 'Reset password';
  const userVerifyToken = req.query.u;
  await jwt.verify(userVerifyToken, process.env.USER_VERIFY_TOKEN_SECRET, async (err, decoded) => {
    if (err) return next(err);
    const { email } = decoded;
    const foundUser = await User.findOne({ email: email });
    foundUser.password = req.body.password;
    foundUser.userVerifyToken = undefined;
    foundUser.passwordResetExpires = undefined;
    //  Update changedPasswordAt property for the user
    foundUser.passwordChangedAt = Date.now() - 1000;
    await foundUser.save();
  })
  res.render("auth/newPassword.hbs", { layout: "auth.hbs", message: "success" });
});

// log out
export const logout = catchAsync(async (req, res, next) => {
  req.session.auth = false;
  req.session.passport = null; 
  req.session.authUser = null;
  const url = req.headers.referer || '/';
  res.redirect(url);
});


