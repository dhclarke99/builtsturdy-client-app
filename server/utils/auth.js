const jwt = require('jsonwebtoken');

const secret = 'mysecretssshhhhhhh';
const expiration = '2h';

module.exports = {
  authMiddleware: function ({ req }) {
   
    // allows token to be sent via req.body, req.query, or headers
    // console.log("Incoming request headers:", req.headers);  // Debug log 1
    let token = req.body.token || req.query.token || req.headers.authorization;
    
    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      console.log("authorization recieved!")
      token = token.split(' ').pop().trim();
    }

    if (!token) {
    
      return req;
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      
      req.user = data;
    } catch {
      console.log('Invalid token');
    }

    return req;
  },
  adminMiddleware: function (req, res, next) {
   
 
    if (req.user && req.user.role === 'Admin') {
      next();
    } else {
      res.status(403).json({ message: 'You are not authorized to access this resource.' });
    }
  },
  signToken: function ({ email, username, _id, role}) {
    const payload = { email, username, _id, role};
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
