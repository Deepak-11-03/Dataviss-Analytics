const router = require('express').Router();
const controller = require('../controller/controller')
const authentication = require('../middleware/authentication')


router.post('/register' , controller.register)
router.post('/login' , controller.login)
router.post('/addnew' ,authentication.auth, controller.addNew)
router.get('/getdetails' ,authentication.auth, controller.getDetails)
router.put('/update/:userId' ,authentication.auth, controller.updateData)

module.exports = router