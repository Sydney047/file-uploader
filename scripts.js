const { name } = require('ejs');
const prisma = require( './lib/prisma.js' );
const bcrypt = require( 'bcryptjs' );

const createUser = async ( username, email, password ) =>{
    const hashedPassword = await bcrypt.hash( password, 10 )

    try {
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: `${ hashedPassword }`,
            }
        });
        console.log( 'The following User Has been created: ', user );
    } catch (error) {
        console.log( error  );
    } finally {
        await prisma.$disconnect();
    }
}

async function getUserByUsername( username, prisma ) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username,
            },    
        });

        return user;
    } catch (error) {
        console.log( 'failed to find user', error.message)
    } 
}

async function getUserById ( id, prisma ) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id,
            },    
        });

        return user;
    } catch (error) {
        console.log( 'failed to find user', error.message)
    } 
}

const getUserFoldersById = async ( id )  => {
    try {
        const folders = await prisma.folder.findMany({
            where: {
                userId: id,
            },
            include: {
                files: true,
            }
        })
        return folders;
    } catch (error) {
        console.log( error );
    } 
}

const createNewFolder = async ( folderName, userId ) => {
    try {
        const newFolder = await prisma.folder.create({
            data: {
                name: folderName,
                userId,
            },
        })
    } catch (error) {
        console.log( error );
    } finally{
        await prisma.$disconnect();
    }
}

const deleteFolder = async ( folderId, userId ) => {
    try {
        await prisma.file.deleteMany({
            where: {
                folderId,
            },
        });
        const folder = await prisma.folder.delete({
            where: {
                userId,
                id: folderId,
            },
        });

        return folder;
    } catch (error) {
        console.log( error );
    } finally{
        await prisma.$disconnect();
    }
}

const updateFolderEdit = async ( userId, folderId ) => {
    try {
        await prisma.folder.update({
            where: {
                userId,
                id: folderId,
            },
            data: {
                edit: true,
            },
        });
    } catch (error) {
        console.log( error );
    } finally {
        await prisma.$disconnect();
    }

}

const updateFolderName = async ( userId, folderId, updatedName ) => {
    try {
        await prisma.folder.update({
            where: {
                userId,
                id: folderId
            },
            data: {
                edit: false,
            },
        });

        if ( updatedName ) {
            await prisma.folder.update({
                where: {
                    userId,
                    id: folderId
                },
                data: {
                    name: updatedName,
                },
            });
        };
    } catch (error) {
        console.log( error );
    } finally {
        await prisma.$disconnect();
    }

}
const getFolder = async ( userId, folderId ) => {
    try {
        const folder = await prisma.folder.findFirst({
            where: {
                userId,
                id: folderId,
            },
            include: {
                files: true,
            },
        });

        return folder;
    } catch (error) {
        console.log( error );
    } finally {
        await prisma.$disconnect();
    }
}

const createNewFile = async ( folderId, filename, fileSize, fileMimetype, filePath, publicId ) => {
    try {
       const file = await prisma.file.create({
        data: {
            folderId,
            name: filename,
            size: fileSize,
            mimetype: fileMimetype,
            url: filePath,
            publicId, 
        },
       }) ;
       console.log( 'File Created' )
       console.log( file )
    } catch (error) {
        console.log( error );
    } finally {
        await prisma.$disconnect();
    }
}

const updateShowFileDetails = async ( folderId, fileId ) => {
    try {
       const updatedfile = await prisma.file.update({
            where: {
                folderId,
                id: fileId,
            },
            data: {
                details: true,
            },
        }); 

        console.log( updatedfile );
    } catch (error) {
        console.log( error );
    } finally {
        await prisma.$disconnect()
    }
}

const updateHideFileDetails = async ( folderId, fileId ) => {
    try {
       const updatedfile = await prisma.file.update({
            where: {
                folderId,
                id: fileId,
            },
            data: {
                details: false,
            },
        }); 

        console.log( updatedfile );
    } catch (error) {
        console.log( error );
    } finally {
        await prisma.$disconnect()
    }
}

const getFile = async ( folderId, fileId ) => {
    try {
        const file = await prisma.file.findFirst({
            where: {
                folderId,
                id: fileId,
            },
        });

        return file;
    } catch (error) {
       console.log( error ) 
    } finally {
        await prisma.$disconnect()
    }
}

module.exports = { 
    createUser, getUserByUsername, getUserById, getUserFoldersById, createNewFolder,
    deleteFolder, updateFolderEdit, updateFolderName, getFolder, createNewFile,
    updateShowFileDetails, updateHideFileDetails, getFile,
};