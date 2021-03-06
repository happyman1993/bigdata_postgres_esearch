var moment = require('moment');
var uuidv4 = require('uuid/v4');
var Helper = require('./helper');

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
    // if(req.body.email == process.env.MASTER_EMAIL && req.body.password==process.env.MASTER_PASSWORD){
    //   const token = Helper.generateToken(123123);
    //   return res.status(200).send({ 'token': token, 'data':{company_id:'0', user_role:'0'} });
    // }
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
  async updateUserinfo(req, res) {
    const query = `Update users set ${req.body.fieldname}='${req.body.value}' WHERE id='${req.body.user.id}' returning *`;
    try {
      const { rows } = await global.query(query);
      if(!rows[0]) {
        return res.status(404).send({'message': 'account not found'});
      }
      return res.status(204).send({ 'message': 'user info changed' });
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
                  from users where company_id=${req.body.user.company_id} and user_role!='1' and user_role!='0'`;
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
    let query='';
    if(req.body.action=='add'){
      query = `insert into monitor_server_game (user_id, server_game_id, type) 
              values('${req.body.user.id}', ${req.body.item_id}, '${req.body.type}')`;
    }
    else if(req.body.action=='delete'){
      query = `delete from monitor_server_game where user_id='${req.body.user.id}' and server_game_id=${req.body.item_id} and type='${req.body.type}'`
    }

    try {
      const { rows } = await global.query(query);
      return res.status(200).send({ "data": "updated" });
    } catch(error) {
      console.log(query);
      return res.status(400).send(error);
    }
  },
  /**
   * Update game info (ip, port)
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async update_gameinfo(req, res) {
    const  query = `update game_info_server set ip='${req.body.gameinfo.ip}', port='${req.body.gameinfo.port}', name='${req.body.gameinfo.name}', protocol='${req.body.gameinfo.protocol}'
                where id=${req.body.gameinfo.id}`;
    try {
      const { rows } = await global.query(query);
      return res.status(200).send({ "result": "updated" });
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
    let query_monitor_list=''
    let query_Items=''
    if(req.query.type=='server'){
      query_monitor_list = `select id, name, ip, port_tcp port from server_info where 
                          id in (select server_game_id from monitor_server_game where user_id='${req.body.user.id}' and type='server')`;
      query_Items = `select id, name, ip, port_tcp port from server_info where 
                          not (id in (select server_game_id from monitor_server_game where user_id='${req.body.user.id}' and type='server'))`;
    }
    else{ // == game
      var company_id = req.body.user.company_id!='0' ? (" a.company_id=" + req.body.user.company_id + " and ") : "";
      query_monitor_list = `select a.id, b.name gamename, ip, port, a.protocol, a.name from game_info_server a left join game_info b on a.game_id=b.id where 
                      ${company_id} (a.id in (select server_game_id from monitor_server_game where user_id='${req.body.user.id}' and type='game'))`;
      // query_Items = `select a.id, b.name gamename, ip, port, a.protocol, a.name from game_info_server a left join game_info b on a.game_id=b.id where 
      //                 ${company_id} not (a.id in (select server_game_id from monitor_server_game where user_id='${req.body.user.id}' and type='game'))`;
    }
  //select * from game_info where id = any(string_to_array( 
    // (select game_ids from users where id='b5cb4ad7-1721-40a5-9fb1-8dacdff42147'), ',' )::int[])

    let rows_monitor
    console.log(query_monitor_list);
    try {
      const { rows } = await global.query(query_monitor_list);
      rows_monitor = rows;
    } catch(error) {
      console.log(query_monitor_list);
      return res.status(400).send(error);
    }
    try {
      const { rows } = await global.query(query_Items);
      return res.status(200).send({ 'monitors':rows_monitor, 'items': rows});
    } catch(error) {
      console.log(query_Items);
      return res.status(400).send(error);
    }
  },


  /**
   * Get Monitor Server/Game List
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async getGames(req, res) {
    let query_Items = `select id, name from game_info where name is not null and name != '' order by name`;

    try {
      const { rows } = await global.query(query_Items);
      return res.status(200).send({ 'items':rows });
    } catch(error) {
      console.log(query_Items);
      return res.status(400).send(error);
    }
  },


  /**
   * Get Process Names for a game
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async getProcessNames(req, res) {
    var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";

    let query_Items = `select process_id, b."name"
                        from 
                          (select process_id from game_info_server where game_id=${req.query.game_id} ${company_id} group by process_id) a
                        left join
                          process_info b
                        on a.process_id=b.id`;

    try {
      const { rows } = await global.query(query_Items);
      return res.status(200).send({ 'items':rows });
    } catch(error) {
      console.log(query_Items);
      return res.status(400).send(error);
    }
  },

    /**
   * Get IPs of Process
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async getInfosOfGameProcess(req, res) {
    var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";

    // let query_Items = `select * from game_info_server where game_id=${req.query.game_id} and process_id=game_id=${req.query.game_id} ${company_id}`;

      query_Items = `select a.id, b.name gamename, ip, port, a.protocol, a.name 
                      from game_info_server a 
                      left join game_info b 
                      on a.game_id=b.id 
                      where 
                        game_id=${req.query.game_id} and process_id=${req.query.process_id} 
                        and not (
                            a.id in (select server_game_id from monitor_server_game where user_id='${req.body.user.id}' and type='game')
                          )
                        ${company_id} `;

    try {
      const { rows } = await global.query(query_Items);
      return res.status(200).send({ 'items':rows });
    } catch(error) {
      console.log(query_Items);
      return res.status(400).send(error);
    }
  }
  
}