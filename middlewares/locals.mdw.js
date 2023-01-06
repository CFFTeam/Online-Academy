export default function (app) {
    app.use(function (req, res, next) {
        if (typeof(req.session.auth) == 'undefined') {
            req.session.auth = false;
        }
        // if disable user using passport to login
        if (req.session.passport && req.session.passport.user && !req.session.passport.user.active) {
            req.session.passport = false;
            req.session.user = null;
            return res.render("auth/login.hbs", {layout: "auth.hbs", message: "Your account has been disabled. Contact your administrator for more information."});
        }
        res.locals.auth = req.session.passport ? true : req.session.auth;
        res.locals.authUser = req.session.passport ? req.session.passport.user : req.session.authUser;
        next();
    });
}