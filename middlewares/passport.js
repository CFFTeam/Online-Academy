import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import passport from "passport";
import passportFacebook from "passport-facebook";
import passportGoogle from 'passport-google-oauth20';
import passportGithub from 'passport-github';
import User from "../models/userModel.js";
const FacebookStrategy = passportFacebook.Strategy;
const GoogleStrategy = passportGoogle.Strategy;
const GitHubStrategy = passportGithub.Strategy;


export default function(passport) {
  passport.use(new FacebookStrategy({
    clientID: process.env.CLIENT_ID_FB,
    clientSecret: process.env.CLIENT_SECRET_FB ,  
    callbackURL: "http://localhost:5000/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name']
  },
  async function(accessToken, refreshToken, profile, cb) {
    if (profile.id) {
       // asynchronous
        const foundUser = await User.findOne({ facebookId: profile.id });
        if (foundUser) {
          return cb(null, foundUser);
        }
        else {
          const newUser = await User.create({
            facebookId: profile.id,
            name: profile.name.familyName + ' ' + profile.name.givenName,
            email: profile.emails[0].value
          });
          return cb(null, newUser)
        }
    }
  }
  ));

  passport.use(new GoogleStrategy({
    clientID:     process.env.CLIENT_ID_GOOGLE,
    clientSecret: process.env.CLIENT_SECRET_GOOGLE,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    if (profile.id) {
      // asynchronous
       const foundUser = await User.findOne({ googleId: profile.id });
       if (foundUser) {
         return cb(null, foundUser);
       }
       else {
         const newUser = await User.create({
          googleId: profile.id,
          name: profile.name.familyName + ' ' + profile.name.givenName,
          email: profile.emails[0].value
         });
         return cb(null, newUser)
       }
   }
  }
));


passport.use(new GitHubStrategy({
  clientID: process.env.CLIENT_ID_GITHUB,
  clientSecret: process.env.CLIENT_SECRET_GITHUB,
  callbackURL: "http://localhost:5000/auth/github/callback"
},
async function(accessToken, refreshToken, profile, cb) {
  if (profile.id) {
    // asynchronous
     const foundUser = await User.findOne({ githubId: profile.id });
     if (foundUser) {
       return cb(null, foundUser);
     }
     else {
       const newUser = await User.create({
         githubId: profile.id,
         name: profile.displayName,
         username: profile.username
       });
       return cb(null, newUser)
     }
 }
}
));

  // setting session (req.session.passport.user)
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  // setting request (req.user)
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then(user => {
        done(null, user);
      })
  });
}
