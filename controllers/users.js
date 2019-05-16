var global = require("../services/global");


module.exports = {
    async getUsersComputer(req, res, next) {
        var company_id = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";

        var sql_total = `select count(*) from client_info where 0=0 ${company_id}`;
        var total_count = 0;
        try{
        const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            return res.status(400).send(error);
        }

        // console.log("req.query = ", JSON.stringify(req));
    
        var page_no = parseInt(req.query._page);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        // const {page_no, totalPages, limit, offset} = global.getPaginationInfos(req, total_count);
    
        var sql = `	select a.email, b.* from 
            client_info as a left join client_info_hardware as b on a.id=b.client_id 
            where 0=0 ${company_id}  ${orderby} ${limit} ${offset}`;

        try{
            const { rows, rowCount } = await global.query(sql);
        
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            return res.status(400).send(error);
        }
    },
  
  
  
}