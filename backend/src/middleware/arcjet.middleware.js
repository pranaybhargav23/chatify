import aj from "../lib/arcjet.js";
import {isSpoofedBot} from "@arcjet/inspect";

export const arcjetProtection = async (request, response, next) => {
    try{
        const decision = await aj.protect(request); 
        
        // Log for debugging
        console.log(`Arcjet decision for ${request.method} ${request.path}:`, {
            isDenied: decision.isDenied(),
            reason: decision.reason,
            ip: request.ip || request.connection.remoteAddress
        });

        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                return response.status(429).json({
                    message:'Too many requests. Please try again later.',
                    retryAfter: decision.reason.resetTime
                });
             
        }else if(decision.reason.isBot()){
         return response.status(403).json({message:'Access denied. Bot traffic is not allowed.'});
        }else{
            return response.status(403).json({message:'Access denied by security policy.'});
        }
        }

        //check for spoofed bots
        if(decision.results.some(isSpoofedBot)){
            return response.status(403).json({error:"Spoofed bot detected",message:'Access denied. Spoofed bot traffic is not allowed.'});
        }

        next();
    }catch(err){
        console.error('Arcjet middleware error:', err);
        return response.status(500).json({message:'Internal Server Error'});
    }
}