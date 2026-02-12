const router = require("express").Router();
const passport = require("passport");

router.get("/discord", passport.authenticate("discord"));

router.get(
    "/discord/callback",
    passport.authenticate("discord", {
        failureRedirect: "/", 
        failureMessage: true   
    }),
    (req, res) => {
        res.redirect("/dashboard");
    }
);

router.get("/logout", (req, res, next) => {
    req.logout(err => {
        if (err) {
            console.error("[LOGIN] - Error al cerrar sesión:", err);
            return next(err);
        }
        res.redirect("/");
    });
});

module.exports = router;
