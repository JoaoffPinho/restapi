const config = {
    /* don't expose password or any sensitive info, done only for demo */
    // if environment variables are not defined, use default values
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DB: process.env.DB_NAME,
    // secret key (as String) to encode and decode token from JWT
    JWT_SECRET: process.env.JWT_SECRET,
};

config.URL = `mongodb+srv://${config.USER}:${config.PASSWORD}@cluster0.tl1io.mongodb.net/${config.DB}?retryWrites=true&w=majority`;
module.exports = config;