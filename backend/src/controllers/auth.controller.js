import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const signup = async (request, response) => {
    const {fullName, email, password} = request.body;
    try{
        if(!fullName || !email || !password){
            return response.status(400).json({message:'All fields are required'});
        }
        if(password.length < 6){
            return response.status(400).json({message:'Password must be at least 6 characters long'});
        }

        // check if email is vaid: regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return response.status(400).json({message:'Invalid email address'});
        }

        const user = await User.findOne({email});
        if(user){
            return response.status(400).json({message:'Email is already registered'});
        }
         
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            password:hashedPassword,
        });

        if(newUser){
            const savedUser = await newUser.save();
            generateToken(savedUser._id,response);
           
             response.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            });

             try{
                await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
             }catch(err){
                console.error('Error sending welcome email:', err);
             }
        }else{
            return response.status(400).json({message:'Invalid user data'});
        }


    }catch(err){
        console.error(err);
        response.status(500).send('Server Error');
    }
   
};

export const login = (req, res) => {
    res.send('Login API');
};
export const logout = (req, res) => {
    res.send('Logout API');
};
