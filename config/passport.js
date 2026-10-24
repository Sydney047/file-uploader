const LocalStrategy = require( 'passport-local' ).Strategy;
const bcrypt = require( 'bcryptjs'  );
const { getUserByUsername, getUserById } = require( '../scripts.js')
const prisma = require( '../lib/prisma.js' );

module.exports = function( passport ) {
    passport.use( new LocalStrategy( async ( username, password, done )=> {
        try {
            const user = await getUserByUsername( username, prisma ).then( async ( user) => {
                await prisma.$disconnect();
                return user;
            }).catch( error => {
                console.log( error );
            });
            if ( !user ) {
                return done( null, false, { message: "Incorrect Login Credentials" } )
            }

            const matchedPasswords = await bcrypt.compare( password, user.password );
            if ( !matchedPasswords ){
                return done( null, false, { message: "Incorrect Login Credentials" } )
            }

            return done( null, user );
        } catch (error) {
            console.log( error );
        }
    }));

    passport.serializeUser( ( user, done )=> {
        return done( null, user.id );
    });

    passport.deserializeUser( async( id, done ) => {
        try {
            const user = await getUserById( +id, prisma ).then( async ( user ) => {
                await prisma.$disconnect();
                return user;
            }).catch( error => {
                console.log( error );
            });
            return done( null, user)
        } catch (error) {
            done( error );
        }
    })
}
