var elasticsearch = require('elasticsearch');

require('dotenv').config();

const Pool = require('pg').Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports.query = function(text, params){
  return new Promise((resolve, reject) => {
    pool.query(text, params)
    .then((res) => {
      resolve(res);
    })
    .catch((err) => {
      console.log(err);
      reject(err);
    })
  })
};

exports.client = new elasticsearch.Client({
  hosts: ['http://localhost:9200']
});

exports.client.ping({
  requestTimeout: 10000
}, function(error){
  if (error) {
    console.error('Elasticsearch cluster is down!');
  } else {
      console.log('Everything is ok');
    //   client.indices.create({  
    //     index: 'client_info_login'
    //   },function(err,resp,status) {
    //     if(err) {
    //       console.log(err);
    //     }
    //     else {
    //       console.log("create",resp);
    //     }
    //   });
  }
})


module.exports.getPaginationInfos = function (req, total_count){
    var per_page = 10;
  
    var limit = "";
    var offset = "";
  
    if(req.body.per_page) per_page = req.body.per_page;
    if(req.body.page_no) page_no = req.body.page_no;
  
    console.log("total_count = " + total_count);
    console.log("per_page : " + per_page);
    console.log("page_no : " + page_no);
  
    var totalPages = Math.ceil(total_count/per_page);
    
    if(page_no>totalPages) page_no = totalPages;
  
    limit = "limit " + per_page;
    offset = "offset " + (page_no-1) * per_page;
  
    return {page_no, totalPages, limit, offset};
  }