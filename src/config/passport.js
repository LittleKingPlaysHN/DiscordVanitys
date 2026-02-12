const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const db = require("./database");


passport.serializeUser((user, done) => done(null, user.id));


passport.deserializeUser(async (id, done) => {
    try {
        const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
        done(null, rows[0] || null);
    } catch (err) {
        console.error("[PASSPORT] - Error en deserializeUser:", err);
        done(err, null);
    }
});

passport.use(
    new DiscordStrategy(
        {
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_CALLBACK_URL,
            scope: ["identify"]
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                await db.query(
                    "INSERT IGNORE INTO users (id, username, avatar) VALUES (?, ?, ?)",
                    [profile.id, profile.username, profile.avatar]
                );
                return done(null, profile);
            } catch (err) {
                console.error("[PASSPORT] - Error al guardar usuario:", err);
                return done(err, null);
            }
        }
    )
);

module.exports = passport;
