const router = require('express').Router();
const passport = require('passport');

// auth login
router.get('/login',(req, res)=>{
    res.render('login', {user: req.user});
});

// auth logout
router.get('/logout',(req, res)=>{
    // handle with passport
    // res.send('logging out');
    req.logout();
    res.redirect('/auth/login');
});

// auth with google
router.get('/google',passport.authenticate('google',{
    scope: ['profile']
}));

router.get('/auth/facebook',
  passport.authenticate('facebook'));

  router.get('/github',
  passport.authenticate('github'));

  router.get('/spotify',
   passport.authenticate('spotify'), function(req, res) {});
   router.get('/auth/steam',
  passport.authenticate('steam'),
  function(req, res) {
    // The request will be redirected to Steam for authentication, so
    // this function will not be called.
  });

// callback route for google to redirect to
router.get('/google/callback',passport.authenticate('google'),(req, res)=>{
    //res.send('you reached the callback URI');
    //res.send(req.user);    
    res.redirect('/profile/');
});
router.get('/facebook/callback',passport.authenticate('facebook'),(req, res)=>{
    res.redirect('/profile/');
});
router.get('/github/callback',passport.authenticate('github'),(req, res)=>{
    res.redirect('/profile/');
});
router.get('/spotify/callback',passport.authenticate('spotify'),(req, res)=>{
    res.redirect('/profile/');
});
router.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
module.exports = router;