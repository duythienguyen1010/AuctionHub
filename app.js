//require modules
const express = require("express");
const morgan = require("morgan");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const tradeRoutes = require("./routes/tradeRoutes");
const mainRoutes = require("./routes/mainRoutes");
const userRoutes = require("./routes/userRoutes");
const offerRoutes = require("./routes/offerRoutes");

//create app
const app = express();

//configure app
const PORT = process.env.PORT || 3030;
const AUTHNAME = process.env.AUTHNAME || "";
const AUTHPASS = process.env.AUTHPASS || "";
const SECRET = process.env.SECRET || "";
app.set("view engine", "ejs");

//connect to database
mongoose
    .connect(
        `mongodb+srv://${AUTHNAME}:${AUTHPASS}@cluster0.6oiuqql.mongodb.net/?retryWrites=true&w=majority`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => {
        //start the server
        app.listen(PORT, () => {
            console.log("Server started on port ", PORT);
        });
    })
    .catch((err) => console.log(err.message));

//mount middleware
app.use(
    session({
        secret: SECRET,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            mongoUrl: `mongodb+srv://${AUTHNAME}:${AUTHPASS}@cluster0.6oiuqql.mongodb.net/?retryWrites=true&w=majority`,
        }),
        cookie: { maxAge: 60 * 60 * 1000 },
    })
);

app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.errorMessages = req.flash("error");
    res.locals.successMessages = req.flash("success");
    next();
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(methodOverride("_method"));

//set up routes
app.use("/trades", tradeRoutes);
app.use("/", mainRoutes);
app.use("/users", userRoutes);
app.use("/offers", offerRoutes);

app.use((req, res, next) => {
    let err = new Error("The server cannot locate " + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (!err.status) {
        err.status = 500;
        err.message = "Internal Server Error";
    }
    res.status(err.status);
    res.render("main/error", { error: err });
});
