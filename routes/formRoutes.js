const { Router } = require( 'express' );
const controller = require( '../controllers/controller')
const router = Router();

router.get('/', controller.indexController ); 
router.get( '/sign-up', controller.signUpGet );
router.get( '/login', controller.loginGet );
router.post( '/contact-us', controller.contactMessagePost );
router.post( '/sign-up', controller.signUpPost );
router.post( '/login', controller.loginPost );
router.get( '/logout', controller.logoutGet );
router.post( '/:id/create-folder', controller.createFolderPost );
module.exports =router;