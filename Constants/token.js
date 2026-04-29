import jwt from "jsonwebtoken"

const options = {
    httpOnly : true,
    secure : true
}
export const generateAccessToken = (userId) => {
    return jwt.sign({_id : userId }, process.env.ACCESS_TOKEN, {expiresIn : "1m"});
}

export const generateRefreshToken = (userId) => {
    return jwt.sign({_id : userId }, process.env.REFRESH_TOKEN, {expiresIn : "30m"});
}