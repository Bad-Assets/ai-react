const hostIndex = (req, res) => {
  res.render('index');
};

module.exports = {
  index: hostIndex,
};
