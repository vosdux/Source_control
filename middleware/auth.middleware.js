const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }

    try {
        const token = req.headers.authorization.split(' ')[1];

        console.log()

        if (!token) {
            return res.status(401).json({ message: 'Нет авторизации' });
        }

        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded
        next()
    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: 'Нет авторизации' });
    }
}