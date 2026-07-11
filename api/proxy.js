export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: "Missing url parameter" });
    }

    try {
        const response = await fetch(url, {
            headers: {
                "x-api-key": req.headers["x-api-key"] || "",
            }
        });

        const contentType = response.headers.get("content-type");
        if (contentType) {
            res.setHeader("Content-Type", contentType);
        }

        res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}