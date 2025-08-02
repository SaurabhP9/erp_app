export async function healthCheck(req, res) {
    try {
        res.json("server health is OK");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}