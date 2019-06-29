var express = require('express');
var router = express.Router();
// var elasticsearch = require('elasticsearch');
// var admin_dashboard = require('../services/admin-dashboard');
var Auth = require('../middleware/auth');


const staticsController = require('../controllers').statics;
// const countryController = require('../controllers').country;

require('dotenv').config();

router.get('/getDashboardStatics', Auth.verifyToken, staticsController.getDashboardStatics);
router.get('/getUniqueUsersPerTime', Auth.verifyToken, staticsController.getUniqueUsersPerTime);

router.get('/getOnlineUsercountPerGame', Auth.verifyToken, staticsController.getOnlineUsercountPerGame);
router.get('/getOnlineUsercountPerCompany', Auth.verifyToken, staticsController.getOnlineUsercountPerCompany);
router.get('/getUniqueLoggedUsercount', Auth.verifyToken, staticsController.getUniqueLoggedUsercount);
router.get('/getPeakUsers', Auth.verifyToken, staticsController.getPeakUsers);
router.get('/getUsersSegmentedByRegion', Auth.verifyToken, staticsController.getUsersSegmentedByRegion);

router.get('/getOnlineHoursInGame', Auth.verifyToken, staticsController.getOnlineHoursInGame);
router.get('/getRankingOfISPs', Auth.verifyToken, staticsController.getRankingOfISPs);
router.get('/getListAvailableServers', Auth.verifyToken, staticsController.getListAvailableServers);
router.get('/getBandwidthPerServer', Auth.verifyToken, staticsController.getBandwidthPerServer);
router.get('/getBandwidthPerServerMT', Auth.verifyToken, staticsController.getBandwidthPerServerMT);
router.get('/getBandwidthPerCompany', Auth.verifyToken, staticsController.getBandwidthPerCompany);

router.get('/getNewOldExitUser', Auth.verifyToken, staticsController.getNewOldExitUser);
router.get('/getCurrentPing', Auth.verifyToken, staticsController.getCurrentPing);
router.get('/getPingImprovementPerRegion', Auth.verifyToken, staticsController.getPingImprovementPerRegion);
router.get('/getAveragePacketLoss', Auth.verifyToken, staticsController.getAveragePacketLoss);
router.get('/getOnlineUsersPerServer', Auth.verifyToken, staticsController.getOnlineUsersPerServer);
router.get('/getAvailableUsedServers', Auth.verifyToken, staticsController.getAvailableUsedServers);

router.get('/getInternetSpeedOfUser', Auth.verifyToken, staticsController.getInternetSpeedOfUser);
router.get('/getInetAvgSpeedPerRegion', Auth.verifyToken, staticsController.getInetAvgSpeedPerRegion);
router.get('/getPacketLossStaticSXC', Auth.verifyToken, staticsController.getPacketLossStaticSXC);
router.get('/getPacketLossStaticSXS', Auth.verifyToken, staticsController.getPacketLossStaticSXS);
router.get('/getServerOffline', Auth.verifyToken, staticsController.getServerOffline);
router.get('/getConfigurableAlert', Auth.verifyToken, staticsController.getConfigurableAlert);
router.get('/getMonitoringServerGameStatus', Auth.verifyToken, staticsController.getMonitoringServerGameStatus);

router.get('/getAverageLoginTime', Auth.verifyToken, staticsController.getAverageLoginTime);
router.get('/getHistoryUptime', Auth.verifyToken, staticsController.getHistoryUptime);
router.get('/getServerOfflineTime', Auth.verifyToken, staticsController.getServerOfflineTime);

router.get('/getuserscomputer', Auth.verifyToken, staticsController.getUsersComputer);

// router.get('/countries', countryController.getCountries);
// router.get('/getCountry/:id', countryController.getCountryById);

module.exports = router;
