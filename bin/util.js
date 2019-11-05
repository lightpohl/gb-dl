let got = require("got");
let fs = require("fs");
let path = require("path");
let filenamify = require("filenamify");

let DEFAULT_LIMIT = 100;

let getShow = async ({ apiKey, regexString, clean }) => {
  let result = null;
  let regex = new RegExp(regexString);
  let offset = 0;
  let limit = DEFAULT_LIMIT;
  let totalShows = Infinity;

  while (!result && offset < totalShows) {
    let response = await getShowsResponse({
      apiKey,
      limit,
      offset,
      clean
    });

    totalShows = response.number_of_total_results;

    let { results } = response;
    result = results.find(show => {
      return regex.test(show.title);
    });

    offset += limit;
  }

  return result;
};

let getVideo = async ({ apiKey, regexString, videoNumber, filters, clean }) => {
  let result = null;

  if (regexString) {
    let nameRegex = new RegExp(regexString);
    let totalVideos = Infinity;
    let offset = 0;

    while (!result && offset < totalVideos) {
      let response = await getVideosResponse({
        apiKey,
        offset,
        filters,
        clean,
        limit: DEFAULT_LIMIT
      });

      totalVideos = response.number_of_total_results;

      let { results } = response;
      result = results.find(video => {
        return nameRegex.test(video.name);
      });

      offset += DEFAULT_LIMIT;
    }
  } else {
    let response = await getVideosResponse({
      apiKey,
      limit: 1,
      offset: videoNumber,
      filters,
      clean
    });

    let { results } = response;
    result = results[0];
  }

  return result;
};

let showsFieldList = ["id", "title"];
let showsFieldListParam = `&field_list${showsFieldList.join(",")}`;
let baseShowsUrl = `https://www.giantbomb.com/api/video_shows?format=json${showsFieldListParam}`;

let getShowsResponse = async ({ apiKey, limit, offset, clean }) => {
  let apiKeyParam = `&api_key=${apiKey}`;
  let limitParam = `&limit=${limit}`;
  let offsetParam = `&offset=${offset}`;

  let requestUrl = `${baseShowsUrl}${apiKeyParam}${limitParam}${offsetParam}`;

  let cacheData = clean ? null : readCache(requestUrl);
  if (cacheData) {
    console.log(`cache result found for ${requestUrl}`);
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

let videosFieldList = [
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

let videosFieldListParam = `&field_list=${videosFieldList.join(",")}`;
let baseVideosUrl = `https://www.giantbomb.com/api/videos/?format=json${videosFieldListParam}`;

let getVideosResponse = async ({ apiKey, offset, limit, filters, clean }) => {
  let apiKeyParam = `&api_key=${apiKey}`;
  let limitParam = `&limit=${limit}`;
  let offsetParam = `&offset=${offset}`;
  let filterParam = `&filter=${filters.join(",")}`;
  let requestUrl = `${baseVideosUrl}${apiKeyParam}${limitParam}${offsetParam}${filterParam}`;

  let cacheData = clean ? null : readCache(requestUrl);
  if (cacheData) {
    console.log(`cache result found for ${requestUrl}`);
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

  let safeFilename = filenamify(video.name, { replacement: "_" });
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

let cachePath = path.resolve(process.cwd(), "gb-dl-cache.json");
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

module.exports = {
  getShow,
  getVideo,
  getShowsResponse,
  getVideosResponse,
  downloadVideo
};
