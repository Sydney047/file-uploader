const { validationResult, matchedData } = require( 'express-validator' );
const { validateSignUp, validateLogin, validateCreateFolder } = require( '../config/formValidation.js' );
const passport = require( 'passport' );
const db = require( '../scripts.js' );
const prisma = require('../lib/prisma.js');
const crypto = require( 'crypto' );
const multer = require( 'multer' );

const storage = multer.diskStorage({
    destination:  './public/data/' ,
    filename: function( req, file, cb ){
        crypto.randomBytes( 16, function ( err, raw ){
            if( err ) return cb( err )
            cb( null, file.originalname.split('.')[0] + '-' + raw.toString( 'hex' ) + '.' + file.originalname.split( '.' )[1] );              
        })
    }
})
const upload = multer({ 
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
});

exports.indexController =  async (req, res) => {
    const user = req.user ?? false;
    let folders = false;

    if ( user ) {
        folders = await db.getUserFoldersById( +user.id )
                                .then( async ( folders) => {
                                    await prisma.$disconnect();
                                    return folders;
                                }).catch( err => {
                                    console.log( err );
                                }) ?? false;
    }

    res.render('index', { title: 'Landing Page', user, folders });
}

exports.signUpGet = ( req, res ) => {
    res.render( 'form', { title: 'Sign Up', login: false } );
}

exports.loginGet = ( req, res ) => {
    const failedLogin = req.session?.messages ?? false;
    res.render( 'form', { title: 'Login', login: true, failedLogin } );
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

exports.createFolderPost = [
    validateCreateFolder, async ( req, res ) => {
        const errors = validationResult( req );
        const user = req.user;

        if ( !errors.isEmpty() ) {
            return res.render( 'index', { title: 'Home Page', errors: errors.array(), user } );
        };
        const { newFolder } = matchedData( req );
        const response = await db.createNewFolder( newFolder, +req.params.id );

        console.log( 'folder created, ' )
        console.log( response );
        
        res.status( 200 ).redirect( '/' );
    }
]

exports.deleteFolder = async ( req, res ) => {
    const { userId, folderId } = req.params;
    const folder = await db.deleteFolder( +folderId, +userId );
    
    console.log( 'Folder deleted')
    console.log( folder );

    res.status( 200 ).redirect( '/' );
}

exports.renameFolderGet  = async ( req, res ) => {
    const { userId, folderId } = req.params;

    await db.updateFolderEdit( +userId, +folderId );

    res.redirect( '/' );
}

exports.renameFolderPost = [
    validateCreateFolder, async ( req, res ) => {
        const { userId, folderId } = req.params;
        const { newFolder } = matchedData( req );

        await db.updateFolderName( +userId, +folderId, newFolder );
        res.redirect( '/' );
    }
]

exports.filesGet =  async ( req, res ) => {
    const { userId, folderId } = req.params;

    const folder = await db.getFolder( +userId, +folderId )

    res.render( 'files', { title: 'Files', user: req.user, folder } );
}

exports.addNewFile = ( req, res ) => {
    upload.single( 'newFile' )( req, res, async ( err ) => {
        if ( err instanceof multer.MulterError ) {
            return res.status( 400 ).send( `Multer Error, ${ err.message }` )
        } else if ( err ) {
            return res.status( 400 ).send( `Unexpected Error, ${ err.message }` )
        }

        const { userId, folderId } = req.params;
        const file = req.file;
        console.log( file )

        await db.createNewFile( +folderId, file.filename, file.size, file.mimetype, file.path );

        res.redirect( `/${ userId }/${ folderId }/files`  );
    }) 
        
}

exports.showFileDetails = async ( req, res ) => {
    const { userId, folderId, fileId } = req.params;

    await db.updateShowFileDetails( +folderId, +fileId );

    res.redirect( `/${ userId }/${ folderId }/files`  );
}

exports.hideFileDetails = async ( req, res ) => {
    const { userId, folderId, fileId } = req.params;

    await db.updateHideFileDetails( +folderId, +fileId );
    
    res.redirect( `/${ userId }/${ folderId }/files`  );
}

exports.downloadFile = async ( req, res ) => {
    const { folderId, fileId } = req.params;

    const file = await db.getFile( +folderId, +fileId );
    const fileName = file.name.split( '-' )[0] + '.' + file.name.split( '.' )[1];

    res.download( file.url, fileName, ( err ) => {
        if ( err || !res.headersSent )  {
            res.status( 404 ).send( 'Failed to download file' );
        };
    })
}
