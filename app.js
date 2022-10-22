//jshint esversion:6
require('dotenv').config()
const express = require('express');
const ejs = require('ejs'); 
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const flash = require('connect-flash');
// const expflash = require('express-flash');
const cookieParser = require('cookie-parser');


const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs'); 
app.use(bodyParser.urlencoded({extended: true})); 
app.use(session({
   secret: 'This is a secret.',
   resave: false,
   saveUninitialized: false,
   rolling: true,
   cookie: {
      // Session expires after 1 min of inactivity.
      expires: 60000

  }
 }));
 app.use(flash());
 app.use(function(req, res, next){
   res.locals.message = req.flash();
   next();
});

//passport configuration 

 app.use(passport.initialize());
 app.use(passport.session());

//mongoDB Schema and model

mongoose.connect('mongodb+srv://henryarpon:Welcome03045@cluster0.yjvwcrp.mongodb.net/userlistDB', {useNewUrlParser: true});

const userSchema = new mongoose.Schema( {
   email: String,
   password: String
}); 

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);


const inventorySchema = new mongoose.Schema( {
   productName: String,
   qtyReceived: Number,
   qtyIssued: Number,
   balance: Number,
   price: Number,
   dateAdded: Date,
   action: Boolean
}); 

const Inventory = mongoose.model('Inventory', inventorySchema);


//passport configuration 

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//GET request 

app.get('/', (req, res) => {
   res.render('home');
}); 

app.get('/login', (req, res) => {
   // req.flash("error", "");
    res.render('login')
 }); 

 app.get('/register', (req, res) => {
   // req.flash("error", "");
    res.render('register')
 }); 

 app.get('/dashboard', (req, res) => {


   if (req.isAuthenticated()) {
      res.render('dashboard'); 
   } else {
      res.render('login');
   }

 }); 

 app.get('/inventory', (req, res) => {

   if (req.isAuthenticated()) {
      res.render('inventory');
   } else {
      res.render('login');
   }
   
 });

 app.get('/additem', (req, res) => {

   if (req.isAuthenticated()) {
      res.render('additem');
   } else {
      res.render('login');
   }
   res.render('additem');
 });



 app.get('/cart', (req, res) => {

   if (req.isAuthenticated()) {
      res.render('cart');
   } else {
      res.render('login');
   }
});

app.get('/sales', (req, res) => {

   if (req.isAuthenticated()) {
      res.render('sales');
   } else {
      res.render('login');
   }
});

app.get('/logout', function (req, res) {
   req.logOut(function(err) {
      if (err) {
         console.log(err); 
      } else {
         res.redirect('/');
      }
   });
  
 });

 //POST request 
 
 app.post('/register', (req, res) => {


   User.register({username: req.body.username}, req.body.password, (err, user) => {
      if (err) {
         console.log(err);
         // res.redirect('/register');
      } else {
         passport.authenticate('local')(req, res, () => {
             res.redirect('/');
         });
      }
   });
 });


app.post('/login', (req, res) => {
   
   const user = new User({
      username: req.body.username,
      password: req.body.password
   });

   req.login(user, (err) => {

      if(err) {
         console.log(err); 
      } else {
         passport.authenticate('local', 
         { failureRedirect: '/login', 
         failureFlash: true})(req, res, () => {
            // req.flash("success", "Logged in");
            res.redirect('/dashboard');
        });
      }
   });

}); 

app.post('/additem', (req, res) => {

   const productName = req.body.productName;
   const qtyReceived = req.body.qtyReceived; 
   let qtyIssued = 0;
   let balance = 0;
   const price = req.body.price;
   const date = req.body.date; 

   const inventory = new Inventory({
      productName: productName,
      qtyReceived: qtyReceived,
      price: price,
      dateAdded: date,  
   });

   inventory.save();
   res.redirect('/inventory');

}); 




app.listen(3000, () => {
     console.log('Server started at port 3000')
});