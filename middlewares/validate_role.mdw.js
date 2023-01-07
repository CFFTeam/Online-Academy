export function validateInstructor(req,res,next) {
    if (req.session.auth && req.session.authUser && req.session.authUser.role != "instructor" ||
    req.session.passport && req.session.passport.user && req.session.passport.user.role != "instructor") {
        return res.redirect('/account/login');
    }
    next();
}

export function validateAdmin(req,res,next) {
    if (req.session.auth && req.session.authUser && req.session.authUser.role != "admin" ||
    req.session.passport && req.session.passport.user && req.session.passport.user.role != "admin") {
        return res.redirect('/account/login');
    }
    next();
}