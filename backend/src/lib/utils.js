import jwt from 'jsonwebtoken';

export const generateToken = (userId,response) => {
    const {JWT_SECRET} = process.env;
    if(!JWT_SECRET){
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const token = jwt.sign({userId},JWT_SECRET,{expiresIn:'7d'});
    response.cookie('jwt',token,{
        maxAge:7*24*60*60*1000, // 7 days
        httpOnly:true, 
        sameSite:"strict", 
        secure:process.env.NODE_ENV === 'development' ? false : true,
    });
    return token;
}


//http://localhost:3000
//https://chatify-app.com