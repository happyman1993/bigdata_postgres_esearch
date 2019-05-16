const Serverinfo = require('../models').serverinfo;

module.exports = {
    list(req, res) {
        return Serverinfo.findAll({

        })
        .then((infos) => res.status(200).send(infos))
        .catch((error) => { res.status(400).send(error);});
    },

    getById(req, res) {
        return Serverinfo.findById(req.params.id, {

        })
        .then((item) => {
            if (!country){
                return res.status(404).send({ message: 'Serverinfo Not Found'});
            }
            return res.status(200).send(item);
        })
        .catch((error) => { res.status(400).send(error);});
    },
}