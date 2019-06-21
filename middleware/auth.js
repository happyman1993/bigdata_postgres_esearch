var jwt = require('jsonwebtoken');
var global = require("../services/global");

module.exports = {
  /**
   * Verify Token
   * @param {object} req 
   * @param {object} res 
   * @param {object} next
   * @returns {object|void} response object 
   */
  async verifyToken(req, res, next) {
    // console.log('verifyToken', req.password);
    const token = req.headers['x-access-token'];
    if(!token) {
      return res.status(400).send({ 'message': 'Token is not provided' });
    }
    try {
      const decoded = await jwt.verify(token, process.env.SECRET);
      const text = `SELECT * FROM users WHERE id = '${decoded.userId}'`;
      const { rows } = await global.query(text);
      if(!rows[0]) {
        return res.status(400).send({ 'message': 'The token you provided is invalid' });
      }
      req.body.user = rows[0];
      next();
    } catch(error) {
      return res.status(400).send(error);
    }
  }
}

// export default Auth;