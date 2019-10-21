const express = require('express');
const bodyParser = require('body-parser');
const defaultController = require('./controllers/defaultController');

const app = express()
const port = 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/', defaultController.index);

app.get('/users', defaultController.getUsers);
app.get('/users/:callerId', defaultController.getUser);
app.post('/users/:callerId/:privateKey', defaultController.saveUser);
app.get('/api/:callerId/:q/:minLivingArea/:maxLivingArea', defaultController.callBooliApi);
app.post('/listings/:callerId/:listingId/:q/:minLivingArea/:maxLivingArea', defaultController.saveListing);
// app.get('/listings', defaultController.getListings);
// app.get('/listings/:listingId', defaultController.getListing);

app.use(defaultController.internalError);
app.use(defaultController.noResourceFound);

app.listen(port, () => {
    console.log(`Server live at port ${port}`);
})