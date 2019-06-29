var moment = require('moment');
var uuidv4 = require('uuid/v4');
var Helper = require('./helper');

var global = require("../services/global");

module.exports = {
  /**
   * Company List
   * @param {object} req 
   * @param {object} res
   * @returns {object} reflection object 
   */
  async getList(req, res) {

    const query = `select a.id, name, email, password, COALESCE(to_char(a.last_update, 'MM-DD-YYYY HH24:MI'), '') AS last_update 
                  from company_info a left join (
                      select * from users  where user_role='1'
                    ) b on a.id=b.company_id `;
    
    try {
      const { rows } = await global.query(query);
      return res.status(200).send({ "data":rows });
    } catch(error) {
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
    
    if (!req.body.email || !req.body.name || typeof req.body.id === 'undefined') {
      return res.status(400).send({'message': 'Some values are missing'});
    }
    // if (!Helper.isValidEmail(req.body.email)) {
    //   return res.status(400).send({ 'message': 'Please enter a valid email address' });
    // }
    let query_company = "";
    if(req.body.id == 0){
      query_company = `INSERT INTO company_info(name, last_update)
        VALUES('${req.body.name}', NOW())
        returning *`;
    }
    else{
      query_company = `update company_info  
                        set name='${req.body.name}', last_update=NOW()
                        where id=${req.body.id} returning *`;
    }
    
    let query_user = "";
    try {
      const { rows } = await global.query(query_company);
      const hashPassword = Helper.hashPassword(req.body.password);
      
      if(req.body.id != 0){
        query_user = `update users 
                      set email='${req.body.email}', password='${hashPassword}', last_update=NOW()
                      where company_id=${req.body.id} and user_role='1' returning *`;
        const {rows_user} = await global.query(query_user);
        console.log(rows_user);
        
        if(rows_user && rows_user.length>0){
          rows[0]['email'] = req.body.email;
          return res.status(200).send({ "data":rows });
        }
  
      }

      query_user = `INSERT INTO users(id, email, password, create_at, last_update, user_role, company_id)
        values('${uuidv4()}', '${req.body.email}', '${hashPassword}', NOW(), NOW(), '1', ${rows[0].id})`;
      const {rows_user} = await global.query(query_user);
      rows[0]['email'] = req.body.email;
      
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
    console.log(req.query.ids);
    const deleteQuery = `DELETE FROM company_info WHERE id in (${req.query.ids}) returning *; delete from users where company_id in (${req.query.ids}) `;
    try {
      const { rows } = await global.query(deleteQuery);
      if(!rows[0]) {
        return res.status(404).send({'message': 'company not found'});
      }
      return res.status(204).send({ 'message': 'deleted' });
    } catch(error) {
      return res.status(400).send(error);
    }
  }
}