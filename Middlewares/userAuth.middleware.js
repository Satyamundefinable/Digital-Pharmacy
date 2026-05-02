import jwt from "jsonwebtoken"


const userAuth = async (req, res, next) => {
   try {
     const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(402).json({
        success : false,
        message : "Not authorized"
      })
    };

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN);

    if (!decodedToken) return;

    req.user = decodedToken?._id;
     next();

   } catch (error) {
    console.error(error.message)
    return res.status(500).json({
        success : false,
        message : "User id not found..",
        error
     })
   }
}

export default userAuth;