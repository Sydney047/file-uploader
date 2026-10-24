const prisma = require( './lib/prisma.js' );
const bcrypt = require( 'bcryptjs' );

exports.createUser = async ( username, email, password ) =>{
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

module.exports = { getUserByUsername, getUserById };