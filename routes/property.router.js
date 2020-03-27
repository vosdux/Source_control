const { Router } = require('express');
const People = require('../models/People');
const Property = require('../models/Property');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

const router = Router();

const roleMiddle = (roles) => (req, res, next) => role(req, res, next, roles);

router.get('/', auth, roleMiddle(['admin']), async (req, res) => {
    try {
        const properties = await Property.find().skip((req.query.size * req.query.page)).limit(+req.query.size).exec();;
        res.json({ content: properties });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

router.post('/', auth, roleMiddle(['admin']), (req, res, next) => role(req, res, next, ['admin']), async (req, res) => {
    try {
        let property = await Property.create(req.body);
        res.json({ property });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Что-то пошло не так ' });
    }
});

router.put('/:id', auth, roleMiddle(['admin']), (req, res, next) => role(req, res, next, ['admin']), async (req, res) => {
    try {
        let property = await Property.findByIdAndUpdate(req.params.id, { $set: { name: req.body.name, fieldName: req.body.fieldName, lifeTime: req.body.lifeTime } });
        res.json({ property })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Что-то пошло не так ' });
    }
});

router.delete('/:id', auth, roleMiddle(['admin']), (req, res, next) => role(req, res, next, ['admin']), async (req, res) => {
    try {
        await Property.findByIdAndRemove(req.params.id);
        res.json({ message: 'Удалено' });
    } catch (error) {
        res.status(500).json({ message: 'Что-то пошло не так ' });
    }
});

router.put('/:peopleId/add-property', auth, roleMiddle(['admin', 'specialist']), (req, res, next) => role(req, res, next, ['specialist']), async (req, res) => {
    try {
        let promises = req.body.result.map(async (item) => {
            let propertyes = {
                property: item.property
            };

            if (item.date) {
                propertyes.date = item.date;
            }

            await People.updateOne({ _id: req.params.peopleId }, { $push: { propertyes } }, { new: true });
        })

        await Promise.all(promises);
        res.json({ message: 'Успех!' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

router.put('/:peopleId/discard/:id', auth, roleMiddle(['admin', 'specialist']), (req, res, next) => role(req, res, next, ['specialist']), async (req, res) => {
    try {
        let people = await People.findOneAndUpdate({ _id: req.params.peopleId, propertyes: { $elemMatch: { _id: req.params.id } } }, { $set: { 'propertyes.$.discarded': true } }, { new: true })
            .populate('propertyes.property');

        res.json({ people });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

module.exports = router;