const router = require("express").Router();
const db = require("../config/database");

router.get("/:vanity", async (req, res) => {
    const vanityName = req.params.vanity;

    try {
        const [rows] = await db.query(
            "SELECT * FROM vanities WHERE vanity = ?",
            [vanityName]
        );

        if (!rows.length) {
            return res.status(404).render("404", { vanityName });
        }

        const vanity = rows[0];

        const visitorIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        try {
            await db.query(
                "INSERT INTO vanity_visits (vanity_id, visitor_ip) VALUES (?, ?)",
                [vanity.id, visitorIP]
            );
        } catch (visitErr) {
            console.error("[VANITY] - - Error al registrar visita:", visitErr);
        }

        try {
            const [visits] = await db.query(
                "SELECT COUNT(*) as total FROM vanity_visits WHERE vanity_id = ?",
                [vanity.id]
            );
            console.log(`Vanity /${vanityName} visitado ${visits[0].total} veces`);
        } catch (countErr) {
            console.error("[VANITY] - Error al contar visitas:", countErr);
        }


        res.redirect(vanity.discord_link);

    } catch (err) {
        console.error("[VANITY] - Error al procesar vanity:", err);
        res.status(500).send("Ocurrió un error al procesar el vanity.");
    }
});

module.exports = router;
