// protected resource
export default function auth(req, res, next) {
  if (req.session.auth === false && !req.session.passport) {
    req.session.retUrl = req.originalUrl;
    return res.redirect('/account/login');
  }
  res.locals.loginby = req.session.passport ? 'socials' : 'local';

  next();
}