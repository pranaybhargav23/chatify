import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

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

export const login = async (request, response) => {
    const {email, password} = request.body;
     
    if(!email || !password){
        return response.status(400).json({message:'email and password are required'});
    }
    try{
        const user = await User.findOne({email});
        if(!user){
            return response.status(400).json({message:'user not found'});
        }
        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        
        if(!isPasswordCorrect){
            return response.status(400).json({message:'Invalid crendentials'});
        }
        generateToken(user._id,response);

        response.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
        });

    }catch(err){
        console.error(err);
        response.status(500).json({message:'Server Error'});
    }
   
        
  
};

export const logout = (_, response) => {
   response.cookie('jwt','',{
        maxAge:0,
   });
   response.status(200).json({message:'Logged out successfully'});
};


export const updateProfile = async (request, response) => {
   try{
    const {profilePic} = request.body;
     if(!profilePic){
        return response.status(400).json({message:'Profile picture is required'});
     }
     const userId = request.user._id;

     const uploadResponse = await cloudinary.uploader.upload(profilePic);

     const updatedUser = await User.findByIdAndUpdate(userId,{
        profilePic:uploadResponse.secure_url,
     },{ new:true});

        response.status(200).json(updatedUser);

    }catch(err){
        console.error(err);
        response.status(500).json({message:'Server Error'});
    }
};


