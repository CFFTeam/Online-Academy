import livereload from "livereload";
import connectLiveReload from "connect-livereload";
import express from "express";
import handlebars from "express-handlebars";
import mongoSanitize from "express-mongo-sanitize";
import bodyParser from "body-parser";
import HomeRoutes from "./routes/HomeRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import PaymentRoutes from "./routes/PaymentRoutes.js";
import PassportRoutes from "./routes/PassportRoutes.js";
import helpers from "./views/helpers.js";
import globalErrorHandler from "./controllers/errorController.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import passport from "passport";
//import passportAuth from "./passport-3rd-auth/passport.js";

// middleware
import activate_session_middleware from "./middlewares/session.mdw.js";
import activate_locals_middleware from "./middlewares/locals.mdw.js";

// testing ti xoa
import passportFacebook from "passport-facebook";
import dotenv from "dotenv";
import User from "./models/userModel.js";
import findOrCreate from 'mongoose-find-or-create';

const FacebookStrategy = passportFacebook.Strategy;
dotenv.config({ path: "./config.env" });


const __dirname = dirname(fileURLToPath(import.meta.url));

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 10);
});

const app = express();

app.use(connectLiveReload());

app.engine(
  ".hbs",
  handlebars.engine({
    defaultLayout: "default",
    partialsDir: path.join(__dirname, "views/partials/"),
    extname: "hbs",
    helpers: helpers,
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(mongoSanitize());

app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", [
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css/")),
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js/")),
  express.static(path.join(__dirname, "node_modules/jquery/dist/")),
]);


app.use(bodyParser.urlencoded({ extended: false }));


// trigger middleware functions
activate_session_middleware(app);
activate_locals_middleware(app);

//app.use(passport.initialize());
//app.use(passport.session());
// passportAuth(passport);
passport.use(new FacebookStrategy({
  clientID: process.env.CLIENT_ID_FB,
  clientSecret: process.env.CLIENT_SECRET_FB ,  
  callbackURL: "http://localhost:5000/auth/facebook/callback"
},
function(accessToken, refreshToken, profile, cb) {
  // console.log("user profile: ", profile);
  // console.log('accessToken', accessToken);
  // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
  //   return cb(err, user);
  // });
  done(null,profile);
}
));

app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email', 'public_profile']}));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    //successRedirect: '/account/signup',
    failureRedirect: '/account/login'
}), function (req,res) {
  console.log(req);
  console.log(res);
  //console.log("req ne: ",  req);
  //console.log("\nres ne: ",  res);
  res.redirect('/');
}
);

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id)
//     .then(user => {
//       done(null, user);
//     })
// });

app.use("/", HomeRoutes);
app.use('/auth', PassportRoutes);
app.use("/account", UserRoutes);
app.use("/payment", PaymentRoutes);
// error handling middleware
app.use(globalErrorHandler);

export default app;
