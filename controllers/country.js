const Country = require('../models').country;
const State = require('../models').State;

module.exports = {
    getCountries(req, res) {
        return Country.findAll({

        })
        .then((countries) => res.status(200).send(countries))
        .catch((error) => { res.status(400).send(error);});
    },

    getCountryById(req, res) {
        return Country.findById(req.params.id, {

        })
        .then((country1) => {
            if (!country1){
                return res.status(404).send({ message: 'Country Not Found'});
            }
            return res.status(200).send(country1);
        })
        .catch((error) => { res.status(400).send(error);});
    },

    addCountry(req, res) {
        return Country
            .create({
            name: req.body.name,
            })
            .then((country1) => res.status(201).send(country1))
            .catch((error) => res.status(400).send(error));
    },

    getStateslist(req, res) {
        return State.findAll({

        })
        .then((states) => res.status(200).send(states))
        .catch((error) => { res.status(400).send(error);});
    },

    getStateById(req, res) {
        return State.findById(req.params.id, {

        })
        .then((state) => {
            if (!country){
                return res.status(404).send({ message: 'State Not Found'});
            }
            return res.status(200).send(state);
        })
        .catch((error) => { res.status(400).send(error);});
    },

    addState(req, res) {
        return State
          .create({
            name: req.body.name,
            country_id: req.body.country_id
          })
          .then((state) => res.status(201).send(state))
          .catch((error) => res.status(400).send(error));
    },
        
}