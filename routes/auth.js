const express = require("express");
const router = express.Router();
const {
	sgidClient,
	scopes,
	randomnonce,
} = require("../lib/sgid-client-singleton");
const { formatData } = require("../lib/utils");

router.get("/auth/login/:env?", (req, res) => {
	const env = req.params.env || "prod";
	const authUrl = sgidClient[env].authorizationUrl(
		env,
		scopes,
		randomnonce
	).url;
	res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
	try {
		const { code, state } = req.query;
		const { accessToken } = await sgidClient[state].callback(code, randomnonce);

		// api response for mobile
		if (req.useragent.isMobile) {
			return res.json({ accessToken });
		} else {
			// original callback page for browser
			const { sub, data } = await sgidClient[state].userinfo(accessToken);
			const formattedData = formatData(data);
			// HTML render (SSR) for browser
			return res.render("callback", {
				data: [["sgID", sub], ...formattedData],
			});
		}
	} catch (error) {
		console.error(error);
		res.status(500).render("error", { error });
	}
});

module.exports = router;
