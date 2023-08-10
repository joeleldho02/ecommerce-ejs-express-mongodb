const express = require('express');
const path = require('path');
const logger = require('morgan');
const nocache = require("nocache");
const bodyparser = require('body-parser');
const session = require('express-session');
const { v4:uuidv4 } = require('uuid');

const connectDB = require('./server/database/connection');

const dotenv = require('dotenv');
dotenv.config({path:'config.env'});


const app = express();
const PORT = process.env.PORT || 8080;

const adminRouter = require('./routes/adminRoute');
const userRouter = require('./routes/userRoute');
const homeRouter = require('./routes/homeRoute');

//log requests
app.use(logger('dev'));

//monogodb connection
connectDB();

//nocache
app.use(nocache()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//parse request to body-parser
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

app.use(session({
    secret: uuidv4(), 
    cookie: {maxAge:1800000},
    saveUninitialized: true
}))

app.set("view engine", "ejs");
app.set('views', [
    path.join(__dirname, 'views'), 
    path.join(__dirname, 'views/home/'), 
    path.join(__dirname, 'views/admin/'),
    path.join(__dirname, 'views/user/')
]);

app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/img", express.static(path.join(__dirname, "public/img")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use("/assets2", express.static(path.join(__dirname, "public/assets2")));

app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/', homeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error', {errStatus : err.status || 500});
    console.log(err.message);
});

app.listen(PORT,()=>{
    console.log(`Server started on http://localhost:${PORT}`);
})

module.exports = app;