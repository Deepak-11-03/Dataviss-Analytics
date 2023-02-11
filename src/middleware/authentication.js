const jwt = require('jsonwebtoken')

const auth = async function (req, res, next) {
    try {
        let token = req.headers["authorization"]
        if (!token)
            return res.status(403).send({ status: false, msg: "Token is not present" })
        let decodedToken = jwt.verify(token, "thisisSecretKey")
        if(!decodedToken){
            return res.status(403).send({ status: false, msg: "invalid token" })
        }
       
        req.userid = decodedToken.userId
        next()
    }
    
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

module.exports = { auth }