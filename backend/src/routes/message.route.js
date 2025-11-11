import express from 'express';
import { getAllContacts, getChatPartners, getMessageByUserId, sendMessage } from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';


const router = express.Router();



//the middlewares execute in order - so requets get rate-limited first, then authentiated.
//this is actually more efficent since unaunthenticated requestsget blocked get blocked by rate limiting
// before hitting the auth middleware. 
router.use(arcjetProtection,protectRoute);

router.get("/contacts",getAllContacts);
router.get("/chats",getChatPartners);
router.get("/:id",getMessageByUserId);  
router.post('/send/:id',sendMessage);

export default router;