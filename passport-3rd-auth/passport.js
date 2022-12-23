import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import passport from "passport";
import passportFacebook from "passport-facebook";
import User from "../models/userModel.js";



const FacebookStrategy = passportFacebook.Strategy;

export default function(passport) {
  passport.use(new FacebookStrategy({
    clientID: process.env.CLIENT_ID_FB,
    clientSecret: process.env.CLIENT_SECRET_FB ,
    callbackURL: "http://localhost:5000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
    console.log('accessToken', accessToken);
  }
));
}
