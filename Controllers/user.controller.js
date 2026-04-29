import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import user from "../Models/user.model.js";
import transporter from "../Configs/nodemailer.config.js";
import { generateAccessToken, generateRefreshToken } from "../Constants/token.js";
// import user from "../Models/user.model.js";

const register = async (req, res) => {
   const { name, email, password } = req.body;
   if ([name, email, password].some((field) => !field || field === "")) {
      return res.status(400).json({
         success: false,
         message: "Please fill all required fields.."
      })
   }

   try {
      const existinguser = await user.findOne({ email });

      if (existinguser) {
         return res.status(401).json({
            success: false,
            message: "Account is already registered",
         })
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const hashedPassword = await bcrypt.hash(password, 8);

      const otpExpiryTime = Date.now() + 5 * 60 * 1000;

      const newUser = await user.create({
         name,
         email,
         password: hashedPassword,
         otp: otp,
         otpExpiryTime: otpExpiryTime
      });




      // const token = jwt.sign({
      //    userId: newUser._id
      // },
      //    process.env.REFRESH_TOKEN,
      //    {
      //       expiresIn: "10m"
      //    });


      const refreshToken = generateRefreshToken(newUser._id)
      const accessToken = generateAccessToken(newUser._id)

      const mailHtmltemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OTP Verification</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">

  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr>
      <td align="center">

        <table width="500px" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h2 style="margin:0; color:#333;">🔐 OTP Verification</h2>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="color:#555; font-size:16px; text-align:center;">
              <p>Your One-Time Password (OTP) is:</p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding:20px 0;">
              <div style="
                display:inline-block;
                background:#f1f5ff;
                color:#2b6cb0;
                font-size:28px;
                letter-spacing:5px;
                padding:15px 25px;
                border-radius:8px;
                font-weight:bold;
              ">
                ${otp}
              </div>
            </td>
          </tr>

          <!-- Expiry -->
          <tr>
            <td style="color:#777; font-size:14px; text-align:center;">
              <p>This OTP is valid for <strong>5 minutes</strong>.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:20px; font-size:12px; color:#aaa;">
              <p>© 2026 Your Company. All rights reserved.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`


      const mailOptions = {
         from: process.env.SMTP_SENDER_EMAIL,
         to: email,
         subject: "Verification OTP",
         html: mailHtmltemplate
      }

      await transporter.sendMail(mailOptions);

      res.cookie("refreshToken", refreshToken, {
         httpOnly: true,
         sameSite: "Lax",
         secure: false,
         maxAge: 1 * 10 * 60 * 1000
      });

      return res.status(201).json({
         success: true,
         message: "User registered successfuly",
         accessToken: accessToken
      })


   } catch (error) {

      return res.status(502).json({
         success: false,
         message: "Something went wrong...",
         error
      })

   }
}


const login = async (req, res) => {
   const { email, password } = req.body;

   if ([email, password].some((field) => !field || field === "")) {
      return res.status(400).json({
         success: false,
         message: "Please fill all required fields.."
      })
   }

   try {

      const isExistingUser = await user.findOne({ email });

      if (!isExistingUser) {
         return res.status(401).json({
            success: false,
            message: "No User Found"
         })
      };

      const isPasswordMatch = await bcrypt.compare(password, isExistingUser.password);

      if (!isPasswordMatch) {
         {
            return res.status(401).json({
               success: false,
               message: "Wrong password "
            })
         };
      }

      const accessToken = generateAccessToken(isExistingUser._id);
      const refreshToken = generateRefreshToken(isExistingUser._id);

      // const jwtToken = jwt.sign({
      //    _id: isExistingUser._id,
      //    email: email
      // }, process.env.JWT_SECRET_KEY, {
      //    expiresIn: "10m",
      // })

      res.cookie("refreshToken", refreshToken, {
         httpOnly: true,
         secure: false,
         sameSite: "Lax",
         maxAge: 1 * 10 * 60 * 1000
      })

      return res.status(200).json({
         success: true,
         message: "User logged in successfully..",
         user: isExistingUser.name,
         isAuthenticated: true,
         accessToken: accessToken
      })


   } catch (error) {

      return res.status(500).json({
         success: false,
         message: "Something went wrong while logging in..",
         error: error.message
      })

   }

}



const getUser = async (req, res) => {
   try {
      const authHeader = req.headers.authorization;
      console.log("HEADER:", req.headers.authorization);

      if (!authHeader) {
         return res.status(401).json({
            success: false,
            message: "No authorized"
         })
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
         return res.status(401).json({
            success: false,
            message: "No token found"
         })
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

      if (!decoded) {
         return res.status(401).json({
            success: false,
            message: "No Authorized"
         });
      };

      const User = await user.findById(decoded._id)

      if (!User) {
         return res.status(401).json({
            success: false,
            message: "No user found"
         });
      };

      return res.status(200).json({
         user: User.name,
         success: true
      })
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message
      })
   }


}



const refreshAccessToken = async (req, res) => {
   const refreshToken = req.cookies.refreshToken;
   console.log("COOKIE:", req.cookies);
   if (!refreshToken) {
      return res.status(401).json({
         success: false,
         message: "No refresh token"
      });
   };

   const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
   if (!decoded) {
      return res.status(401).json({
         success: false,
         message: "No Decoded token"
      });
   };

   const User = await user.findById(decoded?._id);

   if (!User) {
      return res.status(401).json({
         success: false,
         message: "No user found"
      });
   };

   const newAccessToken = generateAccessToken(User._id);

   return res.status(200).json({
      accessToken: newAccessToken
   })

}


const logOut = async (req, res) => {
   const userId = req.user;

   if (!userId) {
      return res.status(401).json({
         success: false,
         message: "user not found"
      })
   };

   try {

      const isUser = await user.findById(userId);

      if (!isUser) {
         return res.status(401).json({
            success: false,
            message: "Not Authorized"
         })
      };

      res.clearCookie("refreshToken", {
         httpOnly: true,
         secure: true,
      })

      return res.status(200).json({
         success: true,
         message: "User Logged Out Successfully"
      })

   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "unable to log out..",
         error
      })
   }
}




const resetPassword = async (req, res) => {
   const { email } = req.body;

   if (!email || email.trim() === "") {
      res.status(402).json({
         success: false,
         message: "Please enter valid credentials"
      })
   }

   try {

      const isUser = await user.findOne({ email });

      if (!isUser) {
         res.status(401).json({
            success: false,
            message: "No user exist with this email",
         });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const otpExpiryTime = Date.now() + 5 * 60 * 1000;

      const mailHtmltemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OTP Verification</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">

  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr>
      <td align="center">

        <table width="500px" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <h2 style="margin:0; color:#333;">🔐 OTP Verification</h2>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="color:#555; font-size:16px; text-align:center;">
              <p>Your One-Time Password (OTP) is:</p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding:20px 0;">
              <div style="
                display:inline-block;
                background:#f1f5ff;
                color:#2b6cb0;
                font-size:28px;
                letter-spacing:5px;
                padding:15px 25px;
                border-radius:8px;
                font-weight:bold;
              ">
                ${otp}
              </div>
            </td>
          </tr>

          <!-- Expiry -->
          <tr>
            <td style="color:#777; font-size:14px; text-align:center;">
              <p>This OTP is valid for <strong>5 minutes</strong>.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:20px; font-size:12px; color:#aaa;">
              <p>© 2026 Your Company. All rights reserved.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`

      const mailOptions = {
         from: process.env.SMTP_SENDER_EMAIL,
         to: email,
         subject: "Verification OTP",
         html: mailHtmltemplate
      }

      


     await transporter.sendMail(mailOptions)


      isUser.otp = otp;
      isUser.otpExpiryTime = otpExpiryTime;
      await isUser.save();

      return res.status(201).json({
         success: true,
         message: "Verification OTP sent successfully",
         userId: isUser._id
      });


   } catch (error) {

      return res.status(500).json({
         success: false,
         message: error.message
      })

   }
}


const verifyResetPasswordOtp = async (req, res) => {
   const { otp, userId } = req.body;

   if ([otp, userId].some(field => !field || field.trim() === "")) {
      return res.status(400).json({
         success: false,
         message: "All fields are mandatory"
      })
   }


   try {
      const isUser = await user.findById(userId);

      if (!isUser) {
         return res.status(402).json({
            success: false,
            message: "User not authorized"
         })
      }

      if (isUser.otp !== otp) {
         return res.status(401).json({
            success: false,
            message: "Incorrect Otp"
         })
      }

      if (isUser.otpExpiryTime < Date.now()) {
         return res.status(401).json({
            success: false,
            message: "Otp Expired"
         })
      }


      isUser.otp = "";
      isUser.save();

      return res.status(200).json({
         success: true,
         message: "Otp verified successfully"
      })


   } catch (error) {

   }

}


const createNewPassword = async (req, res) => {
   const { newPassword, userId } = req.body;

   if ([newPassword, userId].some(field => !field || field === "")) {
      return res.status(400).json({
         success: false,
         message: "All fields are mandatory"
      })
   }

   try {
      const isUser = await user.findById(userId);

      if (!isUser) {
         return res.status(400).status({
            success: false,
            message: "user not authorized"
         })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 8);

      isUser.password = hashedPassword;
      isUser.save();

      return res.status(200).json({
         success: true,
         message: "Password changed successfully"
      })
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message
      })
   }

}



