var express = require('express');
var router = express.Router();
// var elasticsearch = require('elasticsearch');
// var admin_dashboard = require('../services/admin-dashboard');


const staticsController = require('../controllers').statics;
// const countryController = require('../controllers').country;

require('dotenv').config();

router.get('/getDashboardStatics', staticsController.getDashboardStatics);
router.get('/getUniqueUsersPerTime', staticsController.getUniqueUsersPerTime);

router.get('/getOnlineUsercountPerGame', staticsController.getOnlineUsercountPerGame);
router.get('/getUniqueLoggedUsercount', staticsController.getUniqueLoggedUsercount);
router.get('/getPeakUsers', staticsController.getPeakUsers);
router.get('/getUsersSegmentedByRegion', staticsController.getUsersSegmentedByRegion);

router.get('/getOnlineHoursInGame', staticsController.getOnlineHoursInGame);
router.get('/getRankingOfISPs', staticsController.getRankingOfISPs);
router.get('/getListAvailableServers', staticsController.getListAvailableServers);
router.get('/getBandwidthPerServer', staticsController.getBandwidthPerServer);
router.get('/getNewOldExitUser', staticsController.getNewOldExitUser);
router.get('/getCurrentPing', staticsController.getCurrentPing);
router.get('/getPingImprovementPerRegion', staticsController.getPingImprovementPerRegion);
router.get('/getAveragePacketLoss', staticsController.getAveragePacketLoss);
router.get('/getOnlineUsersPerServer', staticsController.getOnlineUsersPerServer);
router.get('/getAvailableUsedServers', staticsController.getAvailableUsedServers);

router.get('/getInternetSpeedOfUser', staticsController.getInternetSpeedOfUser);
router.get('/getInetAvgSpeedPerRegion', staticsController.getInetAvgSpeedPerRegion);
router.get('/getPacketLossStaticSXC', staticsController.getPacketLossStaticSXC);
router.get('/getPacketLossStaticSXS', staticsController.getPacketLossStaticSXS);
router.get('/getServerOffline', staticsController.getServerOffline);
router.get('/getConfigurableAlert', staticsController.getConfigurableAlert);

router.get('/getAverageLoginTime', staticsController.getAverageLoginTime);
router.get('/getHistoryUptime', staticsController.getHistoryUptime);
router.get('/getServerOfflineTime', staticsController.getServerOfflineTime);

router.get('/getuserscomputer', staticsController.getUsersComputer);

// router.get('/countries', countryController.getCountries);
// router.get('/getCountry/:id', countryController.getCountryById);

module.exports = router;
