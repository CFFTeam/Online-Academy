import livereload from "livereload";
import connectLiveReload from "connect-livereload";
import express from "express";
import handlebars from "express-handlebars";
import mongoSanitize from "express-mongo-sanitize";
import HomeRoutes from "./routes/HomeRoutes.js";
import CoursesRoutes from "./routes/CoursesRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import InstructorRoutes from "./routes/InstructorRoutes.js";
import PaymentRoutes from "./routes/PaymentRoutes.js";
import UserProfileRoutes from "./routes/UserProfileRoutes.js";
import MyCoursesRoutes from "./routes/MyCoursesRoutes.js";
import WishlistRoutes from "./routes/WishlistRoutes.js"
import AdminRoutes from "./routes/AdminRoutes.js"
import PassportRoutes from "./routes/PassportRoutes.js";
import CourseDetailRoutes from "./routes/CourseDetailRoutes.js";
import helpers from "./views/helpers.js";
import globalErrorHandler from "./controllers/errorController.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
import passport from "passport";
import passportAuth from "./middlewares/passport.js";

// middleware
import activate_session_middleware from "./middlewares/session.mdw.js";
import activate_locals_middleware from "./middlewares/locals.mdw.js";
import auth_middleware from "./middlewares/auth.mdw.js";
import load_categories_middlewares from "./middlewares/load_categories.mdw.js";
import get_shopping_cart_total from "./middlewares/load_shopping_cart.mdw.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 10);
});

app.use(connectLiveReload());

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
load_categories_middlewares(app);
get_shopping_cart_total(app);

app.use("/", HomeRoutes);
app.use("/courses", CoursesRoutes);
app.use('/auth', PassportRoutes);
app.use("/account", UserRoutes);
app.use("/instructor", auth_middleware, InstructorRoutes);
app.use("/payment", auth_middleware, PaymentRoutes);
app.use("/user-profile", auth_middleware, UserProfileRoutes);
app.use("/my-courses", MyCoursesRoutes);
app.use("/wishlist", auth_middleware, WishlistRoutes);

//Course detail
app.use("/course", CourseDetailRoutes);

//admin
app.use("/admin",auth_middleware, AdminRoutes);

app.use('*', (req, res, next) => {
  res.locals.handlebars = 'errors/404';
  res.render(res.locals.handlebars, { layout: 'errors' });
});

// error handling middleware
app.use(globalErrorHandler);

export default app;
