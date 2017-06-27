app.get('/about', (req, res) => {
  res.render('about.hbs', {
    pageTitle: 'About Page'
  });
});

app.get('/home', (req, res) => {
  res.render('home.hbs', {
    pageTitle: 'Home Page'
  });
});

app.get('/bad', (req, res) => {
  res.send({
    errorMessage: 'Bad Request'
  });
});
