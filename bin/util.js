let got = require("got");
let fs = require("fs");
let path = require("path");

let fieldList = [
  "name",
  "deck",
  "publish_date",
  "id",
  "api_detail_url",
  "site_detail_url",
  "hd_url",
  "high_url",
  "low_url"
];

let fieldListParam = `&field_list=${fieldList.join(",")}`;
let baseVideosUrl = `https://www.giantbomb.com/api/videos/?format=json${fieldListParam}`;

let getVideosResponse = async ({ apiKey, offset, limit, filters }) => {
  let apiKeyParam = `&api_key=${apiKey}`;
  let limitParam = `&limit=${limit}`;
  let offsetParam = `&offset=${offset}`;
  let filterParam = `&filter=${filters.join(",")}`;
  let requestUrl = `${baseVideosUrl}${apiKeyParam}${limitParam}${offsetParam}${filterParam}`;

  let cacheData = readCache(requestUrl);
  if (cacheData) {
    return cacheData;
  }

  console.log(`fetching ${requestUrl}`);
  let { body } = await got(requestUrl, { json: true });

  if (!body) {
    console.error("no response body");
    process.exit(1);
  }

  if (body.status_code !== 1) {
    console.error(body.error);
    process.exit(1);
  }

  return writeCache({ key: requestUrl, data: body });
};

let downloadVideo = async ({ apiKey, video, quality, outDir }) => {
  let qualityUrl = video[`${quality}_url`];

  if (!qualityUrl) {
    console.error(`quality ${quality} not found for ${video.name}`);
    process.exit(1);
  }

  let downloadUrl = `${qualityUrl}?api_key=${apiKey}`;

  let safeFilename = video.name.replace(/[^a-z0-9\- ]/gi, "_");
  let fileExt = path.extname(qualityUrl);
  let outputPath = path.resolve(
    process.cwd(),
    outDir,
    `${safeFilename}${fileExt}`
  );

  console.log(`starting download for ${video.name}`);
  console.log(`video url: ${downloadUrl}`);
  console.log(`output path: ${outputPath}`);

  got.stream(downloadUrl).pipe(fs.createWriteStream(outputPath));
};

let cachePath = path.resolve(__dirname, "cache.json");
let writeCache = ({ key, data }) => {
  let cache = {};

  if (fs.existsSync(cachePath)) {
    cache = JSON.parse(fs.readFileSync(cachePath));
  }

  cache[key] = {
    data,
    ts: Date.now()
  };

  fs.writeFileSync(cachePath, JSON.stringify(cache));
  return data;
};

let readCache = key => {
  if (!fs.existsSync(cachePath)) {
    return null;
  }

  let cache = JSON.parse(fs.readFileSync(cachePath));

  if (!cache[key]) {
    return null;
  }

  let { ts, data } = cache[key];

  let timeDiffMs = Date.now() - ts;
  let timeDiffInMinutes = Math.floor(timeDiffMs / 1000 / 60);

  if (timeDiffInMinutes > 60) {
    return null;
  }

  return data;
};

module.exports = { getVideosResponse, downloadVideo };
