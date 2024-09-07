const jwt = require('jsonwebtoken');

const generateRefreshedToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: '3d'});
};

module.exports = { generateRefreshedToken };