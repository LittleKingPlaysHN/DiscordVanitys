const router = require("express").Router();
const db = require("../config/database");

function auth(req, res, next) {
    if (!req.isAuthenticated()) return res.redirect("/auth/discord");
    next();
}

router.get("/", auth, async (req, res) => {
    try {
        await db.query(
            "INSERT IGNORE INTO users (id, username, avatar) VALUES (?, ?, ?)",
            [req.user.id, req.user.username, req.user.avatar]
        );

        const [vanities] = await db.query(
            "SELECT * FROM vanities WHERE user_id = ?",
            [req.user.id]
        );

        res.render("dashboard", { user: req.user, vanities: vanities || [] });
    } catch (err) {
        console.error("[DASHBOARD] - Error al cargar dashboard:", err);
        res.render("dashboard", { user: req.user, vanities: [] });
    }
});

router.post("/vanity", auth, async (req, res) => {
    const { vanity, discord_link } = req.body;
    const userId = req.user.id;

    try {
        const [userVanities] = await db.query(
            "SELECT * FROM vanities WHERE user_id = ?",
            [userId]
        );
        if (userVanities.length >= 5) return res.send("Solo puedes crear 5 vanity links");

        const [vanityRows] = await db.query(
            "SELECT * FROM vanities WHERE vanity = ?",
            [vanity]
        );
        if (vanityRows.length > 0) return res.send("Este vanity ya está en uso");

        if (!/^[a-zA-Z0-9\-]+$/.test(vanity)) return res.send("Vanity inválido");

        await db.query(
            "INSERT INTO vanities (user_id, vanity, discord_link) VALUES (?, ?, ?)",
            [userId, vanity, discord_link]
        );

        res.redirect("/dashboard");
    } catch (err) {
        console.error("[DASHBOARD] - Error al crear vanity:", err);
        res.send("Ocurrió un error, intenta de nuevo.");
    }
});

router.get("/vanities/status", auth, async (req, res) => {
    try {
        const [vanities] = await db.query(
            "SELECT vanity, is_used FROM vanities WHERE user_id = ?",
            [req.user.id]
        );
        res.json(vanities || []);
    } catch (err) {
        console.error("[DASHBOARD] - Error al obtener status de vanities:", err);
        res.json([]);
    }
});

router.get("/vanity/check/:vanity", auth, async (req, res) => {
    const { vanity } = req.params;
    try {
        const [rows] = await db.query(
            "SELECT * FROM vanities WHERE vanity = ?",
            [vanity]
        );
        res.json({ available: rows.length === 0 });
    } catch (err) {
        console.error("[DASHBOARD] - Error al chequear vanity:", err);
        res.json({ available: false });
    }
});

router.post("/vanity/delete", auth, async (req, res) => {
    const { vanity } = req.body;
    const userId = req.user.id;

    try {
        const [rows] = await db.query(
            "SELECT id FROM vanities WHERE user_id = ? AND vanity = ?",
            [userId, vanity]
        );

        if (!rows.length) return res.send("Vanity no encontrado");

        const vanityId = rows[0].id;

        await db.query(
            "DELETE FROM vanity_visits WHERE vanity_id = ?",
            [vanityId]
        );

        await db.query(
            "DELETE FROM vanities WHERE id = ?",
            [vanityId]
        );

        res.redirect("/dashboard");
    } catch (err) {
        console.error("[DASHBOARD] - Error al eliminar vanity:", err);
        res.send("Ocurrió un error al eliminar el vanity.");
    }
});

module.exports = router;
