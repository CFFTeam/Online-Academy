// protected resource
export default function auth(req, res, next) {
  if (req.session.auth === false) {
    req.session.retUrl = req.originalUrl;
    return res.redirect('/account/login');
  }
  next();
}