import {Router} from 'express';
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js';
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = Router()

router.route("/register").post(
    //Inject middleware before run register user file 
    //middlerware validate user file input filed using multer libraray
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)


//Secured Routes
router.route("/logout").post(verifyJWT, logoutUser)
export default router