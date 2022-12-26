import livereload from "livereload";
import connectLiveReload from "connect-livereload";
import express from "express";
import handlebars from "express-handlebars";
import mongoSanitize from "express-mongo-sanitize";
import bodyParser from "body-parser";
import HomeRoutes from "./routes/HomeRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import InstructorRoutes from "./routes/InstructorRoutes.js";
import PaymentRoutes from "./routes/PaymentRoutes.js";
import UserProfileRoutes from "./routes/UserProfileRoutes.js";
import WishlistRoutes from "./routes/WishlistRoutes.js";
import AdminRoutes from "./routes/AdminRoutes.js"
import PassportRoutes from "./routes/PassportRoutes.js";
import helpers from "./views/helpers.js";
import globalErrorHandler from "./controllers/errorController.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";

const app = express();
import passport from "passport";
import passportAuth from "./middlewares/passport.js";

// middleware
import activate_session_middleware from "./middlewares/session.mdw.js";
import activate_locals_middleware from "./middlewares/locals.mdw.js";
import auth_middleware from "./middlewares/auth.mdw.js";


const __dirname = dirname(fileURLToPath(import.meta.url));

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 10);
});


app.use(connectLiveReload());

// Handlebars.registerHelper('times', function(n, block) {
//   var accum = '';
//   for(var i = 0; i < n; ++i)
//       accum += block.fn(i);
//   return accum;
// });


app.engine(
  ".hbs",
  handlebars.engine({
    defaultLayout: "default",
    partialsDir: path.join(__dirname, "views/partials/"),
    extname: "hbs",
    helpers: helpers
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(mongoSanitize());

app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", [
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css/")),
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js/")),
  express.static(path.join(__dirname, "node_modules/jquery/dist/"))
]);

app.use(
  express.urlencoded({
    extended: true
  })
);

// trigger middleware functions
activate_session_middleware(app);
activate_locals_middleware(app);

passportAuth(passport);
app.use("/", HomeRoutes);
app.use('/auth', PassportRoutes);
app.use("/account", UserRoutes);
app.use("/instructor", InstructorRoutes);
app.use("/payment", PaymentRoutes);
app.use("/user-profile", auth_middleware, UserProfileRoutes);
app.use("/wishlist", WishlistRoutes);

//admin
app.use("/admin", AdminRoutes);

// error handling middleware
app.use(globalErrorHandler);

export default app;
