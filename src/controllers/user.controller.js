import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler( async (req,res) => {
    // Get user detail from frontend
    // Validation - not empty
    // check if user already exists : username and email
    // check for images , check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entery in DB
    // remove password and refresh token field form response
    // check for user creation 
    // return response

    const {username, email, fullName, password} = req.body;
    console.log(username,email);

    //Beginers way to check validation in many filds using if else if else etc.
    // if (fullName == "") {
    //     throw new ApiError (400, "fullname is required");
    // }

    //Professional way to check valildation with many fileds

    if (
        [username, email, fullName, password].some((field) => 
            field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "App fields are required")
    }
    //Valide with database with many fields
    const existedUser = User.findOn({
        $or: [{ username }, { email }]
    })

    //if user already exist 
    if (existedUser) {
        throw new ApiError(409, "Username or Email already exist")
    }

    //Take file address from multer middleware 
    // ? this represent optional
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // Validate avater is uploaded or not
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Avatar and image upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await auploadOnCloudinary(coverImageLocalPath);


    //Check avater is moved on cloudinary or not
    if(!avatar){
        throw new ApiError(400, "Avatar file is not uploded");
    }

    //Uplode entity in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url ||  "",
        email,
        password,
        username: username.toLowerCase()
    })
    // Check user is created successfully or not and remove password and refresh token from response because we not need to tell ayone this field
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //if createUser not success
    if (!createdUser) {
        throw new ApiError(500, "Someting went wrong registring a user");
    }

    return res.status(201).json(ApiResponse(200, createdUser, "user registered successfully"));

})

export {registerUser}