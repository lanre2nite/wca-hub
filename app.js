const express = require('express');
const morgan = require('morgan'); //a package using middleware function for more info on req and res processes
const mongoose = require('mongoose'); //a module or package for mongodb database
const Upload = require('./models/upload');
const multer = require('multer'); //a package that handles info & file storage
const upload = multer({ dest: './models/uploads/' }); // specifying path for multer storage
const path = require('path')
const app = express();
const port = process.env.PORT || 3000;

//connecting to mongodb
const dbURI = "mongodb+srv://olabagy:Wca123@wcahub.qfpl5gm.mongodb.net/?retryWrites=true&w=majority";
app.set('view engine', 'ejs'); // using view engines
//app.set('views', 'templates'); to specify a different folder for the ejs views

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => console.log('connected to wcahub databases', app.listen(3000)))
  .catch(err => console.log(err));


// Middleware for static files
app.use('/models/uploads', express.static('models/uploads'));
app.use(express.static('public'));
app.use(morgan('dev'));

app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
  });
  
const Schema = mongoose.Schema;
const projectSchema = new Schema({
  username: String,
  date_created: Date,
  author: String,
  title: String,
  remark: String,
  file_path: String
});

// Create a model for research upload from the schema
const Project = mongoose.model('Project', projectSchema);

const userSchema = new Schema({
  fname: String,
  lname: String,
  gender: String,
  username: String,
  email: String,
  password: String
});

// Create a model for user sign up from the schema
const User = mongoose.model('User', userSchema);

app.set('view engine', 'ejs');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

app.post('/upload', upload.single('file'), (req, res) => {
    // Convert date from DD/MM/YYYY to YYYY-MM-DD
    const dateParts = req.body.date_created.split('/');
    const dateISOFormat = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    const newProject = new Project({
      username: req.body.username,
      date_created: new Date(dateISOFormat),
      author: req.body.author,
      title: req.body.title,
      remark: req.body.remark,
      file_path: req.file.path // This is where Multer stores the file
    });
  
    newProject.save()
      .then((result) => {
        console.log(result);
        res.redirect('/');
      })
      .catch((err) => {
        console.error(err);
      });
});

app.get('/models/uploads/:file', function(req, res){
  // Find the document by file path
  Project.findOne({file_path: req.params.file})
    .then(project => {
      if (project) {
        // Resolve the absolute path of the file
        let filePath = path.resolve(project.file_path);
        
        // Set the headers to force file download
        res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(filePath));
        
        // Send the file to the client
        res.sendFile(filePath);
      } else {
        // Handle the case where no document was found
        res.status(404).send('No document found with that file path');
      }
    })
    .catch(err => {
      console.log(err);
    });
});
app.post('/SignIn', (req, res) => { 
    const username = req.body.username;
    const password = req.body.password; // You should hash the password before comparing it
  
    User.findOne({ username: username })
      .then((user) => {
        if (user) {
          // User found, check password
          if (user.password === password) { // In a real-world application, compare hashed passwords
            res.redirect('/'); // Redirect to home page or dashboard
          } else {
            res.send('Incorrect password, navigate to the previous page to input the correct user details');
                }
        } else {
          res.send('User not found, navigate to the previous page to input the correct user details or signup');
          res.redirect('/');
          
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });

// Defining a route for sign up
app.post('/SignUp', (req, res) => {
    const newUser = new User({
      fname: req.body.fname,
      lname: req.body.lname,
      gender: req.body.gender,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password 
    });
  
    newUser.save()
      .then((result) => {
        res.redirect('/');
      })
      .catch((err) => {
        console.error(err);
      });
  });
  
//search for projects
  app.get('/search', function(req, res){
    // Get the search term from the query string
    let searchTerm = req.query.q;
  
    // Find documents that match the search term
    Project.find({$text: {$search: searchTerm}})
      .then(projects => {
        // Send the matching projects to the client
        res.json(projects);
      })
      .catch(err => {
        console.log(err);
      });
  });
// search uploaded project
  function search_projects() {
    // Get the search term from the input field
    let searchTerm = document.getElementById('searchbar').value;
  
    // Send a GET request to /search with the search term as a query parameter
    fetch('/search?q=' + encodeURIComponent(searchTerm))
      .then(response => response.json())
      .then(projects => {
        // Handle the matching projects
        console.log(projects);
      })
      .catch(err => {
        console.log(err);
      });
  }
  app.get('/', (req, res) => {
    Project.find()
      .then((projects) => {
        res.render('index', { title: 'WCA-HUB', projects: projects });
      })
      .catch((err) => {
        console.error(err);
      });
});

app.post('/upload', upload.single('file'), (req, res) => {
    newProject.save()
      .then((result) => {
        console.log(result);
        // Redirect to the '/' route instead of rendering the view directly
        res.redirect('/');
      })
      .catch((err) => {
        console.error(err);
      });
});

app.get('/index.html', (req, res) => {
    res.redirect('/');
});


app.get('/about.html', (req, res) => {
    res.render('about', { title: 'About'});
});

app.get('/contact.html', (req, res) => {
    res.render('contact', { title: 'Contact US'});
});

app.get('/login.html', (req, res) => {
    res.render('login', { title: 'Login'});
});

app.use((req, res) =>{
    res.status(404).render('404', { title: '404'});
});
