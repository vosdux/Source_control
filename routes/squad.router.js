const { Router } = require('express');
const Squad = require('../models/Squad');
const Station = require('../models/Station');
const People = require('../models/People');
const Archive = require('../models/Archive');
const Norm = require('../models/Norm');
const Rank = require('../models/Rank');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth.middleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
            const err = new Error('Неверный формат');
            err.code = 'EXTENSION';
            return cb(err);
        }
        cb(null, true);
    }
}).single('avatar')

const router = Router();

router.get('/', auth, async (req, res) => {
    try {
        let squads = await Squad.find().skip((req.query.size * req.query.page)).limit(+req.query.size).exec();
        res.json({ squads, totalElements: squads.length })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Что-то пошло не так ' });
    }
});

router.post('/', async (req, res) => {
    try {
        let name = req.body.name;
        await Squad.create({ name });
        let squads = await Squad.find();
        res.json({ squads })
    } catch (error) {
        res.status(500).json({ message: 'Что-то пошло не так ' });
    }
});

router.put('/:squadId', async (req, res) => {
    try {
        await Squad.findByIdAndUpdate(req.params.squadId, { $set: { name: req.body.name } });
        let squads = await Squad.find();
        res.json({ squads })
    } catch (error) {
        res.status(500).json({ message: 'Что-то пошло не так ' });
    }
});

router.delete('/:squadId', async (req, res) => {
    try {
        await Squad.findByIdAndRemove(req.params.squadId);
        let squads = await Squad.find();
        res.json({ squads })
    } catch (error) {
        res.status(500).json({ message: 'Что-то пошло не так ' });
    }
});

router.get('/:squadId', async (req, res) => {
    try {
        const stations = await Station.find({ squad: req.params.squadId }).skip((req.query.size * req.query.page)).limit(+req.query.size).exec();
        res.json({ stations, totalElements: stations.length });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

router.post('/:squadId', async (req, res) => {
    try {
        await Station.create(req.body);
        let stations = await Station.find({ squad: req.body.squad });
        res.json({ stations });
    } catch (error) {
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

router.delete('/:squadId/:stationId', async (req, res) => {
    try {
        await Station.findByIdAndRemove(req.params.stationId);
        let stations = await Station.find({ squad: req.params.squadId });
        res.json({ stations })
    } catch (error) {
        res.status(500).json({ message: 'Что-то пошло не так ' });
    }
});

router.put('/:squadId/:stationId', async (req, res) => {
    try {
        await Station.findByIdAndUpdate(req.params.stationId, { $set: req.body });
        let stations = await Station.find({ squad: req.params.squadId });
        res.json({ stations })
    } catch (error) {
        res.status(500).json({ message: 'Что-то пошло не так ' });
    }
});

router.get('/:squadId/:stationId', async (req, res) => {
    try {
        let findObj = {station: req.params.stationId};
        if (req.query.search) {
            findObj = { station: req.params.stationId, $text: { $search: req.query.search } };
        }
        const peoples = await People.find(findObj, { name: 1, secondName: 1, midleName: 1, rank: 1, position: 1, idcard: 1 })
            .sort({ secondName: 1 })
            .populate('rank')
            .skip((req.query.size * req.query.page))
            .limit(+req.query.size)
            .exec();
        res.json({ peoples, totalElements: peoples.length });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

router.get('/:squadId/:stationId/:peopleId', async (req, res) => {
    try {
        const people = await People.findById(req.params.peopleId).populate('rank').populate('propertyes.property').exec();
        const norm = await Norm.findOne({ owners: { "$in": people.rank._id } }).populate('properties.property')
        res.json({ people, norm });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

router.put('/:squadId/:stationId/:peopleId', async (req, res) => {
    try {
        await People.findByIdAndUpdate(req.params.peopleId, { $set: req.body });
        let people = await People.findById(req.params.peopleId);
        res.json({ people });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

router.delete('/:squadId/:stationId/:peopleId', async (req, res) => {
    try {
        let people = await People.findByIdAndRemove(req.params.peopleId);
        people = JSON.parse(JSON.stringify(people));
        delete people._id;
        const arch = await Archive.create(people)
        res.json({ message: 'Успех!', arch });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

router.post('/:squadId/:stationId/', async (req, res) => {
    try {
        upload(req, res, err => {
            if (err && err.code === 'LIMIT_FILE_SIZE') {
                throw new Error('Картинка не более 2мб')
            }
            if (err && err.code === 'EXTENSION') {
                throw new Error('Только jpg или png')
            }
        });

        await People.create(req.body);
        res.json({ message: 'Успех!' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
})

module.exports = router;
