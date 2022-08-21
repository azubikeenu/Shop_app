const multer = require( 'multer' );
const sharp = require( 'sharp' );
const crypto = require( 'crypto' );

const multerStorage = multer.memoryStorage();

const upload = multer( {
    storage: multerStorage
} );


exports.resizeImage = ( req, res, next ) => {
    const randomId = crypto.randomBytes( 4 ).toString( 'hex' );
    if ( !req.file ) {
        return next();
    }
    req.file.filename = `${randomId}-${Date.now()}.png`;
    sharp( req.file.buffer )
        .resize( 500, 500 )
        .toFormat( 'png' )
        .jpeg( {
            quality: 90
        } )
        .toFile( `public/img/${req.file.filename}` );
    next();
};

module.exports.uploadPhoto = upload.single( 'photo' );