var global = require("../services/global");

var CONST_SERVERGAME = 0
var CONST_SETALERT = 1
var CONST_SERVERSTATUS = 2
var alert_list = [{},{},{}];


module.exports = {
    /**
     * Real time status respectively: total users online, peak of users online today, 
     * total of unique users that played today, average ping improvement, average packet loss improvement,
     * online servers and offline
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getDashboardStatics(req, res, next) {

        var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";
        var company_id_s = req.body.user.company_id!='0' ? `and id in (select server_id from servers_x_company where company_id=${req.body.user.company_id})` : "";

        var sql_total = `select total_users_online, peak_users_online, unique_users, total_servers_online, total_servers_offline, to_char(packet_loss_improvement, '990d99') packet_loss_improvement, to_char(ping_improvement, '990d99') ping_improvement
                        from (
                            select 1 id, count(*) as total_users_online from client_info where 
                            (EXTRACT(EPOCH FROM (now()::timestamp - updated_at::timestamp)))<300 ${company_id}
                        ) a
                        join (
                            select 1 id, count(client_id) as peak_users_online 
                                from public.client_game_info a where (a.update_at >= (current_date - interval '1 day'))
                                and client_id in (select id from client_info where 1=1 ${company_id})
                        ) b using(id)
                        join (
                            select 1 id, count(y.client_id) unique_users from (select x.client_id from public.client_info_login as x
                                where x.last_login > (current_date - interval '1 day') and 
                                        client_id in (select id from client_info where 1=1 ${company_id})
                                group by x.client_id) as y
                        ) c using(id)
                        join (
                            select 1 id, count(*) as total_servers_online from server_info where 
                            (EXTRACT(EPOCH FROM (now()::timestamp - last_update::timestamp)))<=300 ${company_id_s}
                        ) d using(id)
                        join (
                            select 1 id, count(*) as total_servers_offline from server_info where 
                            (EXTRACT(EPOCH FROM (now()::timestamp - last_update::timestamp)))>300 ${company_id_s}
                        ) e using(id)
                        join (
                            select 1 id, avg((case when packet_loss_without<packet_loss_with then 0
                                                else packet_loss_without-packet_loss_with end)*100/(packet_loss_without+(packet_loss_without=0)::integer)) packet_loss_improvement,
                                        avg((case when ping_without<ping_with then 0
                                            else ping_without-ping_with end)*100/(ping_without+(ping_without=0)::integer)) ping_improvement
                            from public.client_info_network_day where client_id in (select id from client_info where 1=1 ${company_id})
                        ) f using(id)
                            `;

        try{
            const { rows, rowCount } = await global.query(sql_total);
            return res.status(200).send({"data":rows, "x_total_count": 1});
        }catch(error){
            console.log(sql_total)
            return res.status(400).send(error);
        }
    },

    
    /**
     * How many unique users logged in per the dayily/weekly/monthly/yearly
     * 
     * req.body : {datetype() }
     * 
     * last_update > (current_date - interval '2 day'); 
     */
    async getUniqueUsersPerTime(req, res, next){
        // console.log("call getUniqueLoggedUsercount - req.body - " + JSON.stringify(req.body));
        var client_ids = req.body.user.company_id!='0' ? ("and a.client_id in (select id from client_info where company_id=" + req.body.user.company_id) + ")" : "";

        results = [];

        var time_type = req.query.type;
        var time_range = "";
        switch(time_type)
        {
            case 'day':
                where_cond = "date_trunc('month', CURRENT_DATE)"; //daily
                time_range = "date_trunc('month', current_date), current_date, '1 day'";
                break;
            case 'week':
                where_cond = "NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER-56";    //weekly
                time_range = "NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER-55, current_date, '1 week'";
                break;
            case 'month':
                where_cond = "date_trunc('year', CURRENT_DATE)";    //monthly
                time_range = "date_trunc('year', current_date), current_date, '1 month'";
                break;
            case 'year':
                where_cond = "'2000-01-01'"; //yearly
                time_range = "date_trunc('year', current_date)::date-interval '3 year', current_date, '1 year'";
                break;
        }
//extract(${time_type} from date1)::text date2
        var sql = `select date1::date::text, coalesce(count, 0) count
            from(
                SELECT generate_series(${time_range})::date as date1
            ) a
            left join(
                select b.date1, count(b.client_id) from (select a.client_id, date_trunc('${time_type}', a.last_login) date1 from public.client_info_login as a
                where  a.last_login > ${where_cond} ${client_ids} group by a.client_id, date1 ) as b group by b.date1 order by date1 asc
            ) b using(date1)`;

        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": 1});
        }catch(error){
            console.log(sql);
            console.log("error: " + error);
            return res.status(400).send(error);
        }
    },
    /**
     * How many users are online simultaneously in real time per game / application and total on both
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getOnlineUsercountPerGame(req, res, next) {
        var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";
        var client_ids = req.body.user.company_id!='0' ? ("and client_id in (select id from client_info where company_id=" + req.body.user.company_id) + ")" : "";

        var sql_total = `select count(c.game_id) from (select b.game_id from public.client_game_info as b where 1=1 ${client_ids} group by b.game_id) as c`;
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
    
        var sql = `	select x.*, y.name as gamename from	(select a.game_id, count(c.id) as user_online_count from 
            ( (select * from public.client_game_info where 1=1 ${client_ids}) as a  
            left join 
            (select b.id from public.client_info as b where (EXTRACT(EPOCH FROM (now()::timestamp - b.updated_at::timestamp)))<300 ${company_id} ) as c 
            on a.client_id = c.id) 
        group by a.game_id ) as x left join public.game_info as y on x.game_id = y.id  ${orderby} ${limit} ${offset}`;

        console.log(sql);
        try{
            const { rows, rowCount } = await global.query(sql);
        
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            return res.status(400).send(error);
        }
    },


    /**
     * How many users are online simultaneously in real time per company and total on both
     */

    async getOnlineUsercountPerCompany(req, res, next) {

        var sql_total = `select count(id) from company_info`;
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

        var search_query = "";
        if(req.query.name_like)
            search_query = "where name like '%" + req.query.name_like + "%'"
    
        var sql = `	select a.*, coalesce(c.count,0) count from company_info a 
                    left join 
                        (select b.company_id, count(b.id) count from public.client_info as b 
                            where (EXTRACT(EPOCH FROM (now()::timestamp - b.updated_at::timestamp)))<300 group by b.company_id ) as c 
                    on a.id = c.company_id ${search_query} ${orderby} ${limit} ${offset}`;

        try{
            const { rows, rowCount } = await global.query(sql);
        
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },
  
  
  /**
   * How many unique users logged in during the day/week/month/year
   * 
   * req.body : {datetype() }
   * 
   * last_update > (current_date - interval '2 day'); 
   */
    async getUniqueLoggedUsercount(req, res, next){
        if(req.body.user.company_id!='0'){  //admin panel
            var client_ids = ("and a.client_id in (select id from client_info where company_id=" + req.body.user.company_id) + ")";

            var intervals = {'Today' : 0, 'Last 3 day':3, 'Last Week':7, 'Last Month':30, 'Last Year':365};
        
            results = [];
        
            for(var key in intervals){
                var sql = `select count(b.client_id) from (select a.client_id from public.client_info_login as a
                                where a.last_login > (current_date - interval '${intervals[key]} day') ${client_ids} group by a.client_id) as b `;
                try{
                    const { rows, rowCount } = await global.query(sql);
                    if(rowCount>0){
                    results.push({'date':key, 'uniques':rows[0]['count']});
                    }
                }catch(error){
                    console.log("error: " + error);
                    return res.status(400).send(error);
                }
            }
        
            return res.status(200).send({"data":results, "x_total_count": 5});
        }
        else{   //master panel
            var duration = "";
            if(req.query.duration_like){
                switch(req.query.duration_like){
                    case "today":     duration = '0';      break;
                    case "last3day":  duration = '3'; break;
                    case 'lastweek':  duration = '7'; break;
                    case 'lastmonth': duration = '30'; break;
                    case 'lastyear':  duration = '365'; break;
                }
                duration = `where a.last_login > (current_date - interval '${duration} day')`
            }
            var sql_total = `select count(id) from company_info`;
           
            var total_count = 0;
            try{
                const { rows, rowCount } = await global.query(sql_total);
                if(rowCount>0)
                    total_count = rows[0]['count'];
                }catch(error){
                    return res.status(400).send(error);
            }

            var total_unique_users = 0;
            page_no = parseInt(req.query._page, 10);

            if(page_no==1){

                try{
                    let sql = `select count(b.client_id)
                                from (select distinct(a.client_id) from public.client_info_login a ${duration}) b`
                    const { rows, rowCount } = await global.query(sql);
                    if(rowCount>0)
                        total_unique_users = rows[0]['count'];
                    }catch(error){
                        return res.status(400).send(error);
                }
            }

            var limit = "limit " + req.query._limit;
            var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
            var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";
    
            var sql = `select d.name, coalesce(count,0) count 
                        from company_info d 
                        left join   (
                                        select count(b.client_id), c.company_id 
                                        from (select distinct(a.client_id) from public.client_info_login a ${duration}) b
                                        left join client_info c on b.client_id=c.id
                                        group by c.company_id
                                    ) e 
                        on d.id=e.company_id
                        ${orderby} ${limit} ${offset}`;
            
            try{
                const { rows, rowCount } = await global.query(sql);
                if(page_no==1)
                    rows.splice(0,0,{name:'Total', count:total_unique_users})
                return res.status(200).send({"data":rows, "x_total_count": total_count});
            }catch(error){
                console.log(sql);
                return res.status(400).send(error);
            }
        }
    },
  
  
    async getPeakUsers(req, res, next){
        var duration = "";
        if(req.query.duration_like){
            switch(req.query.duration_like){
                case "today":     duration = 'where (a.update_at >= (current_date))';      break;
                case "last3day":  duration = `where (a.update_at >= (current_date - interval '3 day'))`; break;
                case 'lastweek':  duration = `where (a.update_at >= (current_date - interval '7 day'))`; break;
                case 'lastmonth': duration = `where (a.update_at >= (current_date - interval '30 day'))`; break;
                case 'lastyear':  duration = `where (a.update_at >= (current_date - interval '365 day'))`; break;
            }
        }

        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        var search_query = "";
        if(req.query.name_like)
            search_query = "where name like '%" + req.query.name_like + "%'"

        if(req.body.user.company_id!='0'){
            var client_ids = ("and a.client_id in (select id from client_info where company_id=" + req.body.user.company_id) + ")"
            var sql_total = `select count(*) from (select a.game_id from 
                                public.client_game_info as a ${duration} ${client_ids}
                                group by a.game_id) as b`;
            
            var total_count = 0;
            try{
                const { rows, rowCount } = await global.query(sql_total);
            if(rowCount>0)
                total_count = rows[0]['count'];
            }catch(error){
                return res.status(400).send(error);
            }


            var sql = `select x.*, y.name as gamename 
                        from	(select a.game_id, count(a.client_id) as user_online_count from 
                        public.client_game_info as a ${duration} ${client_ids}
                        group by a.game_id  ) as x left join public.game_info as y on x.game_id = y.id ${search_query} ${orderby} ${limit} ${offset}`;
            
            try{
                const { rows, rowCount } = await global.query(sql);
                return res.status(200).send({"data":rows, "x_total_count": total_count});
            }catch(error){
                console.log(sql);
                return res.status(400).send(error);
            }
        }
        else{
            var sql_total = `select count(id) from company_info`;
            
            var total_count = 0;
            try{
                const { rows, rowCount } = await global.query(sql_total);
            if(rowCount>0)
                total_count = rows[0]['count'];
            }catch(error){
                return res.status(400).send(error);
            }
        
            var total_peak_users = 0;
            page_no = parseInt(req.query._page, 10);

            if(page_no==1){

                try{
                    let sql = `select count(a.client_id) from client_game_info a ${duration}`
                    const { rows, rowCount } = await global.query(sql);
                    if(rowCount>0)
                        total_peak_users = rows[0]['count'];
                    }catch(error){
                        return res.status(400).send(error);
                }
            }

            // var limit = "limit " + req.query._limit;
            // var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
            // var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

            var sql = `select d.name, coalesce(count,0) count 
                        from company_info d 
                        left join   (
                                        select count(b.client_id), c.company_id 
                                        from (select a.client_id from client_game_info a ${duration}) b
                                        left join client_info c on b.client_id=c.id
                                        group by c.company_id
                                    ) e 
                        on d.id=e.company_id ${search_query} ${orderby} ${limit} ${offset}`;
            
            try{
                const { rows, rowCount } = await global.query(sql);
                if(page_no==1 && search_query=="")
                    rows.splice(0,0,{name:'Total', count:total_peak_users})
                return res.status(200).send({"data":rows, "x_total_count": total_count});
            }catch(error){
                console.log(sql);
                return res.status(400).send(error);
            }
        }
    },
  
  
/**
 * Number of hours that the player stayed online in the game/application.
 */
    async getOnlineHoursInGame(req, res, next){
        var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";
        var sql_total = `select count(*) from client_info where 0=0 ${company_id}`;
        // console.log(sql_total);
        
        var total_count = 0;
        try{
            const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            return res.status(400).send(error);
        }
    
        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        sql = `select x.id, x.email, coalesce(x.hour,0) as today, coalesce(y.hour,0) as week, coalesce(z.hour,0) as month from 
        (select id, email, hour from client_info b left join
            (select a.client_id, sum(a.time_gameplay)/60 as hour 
            from (select client_id, time_gameplay from client_game_info where update_at > (current_date) and client_id in (select id from client_info where 1=1 ${company_id})) a 
            group by a.client_id) c on b.id=c.client_id where 1=1 ${company_id}) as x 
   join (select c.id, sum(c.time_gameplay)/60 as hour from (select a.id, b.time_gameplay from (select id from client_info where 0=0 ${company_id}) as a left outer join 
                   (select client_id, time_gameplay from client_game_info where update_at BETWEEN NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER-7 AND NOW()::DATE-EXTRACT(DOW from NOW())::INTEGER) as b on a.id=b.client_id) as c group by c.id) as y on x.id = y.id
   join (select c.id, sum(c.time_gameplay)/60 as hour from (select a.id, b.time_gameplay from (select id from client_info where 0=0 ${company_id}) as a left outer join 
                   (select client_id, time_gameplay from client_game_info where update_at between date_trunc('month', current_date - interval '1' month) and date_trunc('month', current_date)) as b on a.id=b.client_id) as c group by c.id) as z on x.id = z.id
                    ${orderby} ${limit} ${offset}`;

        console.log(sql);
        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            return res.status(400).send(error);
        }
    },

    /**
     * Create a ranking of ISPs by the amount of users that each ISP has, give options to ranking that for country and state
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    
    async getRankingOfISPs(req, res, next){
        var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";
        var client_ids = req.body.user.company_id!='0' ? ("and client_id in (select id from client_info where company_id=" + req.body.user.company_id) + ")" : "";

        var ranking_option = req.query.option_like ? req.query.option_like : "isp";

        var sql_total = `select count(*) from (select ${ranking_option} from client_info_login where 1=1 ${client_ids} group by ${ranking_option}) as a`;
        // console.log(sql_total);
        
        var total_count = 0;
        try{
            const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            return res.status(400).send(error);
        }

        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : " order by count desc";

        sql = `select ${ranking_option} as name, count(distinct(client_id)) from client_info_login where 1=1 ${client_ids} group by ${ranking_option}
                    ${orderby} ${limit} ${offset}`;

        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },
/**
 * List available servers and show which one is online/offline, the IP of each one, 
 * the port of each one that is running (TCP / UDP), the percentage of CPU in use, 
 * percentage of RAM in use, amount of bandwidth per second that is passing in Mb/s
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
    async getListAvailableServers(req, res, next){
        var company_id_s = req.body.user.company_id!='0' ? `and id in (select server_id from servers_x_company where company_id=${req.body.user.company_id})` : "";

        // page_no = parseInt(req.query._page, 10);
        // var limit = "limit " + req.query._limit;
        // var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        // var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        var sql_total
        if(req.body.user.company_id!='0'){
            sql_total = `select count(id) from servers_x_company where company_id=${req.body.user.company_id}`;

            sql = `select a.name, a.country, a.isp, a.ip, a.port_tcp, a.port_udp, b.memory_use, (b.download_per_seconds+b.upload_per_seconds) as bandusage, b.cpu 
            from (select * from server_info where 0=0 ${company_id_s}) a left join server_info_machine b on a.id=b.server_id
                    `;
        }
        else{
            sql_total = `select count(id) from server_info`
            sql = `select a.name, a.country, a.isp, a.ip, a.port_tcp, a.port_udp, a.cname, b.memory_use, (b.download_per_seconds+b.upload_per_seconds) as bandusage, b.cpu 
            from (
                    select c.*, d.cname from server_info c left join 
                    (
                        select x.server_id, string_agg(y.name,',') cname from servers_x_company x left join company_info y on x.company_id=y.id group by x.server_id  
                    )d on c.id = d.server_id
	            ) a 
	        left join server_info_machine b on a.id=b.server_id `;
        }
        // console.log(sql_total);
        
        var total_count = 0;
        try{
            const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            return res.status(400).send(error);
        }
    


        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": rowCount});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },

    /**
     * Show the bandwidth used by each server and the total bandwidth used day/week/month/year  
     * *************(for Master)*****************
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getBandwidthPerServerMT(req, res, next){

        // var sql_total = `select count(id) from server_info`;
        // // console.log(sql_total);

        // var total_count = 0;
        // try{
        //     const { rows, rowCount } = await global.query(sql_total);
        // if(rowCount>0)
        //     total_count = rows[0]['count'];
        // }catch(error){
        //     return res.status(400).send(error);
        // }

        // page_no = parseInt(req.query._page, 10);
        // var limit = "limit " + req.query._limit;
        // var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        // var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        sql = `select k.name, k.network_speed, k.projection, coalesce(monthly_bandwidth, 0) bandwidth_used_l30
                from  server_info k
                left join (
                        select server_id, sum(total_download+total_upload) monthly_bandwidth
                        from  server_info_machine_logs where updatedat>=(current_date - interval '30 day')
                        group by server_id
                    ) monthly on k.id=monthly.server_id`;
//                ${orderby} ${limit} ${offset}`;
        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": rowCount});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },
/**
 * Show the bandwidth used by each server and the total bandwidth used day/week/month/year
 * *************(for Admin)*****************
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
    async getBandwidthPerServer(req, res, next){

        var company_id_s = `and id in (select server_id from servers_x_company where company_id=${req.body.user.company_id})`;

        var sql_total = `select count(*) from servers_x_company where company_id=${req.body.user.company_id}`;
        // console.log(sql_total);

        var total_count = 0;
        try{
            const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            return res.status(400).send(error);
        }
    
        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        sql = `select k.version status_version, k.monitor_version, k.name, k.country, k.isp, k.ip, coalesce(today_bandwidth, 0) today,
                 coalesce(lastweek_bandwidth,0) lastweek, coalesce(monthly_bandwidth, 0) lastmonth, coalesce(monthly2_bandwidth,0) last2month
                from (
                    (select * from server_info where 0=0 ${company_id_s}) m left join server_info_machine n on m.id=n.server_id
                ) k
                left join (
                    select server_id, sum(daily_bandwidth) as today_bandwidth
                    from (
                        SELECT
                        x.server_id, x.daily_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY daily_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) daily_bandwidth, date_trunc('DAY', a."updatedat") monthly_dt 
                                        from server_info_machine_logs a where a."updatedat">=(current_date - interval '2 day') group by server_id, date_trunc('DAY', a."updatedat")) t) x
                        WHERE x.r = 1
                        
                        union all
                        
                        SELECT
                        x.server_id, -1*x.daily_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY daily_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) daily_bandwidth, date_trunc('DAY', a."updatedat") monthly_dt 
                                        from server_info_machine_logs a where a."updatedat">=(current_date - interval '2 day') group by server_id, date_trunc('DAY', a."updatedat")) t) x
                        WHERE x.r = 2
                    ) s
                    group by server_id
                ) daily using(server_id)
                left join (
                    select server_id, sum(monthly_bandwidth) monthly_bandwidth
                    from (
                        SELECT
                        x.server_id, x.monthly_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY monthly_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) monthly_bandwidth, date_trunc('month', a."updatedat") monthly_dt 
                                        from server_info_machine_logs a group by server_id, date_trunc('month', a."updatedat")) t) x
                        WHERE x.r = 1
                        
                        union all
                        
                        SELECT
                        x.server_id, -1*x.monthly_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY monthly_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) monthly_bandwidth, date_trunc('month', a."updatedat") monthly_dt 
                                        from server_info_machine_logs a group by server_id, date_trunc('month', a."updatedat")) t) x
                        WHERE x.r = 2
                    ) d
                    group by server_id
                ) monthly using(server_id)
                left join (
                    select server_id, sum(monthly_bandwidth) monthly2_bandwidth
                    from (
                        SELECT
                        x.server_id, x.monthly_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY monthly_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) monthly_bandwidth, date_trunc('month', a."updatedat") monthly_dt 
                                        from server_info_machine_logs a group by server_id, date_trunc('month', a."updatedat")) t) x
                        WHERE x.r = 1
                        
                        union all
                        
                        SELECT
                        x.server_id, -1*x.monthly_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY monthly_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) monthly_bandwidth, date_trunc('month', a."updatedat") monthly_dt 
                                        from server_info_machine_logs a group by server_id, date_trunc('month', a."updatedat")) t) x
                        WHERE x.r = 3
                    ) d
                    group by server_id
                ) monthly2 using(server_id)
                left join(
                    select server_id, sum(daily_bandwidth) as lastweek_bandwidth
                    from (
                        SELECT x.server_id, x.daily_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY daily_bandwidth desc) AS r, t.*
                        from (
                            select server_id, (max(total_download)+max(total_upload)) daily_bandwidth, date_trunc('week', a."updatedat") monthly_dt 
                                from server_info_machine_logs a 
                                where a."updatedat" BETWEEN current_date-EXTRACT(DOW FROM NOW())::INTEGER-18 AND current_date-EXTRACT(DOW from NOW())::INTEGER
                                group by server_id, date_trunc('week', a."updatedat")) t
                        ) x
                        WHERE x.r = 1
                        
                        union all
                        
                        SELECT x.server_id, -1*x.daily_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY daily_bandwidth desc) AS r, t.*
                        from (
                            select server_id, (max(total_download)+max(total_upload)) daily_bandwidth, date_trunc('week', a."updatedat") monthly_dt 
                                from server_info_machine_logs a 
                                where a."updatedat" BETWEEN current_date-EXTRACT(DOW FROM NOW())::INTEGER-18 AND current_date-EXTRACT(DOW from NOW())::INTEGER
                                group by server_id, date_trunc('week', a."updatedat")) t
                        ) x
                        WHERE x.r = 2
                    ) s
                    group by server_id
                ) lastweek using(server_id)
                ${orderby} ${limit} ${offset}`;
        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },

    /**
     * Show the bandwidth used by each server and the total bandwidth used day/week/month/year
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getBandwidthPerCompany(req, res, next){

        var company_id_s = "";

        var sql_total = `select count(*) from company_info`;
        // console.log(sql_total);

        var total_count = 0;
        try{
            const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            return res.status(400).send(error);
        }

        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        sql = `select k.name, coalesce(today_bandwidth, 0) today, coalesce(lastweek_bandwidth,0) lastweek, coalesce(monthly_bandwidth, 0) lastmonth, coalesce(monthly2_bandwidth,0) last2month
                from (
                    select id company_id, name from company_info m
                ) k
                left join (
                    select company_id, sum(daily_bandwidth) as today_bandwidth
                    from servers_x_company f
                    left join
                    (
                        SELECT
                        x.server_id, x.daily_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY daily_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) daily_bandwidth, date_trunc('DAY', a."updatedat") monthly_dt 
                                        from server_info_machine_logs a where a."updatedat">=(current_date - interval '2 day') group by server_id, date_trunc('DAY', a."updatedat")) t) x
                        WHERE x.r = 1
                        union all
                        SELECT
                        x.server_id, -1*x.daily_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY daily_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) daily_bandwidth, date_trunc('DAY', a."updatedat") monthly_dt 
                                        from server_info_machine_logs a where a."updatedat">=(current_date - interval '2 day') group by server_id, date_trunc('DAY', a."updatedat")) t) x
                        WHERE x.r = 2
                    ) s on f.server_id=s.server_id
                    group by company_id
                ) daily using(company_id)
                left join (
                    select company_id, sum(monthly_bandwidth) as monthly_bandwidth
                    from servers_x_company f
                    left join
                    (
                        SELECT
                        x.server_id, x.monthly_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY monthly_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) monthly_bandwidth, date_trunc('month', a."updatedat") monthly_dt 
                                        from server_info_machine_logs a group by server_id, date_trunc('month', a."updatedat")) t) x
                        WHERE x.r = 1                        
                        union all                        
                        SELECT
                        x.server_id, -1*x.monthly_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY monthly_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) monthly_bandwidth, date_trunc('month', a."updatedat") monthly_dt 
                                        from server_info_machine_logs a group by server_id, date_trunc('month', a."updatedat")) t) x
                        WHERE x.r = 2
                    ) s on f.server_id=s.server_id
                    group by company_id
                ) monthly using(company_id)
                left join (
                    select company_id, sum(monthly_bandwidth) as monthly2_bandwidth
                    from servers_x_company f
                    left join
                    (
                        SELECT
                        x.server_id, x.monthly_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY monthly_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) monthly_bandwidth, date_trunc('month', a."updatedat") monthly_dt 
                                        from server_info_machine_logs a group by server_id, date_trunc('month', a."updatedat")) t) x
                        WHERE x.r = 1                        
                        union all                        
                        SELECT
                        x.server_id, -1*x.monthly_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY monthly_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) monthly_bandwidth, date_trunc('month', a."updatedat") monthly_dt 
                                        from server_info_machine_logs a group by server_id, date_trunc('month', a."updatedat")) t) x
                        WHERE x.r = 3
                    ) s on f.server_id=s.server_id
                    group by company_id
                ) monthly2 using(company_id)
                left join (
                    select company_id, sum(daily_bandwidth) as lastweek_bandwidth
                    from servers_x_company f
                    left join
                    (
                        SELECT x.server_id, x.daily_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY daily_bandwidth desc) AS r, t.*
                        from (
                            select server_id, (max(total_download)+max(total_upload)) daily_bandwidth, date_trunc('week', a."updatedat") monthly_dt 
                                from server_info_machine_logs a 
                                where a."updatedat" BETWEEN current_date-EXTRACT(DOW FROM NOW())::INTEGER-18 AND current_date-EXTRACT(DOW from NOW())::INTEGER
                                group by server_id, date_trunc('week', a."updatedat")) t
                        ) x
                        WHERE x.r = 1                        
                        union all                        
                        SELECT x.server_id, -1*x.daily_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY daily_bandwidth desc) AS r, t.*
                        from (
                            select server_id, (max(total_download)+max(total_upload)) daily_bandwidth, date_trunc('week', a."updatedat") monthly_dt 
                                from server_info_machine_logs a 
                                where a."updatedat" BETWEEN current_date-EXTRACT(DOW FROM NOW())::INTEGER-18 AND current_date-EXTRACT(DOW from NOW())::INTEGER
                                group by server_id, date_trunc('week', a."updatedat")) t
                        ) x
                        WHERE x.r = 2
                    ) s on f.server_id=s.server_id
                    group by company_id
                ) lastweek using(company_id)
                ${orderby} ${limit} ${offset}`;
        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },
    /**
     * From the second month, comparison of new users x old x users exit. 
     * ( new users are users that create the account inside the gap of time of comparison, 
     * old user is the users who had account before the gap on interval and still using/playing and 
     * exit user are users that has account and didn’t play on last 30 days. )
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getNewOldExitUser(req, res, next){
        var company_id = req.body.user.company_id!='0' ? ("and id=" + req.body.user.company_id) : "";
        var company_id1 = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";

        var sql_total = `select count(*) from company_info where 0=0 ${company_id}`;
        // console.log(sql_total);
        
        var total_count = 0;
        try{
            const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            return res.status(400).send(error);
        }

        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";
        var duration = "current_date";
        if(req.query.duration_like){
            switch(req.query.duration_like){
                case "today":     duration = 'current_date';      break;
                case "last3day":  duration = `(current_date - interval '3 day')`; break;
                case 'lastweek':  duration = `(current_date - interval '7 day')`; break;
                case 'lastmonth': duration = `(current_date - interval '30 day')`; break;
                case 'last2month':  duration = `(current_date - interval '61 day')`; break;
                case 'last3month':  duration = `(current_date - interval '91 day')`; break;
            }
        }

        sql = `select company_id, cname, coalesce(newusers,0) newusers, coalesce(oldusers, 0) oldusers, coalesce(exitusers,0) exitusers 
                from (
                    select id company_id, a."name" cname from company_info a where 0=0 ${company_id}
                ) t 
                left join (
                    select company_id, count(*) newusers from client_info where created_at >= ${duration} ${company_id1} group by company_id
                ) x using(company_id) 
                left join (
                    select company_id, count(*) oldusers from client_info where created_at <= ${duration} ${company_id1} group by company_id
                ) y using(company_id)
                left join (
                    select company_id, count(*) exitusers from client_info where updated_at <= (current_date - interval '30 day') ${company_id1} group by company_id
                ) z using(company_id)
                    ${orderby} ${limit} ${offset}`;

        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },

    
    /**
     * Current Ping x Old Ping (To check the improvement in % and in milliseconds that 
     * Hydra did in each connection) with the information
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getCurrentPing(req, res, next){
        var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";

        var sql_total = `select count(*) 
                        from 
                            (select client_id from public.client_info_network_day where ping_with is not null and ping_without is not null group by client_id) a`;
        if(company_id != "")
            sql_total += ` where a.client_id in (select id from client_info where 1 ${company_id})`
        // console.log(sql_total);
        
        var total_count = 0;
        try{
            const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            return res.status(400).send(error);
        }

        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        sql = `select client_id, email, 
                    case when ping_with>2000 then '2000>'
                        else ping_with::text end
                        as currentping, 
                    case when ping_without>2000 then '2000>'
                        else ping_without::text end
                        as oldping,
                    case when improvement>0 then improvement
                        else '0' end
                        as improvement
                from (
                    select id client_id, email from client_info where 0=0 ${company_id}
                ) a
                inner join(
                    select client_id, avg(ping_with)::numeric::integer ping_with, avg(ping_without)::numeric::integer ping_without,
                        avg((ping_without-ping_with)*100/(ping_without+(ping_without=0)::integer))::numeric::integer improvement 
                    from public.client_info_network_day where ping_with is not null and ping_without is not null group by client_id
                ) b using(client_id)
                ${orderby} ${limit} ${offset}`;

        try{
            console.log(sql);
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },

    /**
     * Ping improvement per Country and State (To check the improvement in % and in milliseconds that 
     * Hydra did in each connection) with the information
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getPingImprovementPerRegion(req, res, next){
        var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";

        var region = req.query.regiontype_like ? req.query.regiontype_like:"isp";
        var sql_total = `select count(*) from (select ${region} from client_info a left join client_info_login b on a.id=b.client_id where  ${region}!='' ${company_id} group by ${region}) k`;

        
        // console.log(sql_total);
        
        var total_count = 0;
        try{
            const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            console.log(sql_total);
            return res.status(400).send(error);
        }
        console.log(sql_total);

        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        sql = `select region,
                case when improvement>0 then improvement
                    else 0 end
                    as improvement,
                case when currentping<=2000 then currentping::text
                    else '2000 >' end
                    as currentping,
                case when oldping<=2000 then oldping::text
                    else '2000 >' end
                    as oldping 
                from (
                    select avg(coalesce(ping_with,0))::numeric::integer currentping, avg(coalesce(ping_without,0))::numeric::integer oldping, 
                        avg(coalesce(improvement,0))::numeric::integer improvement, 
                        ${region} region
                    from (
                        select client_id, ${region} from client_info x left join client_info_login y on x.id=y.client_id where country!='' ${company_id}
                    ) a
                    inner join(
                        select client_id, ping_with, ping_without, (ping_without-ping_with)*100/(ping_without+(ping_without=0)::integer) improvement
                        from public.client_info_network_day where ping_with is not null and ping_without is not null
                    ) b using(client_id)
                    group by ${region}
                    ${orderby} ${limit} ${offset}
                ) x`;

                console.log(sql);
        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },
    
    /**
     * Average packet loss per ISP, user or Country. (To check the improvement in % that Hydra did in the packet loss on each connection 
     * or the overall average) with the information
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getAveragePacketLoss(req, res, next){
        var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";

        var region = req.query.regiontype_like ? req.query.regiontype_like:"";
        var sql_total = `select count(*) from (select client_id
                        from (
                            select id client_id, email from client_info where 0=0 ${company_id}
                        ) a
                        inner join(
                            select client_id 
                            from public.client_info_network_day where packet_loss_with is not null and packet_loss_without is not null and packet_loss_with!=0 and packet_loss_without != 0 group by client_id
                        ) b using(client_id)) xx`;
        if(region != "")
            sql_total = `select count(*) from (select count(${region}) count
            from (
                select client_id, ${region} from client_info x left join client_info_login y on x.id=y.client_id where 0=0 ${company_id}
            ) a
            inner join(
                select client_id from public.client_info_network_day where packet_loss_with is not null and packet_loss_without is not null and packet_loss_with!=0 and packet_loss_without != 0
            ) b using(client_id)
            group by ${region}) xx`;


        
        // console.log(sql_total);
        
        var total_count = 0;
        try{
            const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            return res.status(400).send(error);
        }

        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        if(region == "")
            sql = `select email as region, packet_loss_with currentloss, packet_loss_without oldloss, improvement
                from (
                    select id client_id, email from client_info where 0=0 ${company_id}
                ) a
                inner join(
                    select client_id, avg(packet_loss_with)::numeric::integer packet_loss_with, avg(packet_loss_without)::numeric::integer packet_loss_without, 
                                avg((packet_loss_without-packet_loss_with)*100/(packet_loss_without+(packet_loss_without=0)::integer))::numeric::integer improvement 
                    from public.client_info_network_day where packet_loss_with is not null and packet_loss_without is not null and packet_loss_with!=0 and packet_loss_without != 0 group by client_id
                ) b using(client_id)
                ${orderby} ${limit} ${offset}`;
        else
            sql = `select avg(packet_loss_with)::numeric::integer currentloss, avg(packet_loss_without)::numeric::integer oldloss, avg(improvement)::numeric::integer improvement, ${region} region
                from (
                    select client_id, ${region} from client_info x left join client_info_login y on x.id=y.client_id where 0=0 ${company_id}
                ) a
                inner join(
                    select client_id, packet_loss_with, packet_loss_without, (packet_loss_without-packet_loss_with)*100/(packet_loss_without+(packet_loss_without=0)::integer)::numeric::integer improvement 
                    from public.client_info_network_day where packet_loss_with is not null and packet_loss_without is not null and packet_loss_with!=0 and packet_loss_without != 0
                ) b using(client_id)
                group by ${region}
                ${orderby} ${limit} ${offset}`;

        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },

    
    /**
     * Number of users per server (How many users are online using that server)
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getOnlineUsersPerServer(req, res, next){
        var company_id_s = req.body.user.company_id!='0' ? `and id in (select server_id from servers_x_company where company_id=${req.body.user.company_id})` : "";

        var sql_total
        if(req.body.user.company_id!='0')
            sql_total = `select count(id) from servers_x_company where company_id=${req.body.user.company_id}`;
        else
            sql_total = `select count(id) from server_info_machine`

        console.log(sql_total);
        var total_count = 0;
        try{
            const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            return res.status(400).send(error);
        }

        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        sql = `select server_id, name servername, client_tcp, client_udp, client_tcp+client_udp totals from server_info x join server_info_machine y on x.id=y.server_id 
                where 1=1 ${company_id_s}
            ${orderby} ${limit} ${offset}`;

        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },

    
    /**
     * Number of available routes (Total number of servers available on system)
     * Number of servers in use (Number of servers that users are connected in real time)
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getAvailableUsedServers(req, res, next){
        var company_id_s = req.body.user.company_id!='0' ? `and id in (select server_id from servers_x_company where company_id=${req.body.user.company_id})` : "";

        sql = `select availables, uses, totals
                from (
                    select 1 id, count(*) totals from server_info where 1=1 ${company_id_s}
                ) d
                join (
                    select 1 id, count(*) availables from server_info x join server_info_machine y on x.id=y.server_id 
                    where cpu>0 and memory_use>0 and memory_free>0 ${company_id_s}
                ) b using(id)
                join (
                    select 1 id, count(*) uses 
                    from (select client_tcp+client_udp count1 
                            from server_info x join server_info_machine y on x.id=y.server_id where 1=1 ${company_id_s}) a 
                    where a.count1>0
                ) c using(id)`;

        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": 1});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },

    /**
     * Number of users; segmented by region, Country, State and City.  
     * (When users are from Brazil also set which region they are South, Southeast, Midwest, North, Northeast)
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getUsersSegmentedByRegion(req, res, next){
        var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";

        var regions = req.query.selected_regions.split(',');
        var conditions = company_id;
        var groupbyregion = '';

        if(regions.length == 1)
            groupbyregion = 'country';
        else{
            conditions += " and country='" + regions[1] + "'";
            if(regions.length == 2){
                if(regions[1] == 'Brazil')
                    groupbyregion = 'region';
                else
                    groupbyregion = 'state';
            }
            else if(regions.length == 3){
                if(regions[1] == 'Brazil'){
                    conditions += " and region='" + regions[2] + "'";
                    groupbyregion = 'state';
                }
                else{
                    conditions += " and state='" + regions[2] + "'";
                    groupbyregion = 'city';
                }
            }
            else{
                conditions += " and region='" + regions[2] + "'";
                conditions += " and state='" + regions[3] + "'";
                groupbyregion = 'city';
            }
        } 
        sql = `select ${groupbyregion} regionname, count(distinct(client_id)) usercount from client_info_login where 1=1 ${conditions} group by ${groupbyregion}`;
        console.log(sql);
        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": 1});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },
    
    
    /**
     * Internet speed of each user
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getInternetSpeedOfUser(req, res, next){
        var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";

        var sql_total = `select count(*) from client_info where 0=0 ${company_id}`;
        
        var total_count = 0;
        try{
            const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            return res.status(400).send(error);
        }

        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        sql = `select c.id, c.email, to_char((download+upload)/1024, '9990d9999') internetspeed, isp
                from (select id, email from client_info where 0=0 ${company_id}) c
                left join client_info_network b on c.id=b.client_id
                left join (
                    select distinct on (client_id) client_id, isp from client_info_login
		                order by client_id, last_login desc
                    ) a on c.id=a.client_id
            ${orderby} ${limit} ${offset}`;

        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },

    
    /**
     * Creation of average speed connection per Country, State, City and ISP 
     * (When users are from Brazil also set which region they are South, Southeast, Midwest, North, Northeast)
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getInetAvgSpeedPerRegion(req, res, next){
        var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";


        var conditions = "";
        var groupbyregion = '';

        if(req.query.region_type == 'isp'){
            groupbyregion = 'isp';
        }
        else{
            if(req.query.selected_regions == '')
                groupbyregion = 'country';
            else{
                var regions = req.query.selected_regions.split(',');
                conditions += " and country='" + regions[0] + "'";
                if(regions.length == 1){
                    if(regions[0] == 'Brazil')
                        groupbyregion = 'region';
                    else
                        groupbyregion = 'state';
                }
                else if(regions.length == 2){
                    if(regions[0] == 'Brazil'){
                        conditions += " and region='" + regions[1] + "'";
                        groupbyregion = 'state';
                    }
                    else{
                        conditions += " and state='" + regions[1] + "'";
                        groupbyregion = 'city';
                    }
                }
                else{
                    conditions += " and region='" + regions[1] + "'";
                    conditions += " and state='" + regions[2] + "'";
                    groupbyregion = 'city';
                }
            } 
        }


        // sql = `select ${groupbyregion} regionname, count(client_id) usercount from client_info_login where 1=1 ${conditions} group by ${groupbyregion}`;

        sql = `select ${groupbyregion} regionname, to_char(avg(download)/1024, '999990d99999') download, to_char(avg(upload)/1024, '9999990d99999') upload
                from (select id from client_info where 1=1 ${company_id}) c 
                inner join (select * from client_info_login where 1=1 ${conditions}) a on c.id=a.client_id 
                inner join client_info_network b on a.client_id=b.client_id 
                group by ${groupbyregion}`;

        console.log(sql);
        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": 1});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },
    
    /**
     * List servers timeouts between server x customers, and show statics from it, 
     * from the server who lose more packet to one who lose less, show that on % and on packet numbers counts by time
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getPacketLossStaticSXC(req, res, next){
        var company_id_s = req.body.user.company_id!='0' ? `and id in (select server_id from servers_x_company where company_id=${req.body.user.company_id})` : "";

        var sql_total
        if(req.body.user.company_id!='0')
            sql_total = `select count(id) from servers_x_company where company_id=${req.body.user.company_id}`;
        else
            sql_total = `select count(id) from server_info`

        
        var total_count = 0;
        try{
            const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            return res.status(400).send(error);
        }

        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        sql = `select servername, server_id, coalesce(packet_loss::INTEGER,0) packet_loss , coalesce(loss_pro::INTEGER, 0) loss_pro
                from (select id server_id, name servername from server_info where 1=1 ${company_id_s}) a
                inner join (
                    select server_id, avg(packet_loss_with) packet_loss, avg(packet_loss_with*100/packet_count) loss_pro 
                    from client_info_network_day where packet_count is not null and packet_count!=0 group by server_id
                ) b using(server_id)

             ${orderby} ${limit} ${offset}`;
        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },

    /**
     * List servers timeouts between server x server, and show statics from it, 
     * from the server who lose more packet to one who lose less, show that on % and on packet numbers counts by time
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getPacketLossStaticSXS(req, res, next){
        var company_id_s = req.body.user.company_id!='0' ? `and id in (select server_id from servers_x_company where company_id=${req.body.user.company_id})` : "";

        var sql_total
        if(req.body.user.company_id!='0')
            sql_total = `select count(id) from servers_x_company where company_id=${req.body.user.company_id}`;
        else
            sql_total = `select count(id) from server_info`

        
        var total_count = 0;
        try{
            const { rows, rowCount } = await global.query(sql_total);
        if(rowCount>0)
            total_count = rows[0]['count'];
        }catch(error){
            return res.status(400).send(error);
        }

        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        sql = `select servername, coalesce(packet_loss::INTEGER,0) packet_loss , coalesce(loss_pro::INTEGER, 0) loss_pro
                from (select id server_id_src , name servername from server_info where 1=1 ${company_id_s}) a
                left join (
                    select server_id_src, sum(packet_loss) packet_loss, avg(packet_loss)*100/(avg(packet_count)+(avg(packet_count)=0)::integer) loss_pro 
                    from server_info_network_day
                    where server_id_dest in (select id from server_info where 1=1 ${company_id_s}) 
                        and server_id_src in (select id from server_info where 1=1 ${company_id_s})
                    group by server_id_src
                ) b using(server_id_src)
                ${orderby} ${limit} ${offset}`;

        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },

    /**
     * Alert whenever a server goes offline for more than 3 seconds, 
     * whenever a server reaches more than 80%+ CPU ram, whenever the server has more than 10%+
     * from the server who lose more packet to one who lose less, show that on % and on packet numbers counts by time
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getServerOffline(req, res, next){
        var company_id_s = req.body.user.company_id!='0' ? `and a.id in (select server_id from servers_x_company where company_id=${req.body.user.company_id})` : "";

        sql = `select server_id, servername, cpu, ram::integer, packetloss::integer
                from (
                    select server_id, name servername, cpu, memory_use*100/(memory_free+memory_use+((memory_free+memory_use)=0)::integer) ram 
                    from server_info a join server_info_machine b on a.id = b.server_id where 1=1 ${company_id_s}
                ) b
                left join (
                    select server_id, avg(packet_loss_with*100/(packet_count+(packet_count=0)::integer)) packetloss from client_info_network_day 
                    where server_id in (select id from server_info a where 1=1 ${company_id_s}) group by server_id
                ) c using(server_id)`;

        try{
            const { rows, rowCount } = await global.query(sql);

        // console.log(alert_list);

            var resp_alerts = {}

            for(let i=0; i<rowCount; i++){
                let key = req.body.user.id + '_' + rows[i]['server_id'];

                let bExist = alert_list[CONST_SERVERSTATUS].hasOwnProperty(key+'cpu')
                // console.log(rows[i]['ping_mean'], req.query.ping_mean_threshold)
                if(parseInt(rows[i]['cpu']) > parseInt(req.query.cpu_threshold))
                {
                    if(!bExist){
                        alert_list[CONST_SERVERSTATUS][key+'cpu'] = 1
                        resp_alerts[rows[i]['server_id'] + 'cpu'] = 1;
                    }
                }
                else if(bExist){
                    delete alert_list[CONST_SERVERSTATUS][key+'cpu']
                }

                bExist = alert_list[CONST_SERVERSTATUS].hasOwnProperty(key+'ram')
                // console.log(rows[i]['ping_mean'], req.query.ping_mean_threshold)
                if(parseInt(rows[i]['ram']) > parseInt(req.query.ram_threshold))
                {
                    if(!bExist){
                        alert_list[CONST_SERVERSTATUS][key+'ram'] = 1
                        resp_alerts[rows[i]['server_id'] + 'ram'] = 1;
                    }
                }
                else if(bExist){
                    delete alert_list[CONST_SERVERSTATUS][key+'ram']
                }

                bExist = alert_list[CONST_SERVERSTATUS].hasOwnProperty(key+'ploss')
                // console.log(rows[i]['ping_mean'], req.query.ping_mean_threshold)
                if(parseInt(rows[i]['ploss']) > parseInt(req.query.ploss_threshold))
                {
                    if(!bExist){
                        alert_list[CONST_SERVERSTATUS][key+'ploss'] = 1
                        resp_alerts[rows[i]['server_id'] + 'ploss'] = 1;
                    }
                }
                else if(bExist){
                    delete alert_list[CONST_SERVERSTATUS][key+'ploss']
                }
            }

            return res.status(200).send({"data":rows, "x_total_count": rowCount, "alerts":resp_alerts});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },

    /**
     * -Create a configurable alert (number of clients affected at the same time for alert issuance) to alert whenever this number of clients 
     * (that the admin has set themselves) to disconnect or increase in packet loss, cross-location, similarities between the users, the ISP, 
     * and city to see how far the problem has reached, which region is affected and which ISPs, thinking on that 
     * will be possible even to trace when a city lose electric energy for example, or a hurricane starts etc...
     * in the table client_info_network_day you can make this information, relating to the cliend_id and taking the user's ip and checking the ISP
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getConfigurableAlert(req, res, next){
        var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";
        var company_id_s = req.body.user.company_id!='0' ? `and id in (select server_id from servers_x_company where company_id=${req.body.user.company_id})` : "";

        var groupby_type = req.query.type ? req.query.type : "isp";
        var user_count_pro = req.query.user_count_pro

        sql = `select coalesce(client_count_alert*100.0/(client_count+(client_count=0)::integer), 0) user_count_pro, packetloss, namea
                from(
                    select count(a.client_id) client_count, avg(packet_loss_with*100/(packet_count+(packet_count=0)::integer))::numeric::integer packetloss, ${groupby_type} namea
                    from client_info_network_day a left join server_info b on a.server_id=b.id
                    where a.server_id in (select id from server_info where 1=1 ${company_id_s}) and a.client_id in (select id from client_info where 1=1 ${company_id})
                    group by namea
                ) a 
                left join(
                    select count(a.client_id) client_count_alert, ${groupby_type} namea
                    from client_info_network_day a left join server_info b on a.server_id=b.id
                    where a.server_id in (select id from server_info where 1=1 ${company_id_s}) and a.client_id in (select id from client_info where 1=1 ${company_id}) 
                            and packet_loss_with*100/(packet_count+(packet_count=0)::integer)>${user_count_pro}
                    group by namea
                ) b using(namea)`;

        try{
            const { rows, rowCount } = await global.query(sql);

            var resp_alerts = {}

            for(let i=0; i<rowCount; i++){
                let key = req.body.user.id + '_' + rows[i]['namea'] + '_' + groupby_type;

                let bExist = alert_list[CONST_SETALERT].hasOwnProperty(key)
                // console.log(rows[i]['ping_mean'], req.query.ping_mean_threshold)
                if(parseInt(rows[i]['user_count_pro']) > parseInt(req.query.user_count_pro))
                {
                    if(!bExist){
                        alert_list[CONST_SETALERT][key] = 1
                        resp_alerts[rows[i]['namea']] = 1;
                    }
                }
                else if(bExist){
                    delete alert_list[CONST_SETALERT][key]
                }
            }

            return res.status(200).send({"data":rows, "x_total_count": rowCount, "alerts":resp_alerts});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },

    /**
     * server to game  ping, packetloss status
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getMonitoringServerGameStatus(req, res, next){
        // sql = `with cte as (select row_number() over (partition by server_id, game_server_id
        //                         order by updated_at desc) as rn,
        //                     server_id, game_server_id,  ping_mean, packet_loss, updated_at
        //                 from public.monitoring_server_results_day 
        //                 where
        //                     server_id in (select server_game_id from public.monitor_server_game where user_id='${req.body.user.id}' and type='server') 
        //                     and game_server_id in (select server_game_id from public.monitor_server_game where user_id='${req.body.user.id}' and type='game')
        //             ) 
        //         select server_id, b.name sname, game_server_id, d.name gname, coalesce(c.name,'-') id_name, ping_mean, packet_loss, to_char(updated_at, 'YYYY-MM-DD  HH24:MI') updated_at
        //             from cte a left join server_info b on a.server_id=b.id 
        //             left join game_info_server c on a.game_server_id=c.id
        //             left join game_info d on c.game_id = d.id
        //             where rn=1`;

        sql = `with cte as (select * from (select row_number() over
                        (partition by server_id, game_server_id
                order by updated_at desc) as rn,
                server_id, game_server_id,  ping_mean, packet_loss, updated_at
                from public.monitoring_server_results_day
                where
                server_id in (select server_game_id from public.monitor_server_game where user_id='${req.body.user.id}' and type='server')
                and game_server_id in (select server_game_id from public.monitor_server_game where user_id='${req.body.user.id}' and type='game')) xx
                where rn=1)
                select x.server_id, b.name sname, x.server_game_id game_server_id, d.name gname, coalesce(c.name,'-') id_name, c.ip ipaddress, coalesce(ping_mean, -1) ping_mean, coalesce(packet_loss, -1) packet_loss, to_char(updated_at,
                'YYYY-MM-DD  HH24:MI') updated_at
                from (select server_game_id, server_id
                from (
                select server_game_id from public.monitor_server_game where user_id='${req.body.user.id}' and type='game'
                ) y natural join(
                select server_game_id server_id from public.monitor_server_game where user_id='${req.body.user.id}' and type='server'
                ) z
                ) x
                left join cte a on (x.server_game_id=a.game_server_id and x.server_id=a.server_id)
                left join server_info b on x.server_id=b.id
                left join game_info_server c on x.server_game_id=c.id
                left join game_info d on c.game_id = d.id`

// console.log(alert_list);
        try{
            const { rows, rowCount } = await global.query(sql);

            var resp_alerts = {}

            for(let i=0; i<rowCount; i++){
                let key = req.body.user.id + '_' + rows[i]['server_id'] + '_' + rows[i]['game_server_id'];

                let bExist = alert_list[CONST_SERVERGAME].hasOwnProperty(key+'pm')
                // console.log(rows[i]['ping_mean'], req.query.ping_mean_threshold)
                if(parseInt(rows[i]['ping_mean']) > parseInt(req.query.ping_mean_threshold))
                {
                    if(!bExist){
                        alert_list[CONST_SERVERGAME][key+'pm'] = 1
                        resp_alerts[rows[i]['server_id'] + 'pm' + rows[i]['game_server_id']] = 1;
                    }
                }
                else if(bExist){
                    delete alert_list[CONST_SERVERGAME][key+'pm']
                }

                bExist = alert_list[CONST_SERVERGAME].hasOwnProperty(key+'pl')
                if(parseInt(rows[i]['packet_loss']) > parseInt(req.query.packet_loss_threshold))
                {
                    if(!bExist){
                        alert_list[CONST_SERVERGAME][key+'pl'] = 1
                        resp_alerts[rows[i]['server_id'] + 'pl' + rows[i]['game_server_id']] = 1;
                    }
                }
                else if(bExist){
                    delete alert_list[CONST_SERVERGAME][key+'pl']
                }
            }

            return res.status(200).send({"data":rows, "x_total_count": rowCount, "alerts":resp_alerts});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },


    /**
     * At what time of day the user log in; profiling of paying users to do events when most of the paying users are online, etc… 
     * Calculate the peak of logins by verifying those times
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getAverageLoginTime(req, res, next){
        var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";

        sql = `select id, email, avgtime from client_info a 
                inner join 
                    (select client_id, to_char(avg(last_login::time),'HH:MI') avgtime from client_info_login 
                        where client_id in (select id from client_info where 1=1 ${company_id}) group by client_id) b
                on a.id=b.client_id
                where 1=1 ${company_id}
                 `;

        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": rowCount});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },
    
    
    /**
     * History of uptime (check at which point each server stopped working and with which ISP/regions this happened) 
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getHistoryUptime(req, res, next){
        var company_id_s = req.body.user.company_id!='0' ? `and id in (select server_id from servers_x_company where company_id=${req.body.user.company_id})` : "";

        sql = '';
        if(req.query.packet_loss_time && req.query.server_id){
            sql = `select string_agg(isp, ', ') isps
                    from (
                        select client_id from client_info_server_network 
                        where server_id = ${req.query.server_id} and to_char(last_update, 'YYYY-MM-DD HH24:MI')='${req.query.packet_loss_time}'
                    ) a
                    left join (
                        select client_id, isp from client_info_login ) b using(client_id)`;
        }

        else
            sql = `select server_id, name, packet_loss_times, ip, isp 
                from 
                    (select server_id, string_agg(distinct(to_char(last_update, 'YYYY-MM-DD HH24:MI')), ',') packet_loss_times 
                        from client_info_server_network group by server_id) a 
                left join server_info b on a.server_id=b.id where 1=1 ${company_id_s}`;

        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": rowCount});
        }catch(error){
            console.log(sql);
            return res.status(400).send(error);
        }
    },

    /**
     * Offline Time Server X Server,  User X Server
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getServerOfflineTime(req, res, next){
        var company_id_s = req.body.user.company_id!='0' ? `and id in (select server_id from servers_x_company where company_id=${req.body.user.company_id})` : "";

        var duration = "current_date";
        if(req.query.duration){
            switch(req.query.duration){
                case "today":     duration = 'current_date';      break;
                case "week":  duration = `(current_date - interval '7 day')`; break;
                case 'month':  duration = `(current_date - interval '30 day')`; break;
                case 'last3month': duration = `(current_date - interval '91 day')`; break;
                case 'year':  duration = `(current_date - interval '365 day')`; break;
            }
        }

        sql = `select server_id, servername, ip, isp, coalesce(offline_time_uxs, 0) offline_time_uxs , coalesce(offline_time_sxs, 0) offline_time_sxs
                from (
                        select id server_id, name servername, ip, isp from server_info where 1=1 ${company_id_s}
                    ) a
                left join 
                    (select server_id, count(id)*5 offline_time_uxs
                        from client_info_network_day 
                        where updated_at>${duration}
                                and server_id in (select id from server_info where 1=1 ${company_id_s})
                        group by server_id
                    ) b using(server_id) 
                left join 
                    (select server_id_src server_id, count(id) offline_time_sxs
                        from server_info_network_day 
                        where updated_time>${duration} 
                                and server_id_src in (select id from server_info where 1=1 ${company_id_s})
                        group by server_id_src
                    ) c using(server_id) 
                `;
        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": rowCount});
        }catch(error){
        
            return res.status(400).send(error);
        }
    },

    async getUsersComputer(req, res, next) {
        var company_id = req.body.user.company_id!='0' ? ("and company_id=" + req.body.user.company_id) : "";

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