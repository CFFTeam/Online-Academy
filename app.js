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
import PassportRoutes from "./routes/PassportRoutes.js";
import helpers from "./views/helpers.js";
import globalErrorHandler from "./controllers/errorController.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import passportAuth from "./middlewares/passport.js";

// middleware
import activate_session_middleware from "./middlewares/session.mdw.js";
import activate_locals_middleware from "./middlewares/locals.mdw.js";

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


app.use(bodyParser.urlencoded({ extended: false }));

// trigger middleware functions
activate_session_middleware(app);
activate_locals_middleware(app);

passportAuth(passport);
app.use("/", HomeRoutes);
app.use('/auth', PassportRoutes);
app.use("/account", UserRoutes);
app.use("/instructor", InstructorRoutes);
app.use("/payment", PaymentRoutes);
// error handling middleware
app.use(globalErrorHandler);

export default app;
