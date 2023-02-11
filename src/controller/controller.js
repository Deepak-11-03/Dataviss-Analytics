const registerModel = require('../model/registerModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true;
}

//               ------------------------- Register ------------------------------------------
const register = async(req,res)=>{
    try {
        let{firstName,middleName,lastName,email,password,confirmPassword,role,department} = req.body;

        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter Detail ' });
        }
        if(!isValid(firstName)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter firstName ' });
        }
        if(!isValid(middleName)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter middleName ' });
        }
        if(!isValid(lastName)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter lastName ' });
        }
        if(!isValid(email)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter email ' });
        }
        if(!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/.test(email)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter valid email ' });
        }
        let existingEmail = await registerModel.findOne({email});
        if(existingEmail){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! This email is already registerd with another account ' });
        }
        if(!isValid(password)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter password ' });
        }
        if(!isValid(confirmPassword) || password != confirmPassword){
            return res.status(400).send({ status: false, msg: 'Please confirm your password' });
        }
        if(password.length < 6 || password.length > 12){
            return res.status(400).send({ status: false, msg: 'password length must be between 6 to 12' });
        }
        if(!['Admin',"User"].includes(role)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter valid role ' });
        }
        if(!isValid(department)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter department ' });
        }       
        //password hashing
        password = await bcrypt.hash(password, 10);

        let data = await registerModel.create({firstName,lastName,middleName,email,role,department,password});
        return res.status(200).send(data);
    } catch (error) {
        return res.status(500).send({error:error.message});
    }
}


//          ----------------------------- Login ---------------------------------------------

const login = async(req,res)=>{
    try {
        let {email ,password} = req.body;

        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter Detail ' });
        }
        if(!isValid(email)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter email ' });
        }

        let user = await registerModel.findOne({email});
        if(!user){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! no user found with this email ' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send({status:false, msg: "inValid password" });
        }
        // this is not the right way to write secret key  we have to use it in config file, only for assignment I write it here
        let token = jwt.sign({ userId: user._id}, 'thisisSecretKey', { expiresIn: "180 min" });
        return res.status(200).send({msg:"login successfully" ,token});
    } catch (error) {
        return res.status(500).send({error:error.message});
    }
}


// ---------------------------  add new ---------------------------------------------------

const addNew = async(req,res)=>{
    try {
        let{firstName,middleName,lastName,email,password,confirmPassword,role,department} = req.body;

        let authId = req.userid;
        

        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter Detail ' });
        }
        if(!isValid(firstName)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter firstName ' });
        }
        if(!isValid(middleName)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter middleName ' });
        }
        if(!isValid(lastName)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter lastName ' });
        }
        if(!isValid(email)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter email ' });
        }
        if(!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/.test(email)){;
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter valid email ' });
        }
        let existingEmail = await registerModel.findOne({email});
        if(existingEmail){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! This email is already registerd with another account ' });
        }
        if(!isValid(password)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter password ' });
        }
        if(!isValid(confirmPassword) || password != confirmPassword){
            return res.status(400).send({ status: false, msg: 'Please confirm your password' });
        }
        if(password.length < 6 || password.length > 12){
            return res.status(400).send({ status: false, msg: 'password length must be between 6 to 12' });
        }
        if(!['Admin',"User"].includes(role)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter valid role ' });
        }
        // authorization
        let userAccess = await registerModel.findOne({_id:authId});
        
        if(userAccess.role == 'User' && role == "Admin"){
            return res.status(403).send({status:false ,msg:"You have no access to add Admin"});
        }
        if(!isValid(department)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter department ' });
        }       
        password = await bcrypt.hash(password, 10);
        let data = await registerModel.create({firstName,lastName,middleName,email,role,department,password});
        return res.status(200).send(data);
    } catch (error) {
        return res.status(500).send({error:error.message});
    }
}


// ------------------------------ get details ----------------------------------

const getDetails = async(req,res)=>{
    try {
        let query = req.query;
        let authId = req.userid;
        let userAccess = await registerModel.findOne({_id:authId});

        if(Object.keys(query).length == 0){
           if(userAccess.role == 'Admin'){
            let details =  await registerModel.find().select({password:0}) ;
            return res.status(200).send(details);
           }
           else{
            let details =  await registerModel.find({role:'User'}).select({password:0}); 
            return res.status(200).send(details);
           }
        }
        else{
            let{firstName,middleName,lastName,email,role,department} = query;
            if(!(firstName || middleName || lastName || email || role || department)){
                return res.status(400).send({ status: false, message: 'provide valid filter' });
            }
            let details = await registerModel.find(query).select({password:0});
            if(details.length == 0 ){
                return res.status(400).send({status:false ,msg:"no data found"});
            }
            return res.status(200).send(details);
        }
    } catch (error) {
        return res.status(500).send({error:error.message});
    }
}



// -------------------------------- update Data -------------------------------------------

const updateData = async(req,res)=>{
    try {
        let authId = req.userid;
        let userId = req.params.userId;
        let{firstName,middleName,lastName,email,password,role,department} = req.body;

        if(!userId){
            return res.status(400).send({ status: false, message: 'provide valid user Id' });
        }
        let findUserToUpdate = await registerModel.findOne({_id:userId});
        if(!findUserToUpdate){
            return res.status(400).send({ status: false, message: 'provide valid user Id' });
        }
         // authorization
        let updateAccess = await registerModel.findById(authId);
        if(findUserToUpdate.role == 'Admin' && updateAccess.role == 'User'){
            return res.status(403).send({status:false ,msg:"You have no access to add Admin"});
        }
        if(!(userId ,firstName || middleName || lastName || email || role || department)){
            return res.status(400).send({ status: false, message: 'provide valid field to update' });
        }
        if(password){
            return res.status(400).send({ status: false, message: 'password cannot update' });
        }
        if(!['Admin',"User"].includes(role)){
            return res.status(400).send({ status: false, msg: 'Invalid Request !! Please Enter valid role ' });
        }
       
        let updatedData = await registerModel.findByIdAndUpdate({_id:userId},req.body,{new:true});
        return res.status(200).send({ status: true, message: "successfully updates", data: updatedData });

    } catch (error) {
        return res.status(500).send({error:error.message});
    }
}

module.exports ={register,login,addNew,getDetails,updateData};