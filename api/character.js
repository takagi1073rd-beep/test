const candidateUrls = (id) => [
  `https://lhrpg.com/lhz/api/${id}.json`,
  `https://lhrpg.com/lhz/sheets/${id}.json`,
  `http://lhrpg.com/lhz/sheets/${id}.json`,
  `https://lhrpg.com/lhz/api/pc?id=${id}`,
  `http://lhrpg.com/lhz/api/pc?id=${id}`,
  `https://lhrpg.com/lhz/api/sheets/${id}.json`,
  `http://lhrpg.com/lhz/api/sheets/${id}.json`
];

export default async function handler(request, response) {
  const id = String(request.query.id || "").match(/^\d+$/)?.[0];

  if (!id) {
    response.status(400).json({ error: "キャラクターIDが不正です。" });
    return;
  }

  const errors = [];

  for (const url of candidateUrls(id)) {
    try {
      const upstream = await fetch(url, {
        headers: {
          accept: "application/json,text/plain,*/*",
          "user-agent": "lhchat-cocofolia-converter/1.0"
        }
      });

      if (!upstream.ok) {
        errors.push(`${url}: ${upstream.status}`);
        continue;
      }

      const text = await upstream.text();
      const json = JSON.parse(text);

      response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
      response.status(200).json(json);
      return;
    } catch (error) {
      errors.push(`${url}: ${error.message}`);
    }
  }

  response.status(502).json({
    error: "ログ・ホライズンTRPGのJSON APIからデータを取得できませんでした。",
    details: errors
  });
}
