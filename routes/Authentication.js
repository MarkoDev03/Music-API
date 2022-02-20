import express from "express"
import { SignIn, SignUp, WhoIAm, RequestEmailVerification, VerifyRegistrationCode, ChangePassword, RequestForgotPasswordEmail, ForgotPassword, DeleteUser, 
ChangeUsername, ChangeAvatar, ListUsers, DeleteMultipleUsers } 
from "../controllers/AuthenticationController.js"

const Router = express.Router()

Router.get("/list-users", ListUsers)

Router.post("/sign-in", SignIn)
Router.post("/sign-up", SignUp)
Router.post("/who-i-am", WhoIAm)
Router.post("/request-email-verification", RequestEmailVerification)
Router.post("/request-forgot-password-email", RequestForgotPasswordEmail)

Router.put("/forgot-password", ForgotPassword)
Router.put("/change-username", ChangeUsername)
Router.put("/change-avatar", ChangeAvatar)
Router.put("/verify-registration-code", VerifyRegistrationCode)
Router.put("/change-password", ChangePassword)

Router.delete("/delete-user", DeleteUser)
Router.delete("/delete-multiple-users", DeleteMultipleUsers)

export default Router