const verifyOtp = async (req, res) => {
   try {

      const { otp } = req.body;

      const userId = req.user;

      // const token = req.cookies.token;

      if (!otp || otp.trim() === "") {
         return res.status(402).json({
            success: false,
            message: "Please enter valid OTP !!"
         })
      }

      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Not authorized"
         })
      }

      const isUser = await user.findById(userId);

      if (!isUser) {
         res.status(403).json({
            success: false,
            message: "User not found"
         })
      }

      if (isUser.otpExpiryTime < Date.now()) {
         res.status(402).json({
            success: false,
            message: "Otp Expired.."
         })
      }

      if (isUser.otp !== otp.trim()) {
         res.status(401).json({
            success: false,
            message: "Invalid OTP"
         })
      }

      isUser.otp = "";
      isUser.otpExpiryTime = null;
      isUser.isVerified = true;

      await isUser.save()

      return res.status(201).json({
         success: true,
         message: "Otp Verified Successfully"
      })
   } catch (error) {

      return res.status(201).json({
         success: false,
         message: error.message
      })
   }


}



const resendOtp = async (req, res) => {
   const userId = req.user;

   if (!userId) {
      return res.status(401).json({
         success: false,
         message: "Something went wrong try again"
      })
   }

   try {
      const User = await user.findById(userId);

      if (!User) {
         return res.status(401).json({
            success: false,
            message: "try again later"
         })
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiryTime = Date.now() + 5 * 60 * 1000;
      const email = User.email
      User.otp = otp;
      User.otpExpiryTime = otpExpiryTime

      await User.save();

      const mailHtmltemplate = `<!DOCTYPE html>
 <html>
 <head>
   <meta charset="UTF-8">
   <title>OTP Verification</title>
 </head>
 <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
 
   <table align="center" width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
     <tr>
       <td align="center">
 
         <table width="500px" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
 
           <!-- Header -->
           <tr>
             <td align="center" style="padding-bottom:20px;">
               <h2 style="margin:0; color:#333;">🔐 OTP Verification</h2>
             </td>
           </tr>
 
           <!-- Message -->
           <tr>
             <td style="color:#555; font-size:16px; text-align:center;">
               <p>Your One-Time Password (OTP) is:</p>
             </td>
           </tr>
 
           <!-- OTP Box -->
           <tr>
             <td align="center" style="padding:20px 0;">
               <div style="
                 display:inline-block;
                 background:#f1f5ff;
                 color:#2b6cb0;
                 font-size:28px;
                 letter-spacing:5px;
                 padding:15px 25px;
                 border-radius:8px;
                 font-weight:bold;
               ">
                 ${otp}
               </div>
             </td>
           </tr>
 
           <!-- Expiry -->
           <tr>
             <td style="color:#777; font-size:14px; text-align:center;">
               <p>This OTP is valid for <strong>5 minutes</strong>.</p>
               <p>If you didn't request this, please ignore this email.</p>
             </td>
           </tr>
 
           <!-- Footer -->
           <tr>
             <td align="center" style="padding-top:20px; font-size:12px; color:#aaa;">
               <p>© 2026 Your Company. All rights reserved.</p>
             </td>
           </tr>
 
         </table>
 
       </td>
     </tr>
   </table>
 
 </body>
 </html>`


      const mailOptions = {
         from: process.env.SMTP_SENDER_EMAIL,
         to: email,
         subject: "Verification OTP",
         html: mailHtmltemplate
      }

      await transporter.sendMail(mailOptions);

      return res.status(200).json({
         success: true,
         message: "Otp Sent Successfully"
      })

   } catch (error) {
      return res.status(400).json({
         success: false,
         message: error.message
      })
   }
}




export {
   register,
   login,
   logOut,
   resetPassword,
   refreshAccessToken,
   getUser,
   resendOtp,
   verifyOtp,
   verifyResetPasswordOtp,
   createNewPassword,
}