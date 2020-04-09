const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');
const GitHubStrategy = require('passport-github').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;
const SteamStrategy = require('passport-steam');
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done)=>{
    done(null, user.id); // A piece of info and save it to cookies
});

passport.deserializeUser((id, done)=>{
    //Who's id is this?
    User.query(`select row_to_json (u) from ( SELECT "oauth".isUserFound(${id}) as user) u;`,(err,res)=>{
        if(err){
            console.log(err);
        }else{                        
            const user = res.rows[0].row_to_json.user;
            console.log(">>>> deserializeUser >>>>> ",user);
            done(null, user); 
        }        
    });
});

passport.use(
    new GoogleStrategy({
        // options for the google strat
        callbackURL: '/auth/google/callback',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, (accessToken, refreshToken, profile, done)=>{
        // check if user already exists in our database
        console.log('##########################');
        console.log(profile);
        
        // const sql1 = `select count(*) as result from "oauth".user where id=${profile.id}`;
        // User.query(sql1,(err,res)=>{
        //     console.log(`>>>>>>>>>>>>>> res = ${JSON.stringify(res)}`)
        //     console.log(`>>>>>>>>>>>>>> result = ${res.rows[0].result}`)
        //     if(res.rows[0].result==0 && res.rows[0].result!=undefined){
        //         const sql2 = `INSERT INTO "oauth".user 
        //         VALUES( ${profile.id},
        //                 '${profile.displayName}',
        //                 ${profile.photos[0].value})`;
        //         User.query(sql2,(err1, res1)=>{
        //             if(err1) User.end();
        //             console.log("##############");
        //             console.log("User has been successfully inserted!");
        //             console.log(sql2);
        //             User.end();
        //         });
        //         console.log("User inserted!");
        //     }else{
        //         console.log("User has been already inserted!");
        //     }            
        // });

        User.query(`CALL "oauth".insert_when_unique(${profile.id},
                                                    '${profile.displayName}',
                                                    '${profile.photos[0].value}');`,
                    (err,res)=>{
                        console.log(">>>>>>>>>>>>>>>>>>>>>>");
                        const _user = {
                            id: profile.id,
                            name: profile.displayName,                                
                            picture: profile.photos[0].value
                        };

                        if(err){
                            //already have the user
                            const currentUser = _user;
                            console.log('User is ', JSON.stringify(currentUser));
                            done(null, currentUser);
                            //console.log(err);
                        }else{
                            //if not, new user was created in our db
                            const newUser = _user;
                            console.log('New User created: ' + JSON.stringify(newUser));
                            done(null, newUser);
                            // console.log(res.rows[0]);
                        }
                    });


    })
);
passport.use(
    new FacebookStrategy({
    clientID: keys.facebook.clientID,
    clientSecret: keys.facebook.clientSecret,
    callbackURL: "auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, cb) { 
    User.query(`CALL "oauth".insert_when_unique(${profile.id},
        '${profile.displayName}',
        '${profile.photos[0].value}');`,
        (err,res)=>{
        console.log(">>>>>>>>>>>>>>>>>>>>>>");
        const _user = {
        id: profile.id,
        name: profile.displayName,                                
        picture: profile.photos[0].value
        };

        if(err){
        const currentUser = _user;
        console.log('User is ', JSON.stringify(currentUser));
        cb(null, currentUser);
        console.log(err);
        }else{
        const newUser = _user;
        console.log('New User created: ' + JSON.stringify(newUser));
        cb(null, newUser);
        console.log(res.rows[0]);
        }
        });  
  }
));
passport.use(
    new GitHubStrategy({
    clientID: keys.github.clientID,
    clientSecret: keys.github.clientSecret,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile)
    User.query(`CALL "oauth".insert_when_unique(${profile.id},
        '${profile.username}',
        '${profile.photos[0].value}');`,
        (err,res)=>{
        console.log(">>>>>>>>>>>>>>>>>>>>>>");
        const _user = {
        id: profile.id,
        name: profile.username,                                
        picture: profile.photos[0].value
        };

        if(err){
        //already have the user
        const currentUser = _user;
        console.log('User is ', JSON.stringify(currentUser));
        cb(null, currentUser);
        //console.log(err);
        }else{
        //if not, new user was created in our db
        const newUser = _user;
        console.log('New User created: ' + JSON.stringify(newUser));
        cb(null, newUser);
        // console.log(res.rows[0]);
        }
        });
  }
));
passport.use(
    new SpotifyStrategy(
      {
        clientID: keys.spotify.clientID,
        clientSecret: keys.spotify.clientSecret,
        callbackURL: "http://localhost:3000/auth/spotify/callback"
      },
      function(accessToken, refreshToken, expires_in, profile, done) {
          console.log(profile)
        var x;
        var str = "";
        var temp = profile.id;
        for(var i=0;i<temp.length;i++){
            var x = temp.charCodeAt(i);
            str += x;
        }
        if(profile.photos[0]==undefined){
            x ="https://i.imgur.com/sy5Jpzd.jpg";
          }else{
            x = profile.photos[0].value;
          }
        var xd = parseInt(str);

                User.query(`CALL "oauth".insert_when_unique(${xd},
                    '${profile.displayName}',
                    '${x}');`,
                (err,res)=>{
                console.log(">>>>>>>>>>>>>>>>>>>>>>");
                const _user = {
                id: xd,
                name: profile.displayName,                                
                picture: x
                };

                if(err){
                //already have the user
                const currentUser = _user;
                console.log('User is ', JSON.stringify(currentUser));
                done(null, currentUser);
                //console.log(err);
                }else{
                //if not, new user was created in our db
                const newUser = _user;
                console.log('New User created: ' + JSON.stringify(newUser));
                done(null, newUser);
                // console.log(res.rows[0]);
                }
                });
      }
    )
  );
  passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/auth/steam/return',
    realm: 'http://localhost:3000/',
    apiKey: keys.steam.APIkey
  },
  function(identifier, profile, done) {
    User.findByOpenID({ openId: identifier }, function (err, user) {
      return done(err, user);
    });
  }
));