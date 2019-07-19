var moment = require('moment');
var uuidv4 = require('uuid/v4');
var Helper = require('./helper');

var global = require("../services/global");

module.exports = {
  /**
   * Alert list from Master to admin panel
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async getList(req, res) {
    let last_id = 0;
    let query1 = `select last_alert_id from users where id='${req.body.user.id}'`;
    try {
      const { rows, rowCount } = await global.query(query1);
      if(rowCount>0){
        last_id = rows[0].last_alert_id;
      }
    } catch(error) {
      console.log(query1);
      return res.status(400).send(error);
    }

    let query = `select a.* from alerts_masterpanel a inner join customer_groups b on a.groupid=b.id
            where '${req.body.user.company_id}' = ANY(string_to_array(customer_ids, ',')) 
            and created_at > (current_date - interval '31 day') and a.id>'${last_id}'`;

    try {
      
      const { rows, rowCount } = await global.query(query);
      rows_alerts = rows;
      if(rowCount>0){
        last_id = rows[rowCount-1].id;
        await global.query(`update users set last_alert_id = '${last_id}' where id='${req.body.user.id}'`);
        console.log(`update users set last_alert_id = '${last_id}'`);
      }
      return res.status(200).send({ 'data':rows_alerts});
    } catch(error) {
      console.log(error);
      return res.status(400).send(error);
    }
  },

  /**
   * Add A Company
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async add(req, res) {
    
    let query_company = "";
    
    query_company = `INSERT INTO alerts_masterpanel(title, content, groupid, created_at)
      VALUES('${req.body.title}', '${req.body.content}', '${req.body.group_id}', 'now()')
      returning *`;

    try {
      const { rows } = await global.query(query_company);
      
      return res.status(200).send({ "data":rows });
    } catch(error) {
      console.log(query_company);
      console.log(error);
      return res.status(400).send(error);
    }

  },
  /**
   * Delete A Company
   * @param {object} req 
   * @param {object} res 
   * @returns {void} return status code 204 
   */
  async delete(req, res) {
    const deleteQuery = `DELETE FROM alerts_masterpanel WHERE id = ${req.params.id} returning *;`;
    try {
      const { rows } = await global.query(deleteQuery);
      if(!rows[0]) {
        return res.status(404).send({'message': 'id not found'});
      }
      return res.status(204).send({ 'message': 'deleted' });
    } catch(error) {
      return res.status(400).send(error);
    }
  }
}