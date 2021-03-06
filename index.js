require('dotenv').config();         // read environment variables from .env file
const express = require('express');
const cors = require('cors');       // middleware to enable CORS (Cross-Origin Resource Sharing)

const app = express();
const port = process.env.PORT;	 	
//const host = process.env.HOST; 	

// const corsOptions = {
//     // origin: "http://localhost:8081"
// };

app.use(cors()); //enable CORS requests from http://localhost:8081
app.use(express.json()); //enable parsing JSON body data

// root route -- /api/
app.get('/', function (req, res) {
    res.status(200).json({ message: 'home -- CALYPSO api' });
});

// routing middleware
app.use('/users', require('./routes/users.routes.js'))
app.use('/movies', require('./routes/movies.routes.js'))
app.use('/series', require('./routes/series.routes.js'))
app.use('/quizzes', require('./routes/quizzes.routes.js'))
app.use('/badges', require('./routes/badges.routes.js'))


// handle invalid routes
app.get('*', function (req, res) {
    res.status(404).json({ message: 'WHAT???' });
})


// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 8000;
// }
// app.listen(port);
app.listen(port, () => console.log(`App listening at Port: ${port}`));