require( 'dotenv' ).config();
const { validationResult, matchedData } = require( 'express-validator' );
const { validateSignUp, validateLogin, validateCreateFolder } = require( '../config/formValidation.js' );
const passport = require( 'passport' );
const db = require( '../scripts.js' );
const prisma = require('../lib/prisma.js');
const crypto = require( 'node:crypto' );
const multer = require( 'multer' );
const cloudinary = require( 'cloudinary' ).v2;
const strimifier = require( 'streamifier' );

const storage = multer.memoryStorage()

const upload = multer({ 
    storage,
    limits: { fileSize: 4 * 1024 * 1024 },
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

exports.indexController =  async (req, res) => {
    const user = req.user ?? false;
    const { indexPage } = req.query || false;
    let folders = false;

    if ( user ) {
        folders = await db.getUserFoldersById( +user.id ) ?? false;
    }

    res.render('index', { title: 'Landing Page', user, folders, indexPage });
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

exports.indexRecentController = async ( req, res ) => {
    const user  = req.user;
    let folders = false;

    function recentFolders( folders ) {
        const now = new Date()

        const recent =  folders.filter( folder =>  {
            const createdDate = new Date( folder.createdAt )
            return ( now - 4 * 24 * 60 * 60 * 1000 ) <= createdDate;
        })
        return recent;
    }

    if ( user ) {
        folders = await db.getUserFoldersById( +user.id )
                                .then ( folders => {
                                    return recentFolders( folders );
                                }).catch( err => {
                                    console.log( err );
                                }) ?? false; 
    }

    res.render('index', { title: 'Recent Folders', user, folders, indexPage: 'recent' });
}

exports.indexFavouritesController = async ( req, res ) => {
    const user = req.user ?? false;
    let folders = false;

    function favouriteFolders( folders ) {

        const favourites =  folders.filter( folder =>  {
            return folder.favourite;
        })
        return favourites;
    }

    if ( user ) {
        folders = await db.getUserFoldersById( +user.id )
                                .then( folders =>{
                                    return  favouriteFolders( folders );
                                }).catch( err => {
                                    console.log( err );
                                }) ?? false;
    }

    res.render('index', { title: 'Favourites', user, folders, indexPage: 'favourites' });
}

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
            const folders = await db.getUserFoldersById( +user.id ) ?? false;
            
            return res.status( 400 ).render( 'index', { title: 'Home Page', errors: errors.array(), user, folders } );
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

exports.addFolderToFavourites = async ( req, res ) => {
    const { userId, folderId } = req.params;
    const { indexPage } = req.query ?? false;

    await db.addFolderToFavourites( +userId, +folderId );

    res.status( 200 ).redirect( `/?indexPage=${ indexPage }` );
}

exports.removeFolderFromFavourites = async ( req, res ) => {
    const { userId, folderId } = req.params;
    const { indexPage } = req.query ?? false;

    await db.removeFolderFromFavourites( +userId, +folderId );

    res.status( 200 ).redirect( `/?indexPage=${ indexPage }` )
}

exports.filesGet =  async ( req, res ) => {
    const { userId, folderId } = req.params;
    const { error } = req.query;

    const folder = await db.getFolder( +userId, +folderId );
    const files = await db.getFiles ( +folderId );

    res.render( 'files', { title: 'Files', user: req.user, folder, error, files } );
}

exports.addNewFile = ( req, res ) => {
    upload.single( 'newFile' )( req, res, async ( err ) => {
        if ( err instanceof multer.MulterError ) {
            return res.redirect( `/${ userId }/${ folderId }/files?error=${ err.message }` );
        } else if ( err ) {
            return res.status( 400 ).send( `Unexpected Error, ${ err.message }` )
        }

        const { userId, folderId } = req.params;
        const { folderName } = req.query;
        const file = req.file;

        if ( !file ) {
            return res.status( 400 ).redirect( `/${ userId }/${ folderId }/files?error=No file selected` );
        }

        const uploadStream = cloudinary.uploader.upload_stream( 
            {
                resource_type: 'auto',
                folder: `${ folderName }`,
            },
            async ( error, result ) => {
                if ( error ) {
                    console.error('Cloudinary Upload Error:', error );                      
                    return res.redirect( `/${ userId }/${ folderId }/files?error=${ error.message } ` );
                }

                await db.createNewFile( +folderId, file.originalname, file.size, file.mimetype, result.secure_url, result.public_id );
                res.redirect( `/${ userId }/${ folderId }/files`  );
            }
        )

        strimifier.createReadStream( file.buffer ).pipe( uploadStream );

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
    const { fileName, mimetype, publicId } = req.query;
    let resource_type;

    const filename = fileName.split( '-' )[0] + '.' + fileName.split( '.' )[1];

    ( mimetype.split('/')[0] === 'image' ) ? resource_type = 'image' :
    ( mimetype.split('/')[0] === 'video' ) ? resource_type = 'video' :
    ( mimetype.split('/')[1] === 'pdf' ) ? resource_type = 'video' : resource_type = 'raw';

    const downloadurl = cloudinary.url( publicId, { flags: 'attachment', resource_type, secure: true } )

    res.redirect( downloadurl );
}
exports.searchInFolder = async ( req, res ) => {
    const { userId, folderId } = req.params;
    const { query } = req.query;  

    const folder = await db.getFolder( +userId, +folderId );
    const files = await db.searchFilesInFolder( +folderId, query );
    res.render( 'files', { title: 'Files', user: req.user, folder, files } );
}  