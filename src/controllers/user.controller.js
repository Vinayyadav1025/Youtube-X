import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse} from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken// Add refresh token in user object
        await user.save({ validateBeforeSave: false })// save refreshtoken in DB but it internally validate using password then using validateBeforeSave is responsible to save without validate

        return {accessToken, refreshToken}
    } catch (error) {
        console.log(error);
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

    if(!username && !email){
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
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,// modifiable by only server
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
    

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401, "invalid refresh token");
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const { accessToken, newRefreshToken }= await generateAccessAndRefreshToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken" , accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid Old Password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(200, req.user, "current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName: fullName,
            email: email
        }
    }, {new: true})
    .select("-password")// Remove password from user

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))

})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is Missing");
    }

    const avatar = await  uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error whhile uploading on avatar");
    }

    const user = await User.findByIdandUpdate(req.user?._id, 
        {
            $set: {
                avatar : avatar.url
            }
        },
        {
            new: true
        }).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover Image file is Missing");
    }

    const coverImage = await  uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error whhile uploading on cover image");
    }

    const user = await User.findByIdandUpdate(req.user?._id, 
        {
            $set: {
                coverImage : coverImage.url
            }
        },
        {
            new: true
        }).select("-password")

    
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"))
})

export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}