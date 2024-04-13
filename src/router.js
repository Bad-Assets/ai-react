/** Should be able to route to 2 pages
 * 1. the constellation sky: this will be shown through the whole exhibit and will be the main page
 * 2. search page: this will let the user search for a specific constellation after Imagine RIT
 */
const { Constellation } = require("../client/components/Constellation");
// import * as Constellation from "../client/components/Constellation";
import io from "socket.io";

const router = (app, socket) => {

    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    app.post('/makeConstellation', (req, res) => {
        makeConstellation(req, res, socket);
    });
}

const makeConstellation = async (req, res, socket) => {
    try {
        const newConstellation = new Constellation({
            id: req.body.id,
            name: req.body.name,
            planet: req.body.planet,
            stars: req.body.stars,
            firstStarCoords: req.body.firstStarCoords,
            props: req.body.props,
        });


        newConstellation.save();
        socket.emit('newConstellationMade', newConstellation);
        return res.status(201).json({ message: 'Constellation created!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occured making the constellation!' });
    }

    return true;
};

module.exports = router;