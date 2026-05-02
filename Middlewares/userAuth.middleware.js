import jwt from "jsonwebtoken"


const userAuth = async (req, res, next) => {
   try {
     const token = req.cookies?.refreshToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success : false,
        message : "Not authorized"
      })
    };

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);

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