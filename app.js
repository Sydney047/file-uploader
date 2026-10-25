require( 'dotenv' ).config();
const express = require( 'express' );
const session = require( 'express-session' );
const passport = require( 'passport' );
const path = require( 'path' );
const routes  = require( './routes/formRoutes' );

const app = express();

app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'ejs' );
app.use( express.urlencoded({ extended: true }));
app.use( session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, 
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
 }) );
app.use( passport.initialize());
app.use( passport.session() );
require( './config/passport' )( passport );

const PORT = process.env.PORT
app.listen( PORT || 3000, () =>{
    console.log( `Server set up and listening on ${ PORT }` );
    
} )

app.use( '/', routes );