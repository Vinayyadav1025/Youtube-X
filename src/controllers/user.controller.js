import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse} from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken// Add refresh token in user object
        await user.save({ validateBeforeSave: false })// save refreshtoken in DB but it internally validate using password then using validateBeforeSave is responsible to save without validate

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generaion refresh and access token")
    }
}

const registerUser = asyncHandler( async (req,res) => {
    //Steps to register a user
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
    //console.log(username,email);

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
    //Validate with database with many fields
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    //if user already exist 
    if (existedUser) {
        throw new ApiError(409, "Username or Email already exist")
    }

    //Take file address from multer middleware 
    // ? this represent optional
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // Validate avater is uploaded or not
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Avatar and image upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);


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

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );

})

const loginUser = asyncHandler(async (req,res) => {
    //req body -> data
    // username or email based login
    // find user in DB
    // password check 
    // generate access and refresh token
    // send cookie

    const {email, username, password} = req.body;

    if(!username || !email){
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    //Check password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials");
    }
    //generate access token and refresh token 
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user_id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,// mdifiable by only server
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken, refreshToken
            },
            "User loggedIn successfully"
        )
    )


})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,// mdifiable by only server
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})
    
export {registerUser,
    loginUser,
    logoutUser
}