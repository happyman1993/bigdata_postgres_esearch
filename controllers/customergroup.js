var moment = require('moment');
var uuidv4 = require('uuid/v4');
var Helper = require('./helper');

var global = require("../services/global");

module.exports = {
  /**
   * Customer, CustomerGroup List
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async getList(req, res) {

    let query = `select id as value, name as text from company_info`;
    let rows_customers
    try {
      const { rows } = await global.query(query);
      rows_customers = rows
    } catch(error) {
      console.log(error);
      return res.status(400).send(error);
    }
    query = `select * from customer_groups`;
    try {
      const { rows } = await global.query(query);
      return res.status(200).send({ 'customers':rows_customers, 'customer_groups': rows});
    } catch(error) {
      console.log('eeee', error);
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
    
    // if (!req.body.email || !req.body.name || typeof req.body.id === 'undefined') {
    //   return res.status(400).send({'message': 'Some values are missing'});
    // }
    // if (!Helper.isValidEmail(req.body.email)) {
    //   return res.status(400).send({ 'message': 'Please enter a valid email address' });
    // }
    let query_company = "";
    if(req.body.id == 0){
      query_company = `INSERT INTO customer_groups(name, customer_ids)
        VALUES('${req.body.name}', '${req.body.customer_ids}')
        returning *`;
    }
    else{
      query_company = `update customer_groups
                        set name='${req.body.name}', customer_ids='${req.body.customer_ids}'
                        where id=${req.body.id} returning *`;
    }
    
    let query_user = "";
    try {
      const { rows } = await global.query(query_company);
      
      return res.status(200).send({ "data":rows });
    } catch(error) {
      console.log(query_user);
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
    const deleteQuery = `DELETE FROM customer_groups WHERE id = ${req.params.id} returning *;`;
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