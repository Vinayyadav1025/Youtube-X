import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";; 
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")// Access token from frontend and set empty string for logout
        
        if(!token){
            throw new ApiError(401, "Unauthoized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select
        ("-password -refreshToken")
    
        if (!user) {
            // TODO: Discuss about frontend
            throw new ApiError(401, "Invalid Acess token")
        }
    
        req.user = user;
    
        next();
    } catch (error) {
        throw new ApiError(401, "error?.message" || "Invalid access token")
    }

})