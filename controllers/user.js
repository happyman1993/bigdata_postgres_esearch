var moment = require('moment');
var uuidv4 = require('uuid/v4');
var Helper = require('./Helper');

var global = require("../services/global");
require('dotenv').config();

module.exports = {
  /**
   * Create A User
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async create(req, res) {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({'message': 'Some values are missing'});
    }
    if (!Helper.isValidEmail(req.body.email)) {
      return res.status(400).send({ 'message': 'Please enter a valid email address' });
    }
    const hashPassword = Helper.hashPassword(req.body.password);
    
    let createQuery = ''
    if(req.body.id)
      createQuery = `update users set email='${req.body.email}', password='${hashPassword}', company_id=${req.body.company_id},
                      user_role='${req.body.user_role}', last_update=now()
                      where id='${req.body.id}' returning *`;
    else
      createQuery = `INSERT INTO
        users(id, email, password, create_at, last_update, company_id, user_role)
        VALUES('${uuidv4()}', '${req.body.email}', '${hashPassword}', now(), now(), ${req.body.company_id}, '${req.body.user_role}')
        returning *`;
    // const values = [
    //   uuidv4(),
    //   req.body.email,
    //   hashPassword,
    //   moment(new Date()),
    //   moment(new Date()),
    //   req.body.company_id
    // ];

    try {
      const { rows } = await global.query(createQuery);
      const token = Helper.generateToken(rows[0].id);
      return res.status(201).send({ token: token, data:rows });
    } catch(error) {
      console.log(createQuery);
      if (error.routine === '_bt_check_unique') {
        return res.status(401).send({ 'message': 'User with that EMAIL already exist' })
      }
      return res.status(400).send(error);
    }
  },
  /**
   * Login
   * @param {object} req 
   * @param {object} res
   * @returns {object} user object 
   */
  async login(req, res) {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({'message': 'Some values are missing'});
    }
    if (!Helper.isValidEmail(req.body.email)) {
      return res.status(400).send({ 'message': 'Please enter a valid email address' });
    }
    
    // console.log(process.env.MASTER_EMAIL);
    // console.log(process.env.MASTER_PASSWORD);
    // console.log(req.body.email);
    // console.log(req.body.password);
    if(req.body.email == process.env.MASTER_EMAIL && req.body.password==process.env.MASTER_PASSWORD){
      const token = Helper.generateToken(123123);
      return res.status(200).send({ token });
    }
    const text = `SELECT * FROM users WHERE email = '${req.body.email}'`;
    try {
      const { rows } = await global.query(text);
      if (!rows[0]) {
        return res.status(400).send({'message': 'Your email is not registered'});
      }
      if(!Helper.comparePassword(rows[0].password, req.body.password)) {
        return res.status(400).send({ 'message': 'Password is incorrect' });
      }
      const token = Helper.generateToken(rows[0].id);
      return res.status(200).send({ 'token': token, 'data':rows[0]});
    } catch(error) {
      console.log(text);
      return res.status(400).send(error)
    }
  },
  /**
   * Delete A User
   * @param {object} req 
   * @param {object} res 
   * @returns {void} return status code 204 
   */
  async delete(req, res) {
    const deleteQuery = `DELETE FROM users WHERE id=${req.params.id} returning *`;
    try {
      const { rows } = await global.query(deleteQuery);
      if(!rows[0]) {
        return res.status(404).send({'message': 'account not found'});
      }
      return res.status(204).send({ 'message': 'deleted' });
    } catch(error) {
      return res.status(400).send(error);
    }
  },
  /**
   * Update Password
   * @param {object} req 
   * @param {object} res 
   * @returns {void} return status code 204 
   */
  async updatePassword(req, res) {
    const query = `Update users set password='${req.body.password}' WHERE id='${req.body.id}' returning *`;
    try {
      const { rows } = await global.query(query);
      if(!rows[0]) {
        return res.status(404).send({'message': 'account not found'});
      }
      return res.status(204).send({ 'message': 'password changed' });
    } catch(error) {
      console.log(query);
      return res.status(400).send(error);
    }
  },
    /**
   * Account List
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async getList(req, res) {

    const query = `select id, email, password, user_role, company_id, COALESCE(to_char(last_update, 'MM-DD-YYYY HH24:MI'), '') AS last_update,
                                COALESCE(to_char(create_at, 'MM-DD-YYYY HH24:MI'), '') AS create_at 
                  from users where company_id=${req.query.company_id} and user_role!='1'`;
    try {
      const { rows } = await global.query(query);
      return res.status(200).send({ "data":rows });
    } catch(error) {
      console.log(query);
      return res.status(400).send(error);
    }
  },

  /**
   * Update Monitor Server/Game List
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async updateMonitorServers_Games(req, res) {
    let column_name = req.body.type=='server' ? 'server_ids':'game_ids';
    let query = `update users set ${column_name}='${req.body.server_ids}', last_update=now()
                      where id='${req.body.id}'`;

    try {
      const { rows } = await global.query(query);
      return res.status(200).send({ "data":"updated" });
    } catch(error) {
      console.log(query);
      return res.status(400).send(error);
    }
  },

  /**
   * Set Monitor Server/Game List
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async updateMonitorServers_Games(req, res) {
    let column_name = req.body.type=='server' ? 'server_ids':'game_ids';
    let query = `update users set ${column_name}='${req.body.ids}', last_update=now()
                      where id='${req.body.id}'`;

    try {
      const { rows } = await global.query(query);
      return res.status(200).send({ "data":"updated" });
    } catch(error) {
      console.log(query);
      return res.status(400).send(error);
    }
  },
  /**
   * Get Monitor Server/Game List
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async getMonitorServers_Games(req, res) {
    let column_name = req.body.type=='server' ? 'server_ids':'game_ids';
    let query = `update users set ${column_name}='${req.body.ids}', last_update=now()
                      where id='${req.body.id}'`;
//select * from game_info where id = any(string_to_array( 
  // (select game_ids from users where id='b5cb4ad7-1721-40a5-9fb1-8dacdff42147'), ',' )::int[])
    try {
      const { rows } = await global.query(query);
      return res.status(200).send({ "data":rows });
    } catch(error) {
      console.log(query);
      return res.status(400).send(error);
    }
  }
  
}