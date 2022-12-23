import express from 'express';
import passport from "passport";
const router = express.Router();


router.get('/facebook', passport.authenticate('facebook', {scope: ['email', 'public_profile']}));
router.get('/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/account/login'
}), function (req,res) {
        res.redirect('/');
    }
);

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email','https://www.googleapis.com/auth/userinfo.profile',
'https://www.googleapis.com/auth/userinfo.email']}));
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/account/login'
}), function (req,res) {
        res.redirect('/');
    }
);

router.get('/github', passport.authenticate('github', {scope: ['email', 'public_profile', 'user:email']}));
router.get('/github/callback', passport.authenticate('github', {
    failureRedirect: '/account/login'
}), function (req,res) {
        res.redirect('/');
    }
);


export default router;