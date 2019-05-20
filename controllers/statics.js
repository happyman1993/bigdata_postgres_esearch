var global = require("../services/global");


module.exports = {
    async getOnlineUsercountPerGame(req, res, next) {

        var sql_total = `select count(c.game_id) from (select b.game_id from public.client_game_info as b group by b.game_id) as c`;
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
            ( public.client_game_info as a  
            left join 
            (select b.id from public.client_info as b where (EXTRACT(EPOCH FROM (now()::timestamp - b.last_update::timestamp)))/1000<30000000  ) as c 
            on a.client_id = c.id) 
        group by a.game_id ) as x left join public.game_info as y on x.game_id = y.id  ${orderby} ${limit} ${offset}`;

        try{
            const { rows, rowCount } = await global.query(sql);
        
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
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
        console.log("call getUniqueLoggedUsercount - req.body - " + JSON.stringify(req.body));
    
        
        var intervals = {'Today' : 0, 'Last 3 day':3, 'Last Week':7, 'Last Month':30, 'Last Year':365};
    
        results = [];
    
        for(var key in intervals){
            var sql = `select count(b.client_id) from (select a.client_id from public.client_info_login as a
                            where a.last_login > (current_date - interval '${intervals[key]} day') group by a.client_id) as b `;
                            console.log(sql);                    
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
    },
  
  
    async getPeakUsers(req, res, next){
        console.log("call getUniqueLoggedUsercount - req.body - " + JSON.stringify(req.body));
    
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
    
        var sql_total = `select count(*) from (select a.game_id from 
                            public.client_game_info as a ${duration}
                            group by a.game_id) as b`;
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

        var sql = `select x.*, y.name as gamename 
                    from	(select a.game_id, count(a.client_id) as user_online_count from 
                    public.client_game_info as a ${duration} 
                    group by a.game_id  ) as x left join public.game_info as y on x.game_id = y.id ${orderby} ${limit} ${offset}`;
        console.log(sql);
        try{
            const { rows, rowCount } = await global.query(sql);
            return res.status(200).send({"data":rows, "x_total_count": total_count});
        }catch(error){
            return res.status(400).send(error);
        }
    },
  
  
/**
 * Number of hours that the player stayed online in the game/application.
 */
    async getOnlineHoursInGame(req, res, next){
        var company_id = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";
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

        sql = `select x.id, coalesce(x.hour,0) as today, coalesce(y.hour,0) as week, coalesce(z.hour,0) as month from 
        (select c.id, sum(c.time_gameplay)/60 as hour from (select a.id, b.time_gameplay from (select id from client_info where 0=0 ${company_id}) as a left outer join 
                    (select client_id, time_gameplay from client_game_info where update_at > (current_date)) as b on a.id=b.client_id) as c group by c.id) as x 
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
        var company_id = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";
        var ranking_option = req.query.option_like ? req.query.option_like : "isp";

        var sql_total = `select count(*) from (select ${ranking_option} from client_info_login group by ${ranking_option}) as a`;
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

        sql = `select ${ranking_option} as name, count(client_id) from client_info_login group by ${ranking_option}
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
        var company_id = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";

        var sql_total = `select count(*) from server_info where 0=0 ${company_id}`;
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

        sql = `select a.name, a.country, a.isp, a.ip, a.port_tcp, a.port_udp, b.memory_use, (b.download_per_seconds+b.upload_per_seconds) as bandusage, b.cpu 
            from (select * from server_info where 0=0 ${company_id}) a left join server_info_machine b on a.id=b.server_id
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
    async getBandwidthPerServer(req, res, next){

        var company_id = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";

        var sql_total = `select count(*) from server_info where 0=0 ${company_id}`;
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
                    (select * from server_info where 0=0 ${company_id}) m left join server_info_machine n on m.id=n.server_id
                ) k
                left join (
                    select server_id, sum(daily_bandwidth) as today_bandwidth
                    from (
                        SELECT
                        x.server_id, x.daily_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY daily_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) daily_bandwidth, date_trunc('DAY', a."updatedAt") monthly_dt 
                                        from server_info_machine_logs a where a."updatedAt">=(current_date - interval '2 day') group by server_id, date_trunc('DAY', a."updatedAt")) t) x
                        WHERE x.r = 1
                        
                        union all
                        
                        SELECT
                        x.server_id, -1*x.daily_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY daily_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) daily_bandwidth, date_trunc('DAY', a."updatedAt") monthly_dt 
                                        from server_info_machine_logs a where a."updatedAt">=(current_date - interval '2 day') group by server_id, date_trunc('DAY', a."updatedAt")) t) x
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
                            (select server_id, (max(total_download)+max(total_upload)) monthly_bandwidth, date_trunc('month', a."updatedAt") monthly_dt 
                                        from server_info_machine_logs a group by server_id, date_trunc('month', a."updatedAt")) t) x
                        WHERE x.r = 1
                        
                        union all
                        
                        SELECT
                        x.server_id, -1*x.monthly_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY monthly_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) monthly_bandwidth, date_trunc('month', a."updatedAt") monthly_dt 
                                        from server_info_machine_logs a group by server_id, date_trunc('month', a."updatedAt")) t) x
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
                            (select server_id, (max(total_download)+max(total_upload)) monthly_bandwidth, date_trunc('month', a."updatedAt") monthly_dt 
                                        from server_info_machine_logs a group by server_id, date_trunc('month', a."updatedAt")) t) x
                        WHERE x.r = 1
                        
                        union all
                        
                        SELECT
                        x.server_id, -1*x.monthly_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY monthly_bandwidth desc) AS r, t.*
                        FROM
                            (select server_id, (max(total_download)+max(total_upload)) monthly_bandwidth, date_trunc('month', a."updatedAt") monthly_dt 
                                        from server_info_machine_logs a group by server_id, date_trunc('month', a."updatedAt")) t) x
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
                            select server_id, (max(total_download)+max(total_upload)) daily_bandwidth, date_trunc('week', a."updatedAt") monthly_dt 
                                from server_info_machine_logs a 
                                where a."updatedAt" BETWEEN current_date-EXTRACT(DOW FROM NOW())::INTEGER-18 AND current_date-EXTRACT(DOW from NOW())::INTEGER
                                group by server_id, date_trunc('week', a."updatedAt")) t
                        ) x
                        WHERE x.r = 1
                        
                        union all
                        
                        SELECT x.server_id, -1*x.daily_bandwidth
                        FROM (
                        SELECT ROW_NUMBER() OVER (PARTITION BY server_id ORDER BY daily_bandwidth desc) AS r, t.*
                        from (
                            select server_id, (max(total_download)+max(total_upload)) daily_bandwidth, date_trunc('week', a."updatedAt") monthly_dt 
                                from server_info_machine_logs a 
                                where a."updatedAt" BETWEEN current_date-EXTRACT(DOW FROM NOW())::INTEGER-18 AND current_date-EXTRACT(DOW from NOW())::INTEGER
                                group by server_id, date_trunc('week', a."updatedAt")) t
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
        var company_id = req.query.company_id_like ? ("and id=" + req.query.company_id_like) : "";
        var company_id1 = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";

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
                    select company_id, count(*) newusers from client_info where create_at >= ${duration} ${company_id1} group by company_id
                ) x using(company_id) 
                left join (
                    select company_id, count(*) oldusers from client_info where create_at <= ${duration} ${company_id1} group by company_id
                ) y using(company_id)
                left join (
                    select company_id, count(*) exitusers from client_info where last_update <= (current_date - interval '30 day') ${company_id1} group by company_id
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
        var company_id = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";

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

        sql = `select client_id, ping_with currentping, ping_without oldping, improvement
                from (
                    select id client_id from client_info where 0=0 ${company_id}
                ) a
                left join(
                    select client_id, ping_with, ping_without, (ping_without-ping_with)*100/ping_without improvement 
                    from public.client_info_network_day
                ) b using(client_id)
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
     * Ping improvement per Country and State (To check the improvement in % and in milliseconds that 
     * Hydra did in each connection) with the information
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getPingImprovementPerRegion(req, res, next){
        var company_id = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";

        var region = req.query.regiontype_like ? req.query.regiontype_like:"country";
        var sql_total = `select count(*) from (select ${region} from client_info a left join client_info_login b on a.id=b.client_id where 0=0 ${company_id} group by ${region}) k`;

        
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

        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        sql = `select avg(ping_with)::numeric::integer currentping, avg(ping_without)::numeric::integer oldping, avg(improvement)::numeric::integer improvement, ${region} region
                from (
                    select client_id, ${region} from client_info x left join client_info_login y on x.id=y.client_id where company_id=3
                ) a
                left join(
                    select client_id, ping_with, ping_without, (ping_without-ping_with)*100/ping_without improvement 
                    from public.client_info_network_day
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
     * Average packet loss per ISP, user or Country. (To check the improvement in % that Hydra did in the packet loss on each connection 
     * or the overall average) with the information
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getAveragePacketLoss(req, res, next){
        var company_id = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";

        var region = req.query.regiontype_like ? req.query.regiontype_like:"";
        var sql_total = `select count(*) from client_info where 0=0 ${company_id}`;
        if(region != "")
            sql_total = `select count(*) from (select ${region} from client_info a left join client_info_login b on a.id=b.client_id where 0=0 ${company_id} group by ${region}) k`;


        
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
            sql = `select client_id as region, packet_loss_with currentloss, packet_loss_without oldloss, improvement
                from (
                    select id client_id from client_info where 0=0 ${company_id}
                ) a
                left join(
                    select client_id, packet_loss_with, packet_loss_without, (packet_loss_without-packet_loss_with)*100/packet_loss_without improvement 
                    from public.client_info_network_day
                ) b using(client_id)
                ${orderby} ${limit} ${offset}`;
        else
            sql = `select avg(packet_loss_with)::numeric::integer currentloss, avg(packet_loss_without)::numeric::integer oldloss, avg(improvement)::numeric::integer improvement, ${region} region
                from (
                    select client_id, ${region} from client_info x left join client_info_login y on x.id=y.client_id where company_id=3
                ) a
                left join(
                    select client_id, packet_loss_with, packet_loss_without, (packet_loss_without-packet_loss_with)*100/packet_loss_without improvement 
                    from public.client_info_network_day
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
        var company_id = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";

        var sql_total = `select count(*) from server_info where 0=0 ${company_id}`;
        
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

        sql = `select server_id, name servername, client_tcp+client_udp count from server_info x join server_info_machine y on x.id=y.server_id 
                where 1=1 ${company_id}
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
        var company_id = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";

        sql = `select availables, uses
                from (
                    select 1 id, count(*) availables from server_info x join server_info_machine y on x.id=y.server_id 
                    where cpu>0 and memory_use>0 and memory_free>0 ${company_id}
                ) b
                join (
                    select 1 id, count(*) uses 
                    from (select client_tcp+client_udp count1 
                            from server_info x join server_info_machine y on x.id=y.server_id where 1=1 ${company_id}) a 
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
        var company_id = req.query.company_id ? ("and company_id=" + req.query.company_id) : "";

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
        sql = `select ${groupbyregion} regionname, count(client_id) usercount from client_info_login where 1=1 ${conditions} group by ${groupbyregion}`;
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

        page_no = parseInt(req.query._page, 10);
        var limit = "limit " + req.query._limit;
        var offset = "offset " + (page_no-1) * parseInt(req.query._limit, 10);
        var orderby = req.query._sort ? ("order by " + req.query._sort + " " + req.query._order) : "";

        sql = `select a.client_id, isp, to_char((download+upload)/1024, 'FM999999.99999') internetspeed 
                from (select id from client_info where 1=1 ${company_id}) c 
                left join client_info_login a on c.id=a.client_id 
                left join client_info_network b on a.client_id=b.client_id 
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
        var company_id = req.query.company_id ? ("and company_id=" + req.query.company_id) : "";


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

        sql = `select ${groupbyregion} regionname, to_char(avg(download)/1024, 'FM999999.99999') download, to_char(avg(upload)/1024, 'FM999999.99999') upload
                from (select id from client_info where 1=1 ${company_id}) c 
                inner join (select * from client_info_login where 1=1 ${conditions}) a on c.id=a.client_id 
                left join client_info_network b on a.client_id=b.client_id 
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
        var company_id = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";

        var sql_total = `select count(*) from server_info where 0=0 ${company_id}`;
        
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

        sql = `select servername, server_id, packet_loss::INTEGER , loss_pro::INTEGER 
                from (select id server_id, name servername from server_info where 1=1 ${company_id}) a
                join (
                    select server_id, avg(packet_loss_with) packet_loss, avg(packet_loss_with)*100/avg(packet_count) loss_pro 
                    from client_info_network_day group by server_id
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
        var company_id = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";

        var sql_total = `select count(*) from server_info where 0=0 ${company_id}`;
        
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

        sql = `select servername, packet_loss::INTEGER , loss_pro::INTEGER 
                from (select id server_id, name servername from server_info where 1=1 ${company_id}) a
                join (
                    select server_id, avg(packet_loss_with) packet_loss, avg(packet_loss_with)*100/avg(packet_count) loss_pro 
                    where client_id in (select id from client_info where 1=1 ${company_id})
                    from client_info_network_day group by server_id
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
     * Alert whenever a server goes offline for more than 3 seconds, 
     * whenever a server reaches more than 80%+ CPU ram, whenever the server has more than 10%+
     * from the server who lose more packet to one who lose less, show that on % and on packet numbers counts by time
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getServerOffline(req, res, next){
        var company_id = req.query.company_id_like ? ("and company_id=" + req.query.company_id_like) : "";

        var sql_total = `select count(*) from server_info where 0=0 ${company_id}`;
        
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

        sql = `select servername, loss_pro::INTEGER, cpu, ram::INTEGER
                from (select id server_id, name servername from server_info where 1=1 ${company_id}) a
                join (
                    select server_id, cpu, ((memory_use*100) / (memory_free+memory_use)) ram from server_info_machine
                ) c using(server_id)
                join (
                    select server_id, avg(packet_loss_with) packet_loss, avg(packet_loss_with)*100/avg(packet_count) loss_pro 
                    from client_info_network_day
                    where client_id in (select id from client_info where 1=1 ${company_id})
                    group by server_id
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
}