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

module.exports = { createUser, getUserByUsername, getUserById, getUserFoldersById, 
    createNewFolder, deleteFolder, updateFolderEdit, updateFolderName };