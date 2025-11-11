import express from 'express';
import { login, logout, signup, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();

router.get("/test", arcjetProtection, (req,res) => {
    res.send("Auth route is working");
});

router.post('/signup', arcjetProtection, signup);
router.post('/login', arcjetProtection, login);
router.post('/logout', logout);


router.put('/update-profile',protectRoute,updateProfile);

router.get("/check",protectRoute,(req,res) => {
    res.status(200).json({message:"Authorized",user:req.user});
});

export default router;
