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
router.get( '/:userId/:folderId/deleteFolder', controller.deleteFolder );
router.get( '/:userId/:folderId/renameFolder', controller.renameFolderGet );
router.post( '/:userId/:folderId/renameFolder', controller.renameFolderPost );
router.get( '/:userId/:folderId/files', controller.filesGet );
router.post( '/:userId/:folderId/addNewFile', controller.addNewFile );
router.get( '/:userId/:folderId/:fileId/showFileDetails', controller.showFileDetails );
router.get( '/:userId/:folderId/:fileId/hideFileDetails', controller.hideFileDetails );
router.get( '/:userId/:folderId/:fileId/downloadFile', controller.downloadFile );

module.exports =router;