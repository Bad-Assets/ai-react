/** Should be able to route to 2 pages
 * 1. the constellation sky: this will be shown through the whole exhibit and will be the main page
 * 2. search page: this will let the user search for a specific constellation after Imagine RIT
 */

// const router = (app) => {
//   app.get('/', (req, res) => {
//     res.render('index.js');
//   });
// };

// module.exports = router;

const controllers = require('./controllers');

const router = (app) => {
  app.get('/', controllers.index);
};

module.exports = router;
