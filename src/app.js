require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path = require("path");

require("./config/passport");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "secreto",
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", require("./routes/auth")); 
app.use("/", require("./routes/index"));    
app.use("/dashboard", require("./routes/dashboard")); 
app.use("/", require("./routes/vanity"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
