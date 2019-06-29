var moment = require('moment');
var uuidv4 = require('uuid/v4');
var Helper = require('./helper');

var global = require("../services/global");

module.exports = {
  /**
   * Server List
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async getList(req, res) {

    const query = `select a.id, name, isp, ip, port_tcp, port_udp, country, state, city, network_speed, ram_available,
                   number_cores, projection, birthday, server_price, COALESCE(to_char(a.last_update, 'MM-DD-YYYY HH24:MI'), '') AS last_update 
                   from server_info a`;
    
    try {
      const { rows } = await global.query(query);
      return res.status(200).send({ "data":rows });
    } catch(error) {
      return res.status(400).send(error);
    }
  },

  /**
   * Add A Server
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async add(req, res) {
    let query = "";
    if(req.body.id == 0){
      query = `INSERT INTO server_info(name, isp, ip, port_tcp, port_udp, country, state, city, network_speed, ram_available,
                number_cores, projection, birthday, server_price, last_update)
        VALUES('${req.body.name}', '${req.body.isp}', '${req.body.ip}', '${req.body.port_tcp}', '${req.body.port_udp}', '${req.body.country}', '${req.body.state}', 
              '${req.body.city}', '${req.body.network_speed}', '${req.body.ram_available}', '${req.body.number_cores}', '${req.body.projection}', '${req.body.birthday}',
              '${req.body.server_price}', NOW())
        returning *`;
    }
    else{
      query = `update server_info  
                        set name='${req.body.name}', isp='${req.body.isp}', ip='${req.body.ip}', port_tcp='${req.body.port_tcp}', port_udp='${req.body.port_udp}',
                         country='${req.body.country}', state='${req.body.state}', city='${req.body.city}', network_speed='${req.body.network_speed}',
                         ram_available='${req.body.ram_available}', number_cores='${req.body.number_cores}', projection='${req.body.projection}',
                         birthday='${req.body.birthday}',server_price='${req.body.server_price}', last_update=NOW()
                        where id=${req.body.id} returning *`;
    }
    console.log(query)
    try {
      const { rows } = await global.query(query);
      return res.status(200).send({ "data":rows });
    } catch(error) {
      console.log(query);
      console.log(error);
      return res.status(400).send(error);
    }

  },
  /**
   * Delete A Server
   * @param {object} req 
   * @param {object} res 
   * @returns {void} return status code 204 
   */
  async delete(req, res) {
    console.log(req.query.ids);
    const deleteQuery = `DELETE FROM server_info WHERE id in (${req.query.ids}) returning *;`;
    try {
      const { rows } = await global.query(deleteQuery);
      if(!rows[0]) {
        return res.status(404).send({'message': 'server not found'});
      }
      return res.status(204).send({ 'message': 'deleted' });
    } catch(error) {
      return res.status(400).send(error);
    }
  }
}