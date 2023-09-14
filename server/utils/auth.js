const jwt = require('jsonwebtoken');
const User = require('../models/user');
const secret = 'mysecretssshhhhhhh';
const expiration = '2h';

module.exports = {
  authMiddleware: async function ({ req }) {
    console.log("Inside AuthMiddleware")
    let token = req.body.token || req.query.token || req.headers.authorization;
    console.log("Token:", token);

    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }
    console.log("Parsed Token:", token);
    if (!token) {
      return req;
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      console.log("Verified JWT Data:", data);
    
      // Fetch additional user info from database
      const userInfo = await User.findById(data._id);
      if (userInfo) {
        req.user = {
          ...data,
          role: userInfo.role // assuming 'role' is the field name in your User schema
        };
      }
    
      console.log("Updated req.user:", req.user);
    } catch {
      console.log('Invalid token');
    }
    if (req.user && req.user.role === 'Admin') {
      console.log("User is Admin");
      // next();
    } else {
      console.log("User is not admin or not authenticated");
     
    }
    console.log("Headers:", req.headers);

    return req;
  },
  adminMiddleware: function (req, res, next) {
    console.log("req is:", req)
 
    if (req.user && req.user.role === 'Admin') {
      next();
    } else {
      res.status(403).json({ message: 'You are not authorized to access this resource.' });
    }
  },
  signToken: function ({ email, username, _id}) {
    const payload = { email, username, _id};
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
