const { validationResult, matchedData } = require( 'express-validator' );
const { validateSignUp, validateLogin } = require( '../config/formValidation.js' );
const passport = require( 'passport' );
const db = require( '../scripts.js' );
const prisma = require('../lib/prisma.js');

exports.indexController =  async (req, res) => {
    const user = req.user ?? false;

    const folders = await db.getUserFoldersById( +user.id )
                                .then( async ( folders) => {
                                    await prisma.$disconnect();
                                    return folders;
                                }).catch( err => {
                                    console.log( err );
                                }) ?? false;

    res.render('index', { title: 'Landing Page', user, folders });
}

exports.signUpGet = ( req, res ) => {
    res.render( 'form', { title: 'Sign Up', login: false } );
}

exports.loginGet = ( req, res ) => {
    res.render( 'form', { title: 'Login', login: true } );
}

exports.contactMessagePost = ( req, res ) => {
    const message = true;
    res.render('index', { title: 'Landing Page', message });
}

exports.signUpPost = [
    validateSignUp,
    ( req, res ) => {
        const errors = validationResult( req );

        if ( !errors.isEmpty() ) {
            return res.render( 'form', { title: 'Sign Up', login: false, errors: errors.array() } );
        }

        const { username, email, password } = matchedData( req );
        db.createUser( username, email, password );
        res.render( 'form', { title: 'Login', login: true } );
    }
]

exports.loginPost =[ 
    validateLogin,
    ( req, res, next ) => {
        const errors = validationResult( req );

        if ( !errors.isEmpty() ) {
            return res.render( 'form', { title: 'Sign Up', login: true, errors: errors.array() } );
        };
        next()
    },
    passport.authenticate( 'local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureMessage: true,
    }),
]

exports.logoutGet = ( req, res, next )=> {
    req.logout( err=> {
        if( err ) {
            return next( err)
        }

        res.redirect( '/' );
    });
}