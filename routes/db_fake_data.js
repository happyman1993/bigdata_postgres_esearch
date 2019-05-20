var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');

var dateFormat = require('dateformat');
var moment = require('moment');
var jsonFile = require('jsonfile')
var global = require('../services/global')

// const Country = require('../models').country;
// const State = require('../models').state;
// const City = require('../models').city;

require('dotenv').config();

router.post('/makerandom', async(req, res, next) => {
  var country = ['Brazil', 'France', 'German', 'China', 'England', 'Spain'];
//  var region = []
  var state = ['aaaa', 'bbbbbb', 'ccccc', 'dddddd', 'eeeeeee','ffffffff','gggggggg','eeeeee','hhhhhhh', 'iiiiiiii','jjjjjjjj'];
  var city = ['xxxxxx', 'zzzzzz', 'yyyyyy', 'uuuuuu','kkkkkk','mmmmmm','nnnnnnn','lllllll','ooooooo','ppppppp'];
  var isp = ['isp1', 'isp2', 'isp3', 'isp4', 'isp5', 'isp6', 'isp7', 'isp8', 'isp9', 'isp10', 'isp11', 'isp12', 'isp13'];
  for(var k=1400; k<8400; k++){
    var sql = '';//`insert into public.client_info_login(id, client_id, ip, last_login, region, country, city, isp, state) `;
    requests = [];
    for(var i = 0; i<1000; i++){
      for(var j=0; j<6; j++){
        // sql += `insert into public.client_info_login(id, client_id, ip, last_login, region, country, city, isp, state)
        //  values(${1+k*6000+i*6+j}, ${Math.floor(Math.random() * 45)+21}, '1.1.1.1', NOW(), 'aaa', '${country[j]}', 'bbb','sss','eee');`;

        requests.push({index:{_index:"client_info_login",_type: "aaa",_id:1+k*6000+i*6+j}})
        requests.push({
          "client_id": Math.floor(Math.random() * 45)+21,
          "ip" : `127.0.0.${Math.floor(Math.random() * 254)}`,
          "last_login" : moment().format('yyyy-mm-dd:hh:mm:ss'),
          "region" : "aaa",
          "country": country[Math.floor(Math.random() * 6)],
          "city" : city[Math.floor(Math.random() * 10)],
          "state" : state[Math.floor(Math.random() * 11)],
          "isp" : isp[Math.floor(Math.random() * 13)],
        })

      }
    }
    await new Promise((resolve) => {
      global.client.bulk({
        body: requests
      },function(err,resp,status) {
          console.log(resp);
          resolve();
      });
    })
// sql += ';';
    console.log(k);
//    await query(sql);
  }
  return res.status(200).send({});
})

router.post('/makerandom_pg', async(req, res, next) => {
  var country = ['Brazil', 'France', 'German', 'China', 'England', 'Spain'];
//  var region = []
  var state = ['aaaa', 'bbbbbb', 'ccccc', 'dddddd', 'eeeeeee','ffffffff','gggggggg','eeeeee','hhhhhhh', 'iiiiiiii','jjjjjjjj'];
  var city = ['xxxxxx', 'zzzzzz', 'yyyyyy', 'uuuuuu','kkkkkk','mmmmmm','nnnnnnn','lllllll','ooooooo','ppppppp'];
  var isp = ['isp1', 'isp2', 'isp3', 'isp4', 'isp5', 'isp6', 'isp7', 'isp8', 'isp9', 'isp10', 'isp11', 'isp12', 'isp13'];
  for(var k=1; k<20; k++){
    var sql = '';//`insert into public.client_info_login(id, client_id, ip, last_login, region, country, city, isp, state) `;
    for(var i = 0; i<1000; i++){
      for(var j=0; j<6; j++){
        sql += `insert into public.client_info_login(id, client_id, ip, last_login, region, country, city, isp, state)
         values(${1+k*6000+i*6+j}, ${Math.floor(Math.random() * 45)+21}, '127.0.0.${Math.floor(Math.random() * 254)}', NOW(), 'aaa',
          '${country[Math.floor(Math.random() * 6)]}', '${city[Math.floor(Math.random() * 10)]}','${isp[Math.floor(Math.random() * 13)]}',
          '${state[Math.floor(Math.random() * 11)]}');`;

        // await new Promise((resolve) => {
        //   global.client.index({
        //     index:"client_info_login",
        //     type: "aaa",
        //     id:1+k*6000+i*6+j, 
        //     body:{
        //       "client_id": Math.floor(Math.random() * 45)+21,
        //       "ip" : `127.0.0.${Math.floor(Math.random() * 254)}`,
        //       "last_login" : moment().format('yyyy-mm-dd:hh:mm:ss'),
        //       "region" : "aaa",
        //       "country": country[Math.floor(Math.random() * 6)],
        //       "city" : city[Math.floor(Math.random() * 10)],
        //       "state" : state[Math.floor(Math.random() * 11)],
        //       "isp" : isp[Math.floor(Math.random() * 13)],
        //     }
        //   },function(err,resp,status) {
        //       console.log(resp);
        //       resolve();
        //   });
        // })
      }
    }
    // sql += ';';
    console.log(k);
    await global.query(sql);
  }
  return res.status(200).send({});
})


router.post('/country_insert', (req, res, next) => {
  jsonFile.readFile("./countries.json", async function(err, jsonData) {
    if (err) throw err;
    
    for (var i = 0; i < jsonData.Countries.length; ++i) {
      // sql = `insert into public.countries (name, createdAt) values('${jsonData.Countries[i].CountryName.replace(/'/g, '"')}', NOW()) RETURNING id;`;
      // ret = await global.query(sql);
      country_id = 0;
      await new Promise((resolve) => {
        Country.create({
          name: jsonData.Countries[i].CountryName//.replace(/'/g, '"'),
        })
        .then((country1) => {
          country_id = country1.id;
          resolve();
        })
        .catch((error) => {resolve();});
      })
      console.log(country_id);

      for(var j=0; j<jsonData.Countries[i].States.length; ++j){
        // sql = `insert into public.states (country_id, name, createdAt) values(${country_id},
        //           '${jsonData.Countries[i].States[j].StateName.replace(/'/g, '"')}', NOW()) RETURNING id;`;
        // ret = await global.query(sql);
        state_id = 0;
        await new Promise((resolve) => {
          State.create({
            name: jsonData.Countries[i].States[j].StateName,
            country_id: country_id
          })
          .then((state1) => {
            state_id = state1.id;
            resolve();
          })
          .catch((error) => {resolve();});
        })
        console.log("     state_id = ", state_id);
        for(var k=0; k<jsonData.Countries[i].States[j].Cities.length; ++k){
          City.create({
            name: jsonData.Countries[i].States[j].Cities[k],
            state_id: state_id
          }).then((city1) => {})
          .catch((error) => {});
        }
      }
    }
  });
  return res.status(200).send({});
})


module.exports = router;