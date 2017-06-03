module.exports = {
    database: 'mongodb://user:user123@ds137760.mlab.com:37760/ecommerce',
    port: process.env.PORT || 3000,
    secretKey: 'secret123',
    facebook: {
        clientID: process.env.FACEBOOK_ID || '298920833898310',
        clientSecret: process.env.FACEBOOK_SECRET || 'c4bbbad6506748eab3951b646bd90fed',
        profileFields: ['emails', 'displayName'],
        callbackURL: 'http://localhost:3000/auth/facebook/callback'
    }
}