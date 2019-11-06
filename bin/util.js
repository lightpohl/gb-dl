let got = require("got");
let fs = require("fs");
let path = require("path");
let filenamify = require("filenamify");

let MAX_DEPTH = 10;
let DEFAULT_LIMIT = 100;
let RATE_LIMIT_MS = 1000;
let LAST_FETCH_CALL = null;

let rateLimit = debug => {
  return new Promise(resolve => {
    if (!LAST_FETCH_CALL) {
      LAST_FETCH_CALL = Date.now();
      resolve();
      return;
    }

    let diffMs = Date.now() - LAST_FETCH_CALL;
    if (diffMs < RATE_LIMIT_MS) {
      let delayMs = Math.max(RATE_LIMIT_MS - diffMs, 0);

      if (debug) {
        console.log(`delaying request for ${delayMs}ms`);
      }

      setTimeout(() => {
        LAST_FETCH_CALL = Date.now();
        resolve();
      }, delayMs);
    } else {
      resolve();
    }
  });
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
  "low_url",
  "premium"
];

let searchFieldList = [...videosFieldList, "video_show"];
let searchFieldListParam = `&field_list=${searchFieldList.join(",")}`;
let baseSearchUrl = `https://www.giantbomb.com/api/search?format=json&resources=video${searchFieldListParam}`;

let getVideoSearch = async ({
  apiKey,
  videoName,
  showName,
  isOnlyFree,
  isOnlyPremium,
  clean,
  debug
}) => {
  let result = null;
  let showRegex = showName ? new RegExp(showName, "ig") : null;
  let videoRegex = videoName ? new RegExp(videoName, "ig") : null;

  let query = showRegex ? `${showName} ${videoName}` : videoName;
  let queryParam = `&query="${query}"`;
  let apiKeyParam = `&api_key=${apiKey}`;

  let requestUrl = `${baseSearchUrl}${apiKeyParam}${queryParam}`;

  let cacheData = clean ? null : readCache(requestUrl);
  if (cacheData) {
    if (debug) {
      console.log(`cache result found for ${requestUrl}`);
    }

    return cacheData;
  }

  await rateLimit(debug);

  if (debug) {
    console.log(`fetching ${requestUrl}`);
  }

  let { body } = await got(requestUrl, { json: true });

  if (!body) {
    console.error("search: no response body");
    return null;
  }

  if (body.status_code !== 1) {
    console.error(body.error);
    return null;
  }

  writeCache({ key: requestUrl, data: body });

  let { results } = body;
  result = results.find(video => {
    if (!videoRegex.test(video.name)) {
      return false;
    }

    if (showRegex && !video.video_show) {
      return false;
    }

    if (
      video.video_show &&
      showRegex &&
      !showRegex.test(video.video_show.title)
    ) {
      return false;
    }

    if (isOnlyPremium && !video.premium) {
      return false;
    }

    if (isOnlyFree && video.premium) {
      return false;
    }

    return true;
  });

  return result;
};

let getShow = async ({ apiKey, name, clean, debug }) => {
  let result = null;
  let regex = new RegExp(name, "ig");
  let offset = 0;
  let limit = DEFAULT_LIMIT;
  let totalShows = Infinity;

  while (!result && offset < totalShows) {
    let response = await getShowsResponse({
      apiKey,
      limit,
      offset,
      clean,
      debug
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

let getVideo = async ({ apiKey, name, number, filters, clean, debug }) => {
  let result = null;

  if (name) {
    let nameRegex = new RegExp(name, "ig");
    let totalVideos = Infinity;
    let attempts = 0;
    let offset = 0;

    while (!result && offset < totalVideos) {
      let response = await getVideosResponse({
        apiKey,
        offset,
        filters,
        clean,
        debug,
        limit: DEFAULT_LIMIT
      });

      totalVideos = response.number_of_total_results;

      let { results } = response;
      result = results.find(video => {
        return nameRegex.test(video.name);
      });

      offset += DEFAULT_LIMIT;
      attempts += 1;

      if (attempts === MAX_DEPTH) {
        console.error("max search depth exceeded");
        console.log("suggestion: refine search params");
        process.exit(1);
      }
    }
  } else {
    let response = await getVideosResponse({
      apiKey,
      limit: 1,
      offset: number,
      filters,
      clean,
      debug
    });

    let { results } = response;
    result = results[0];
  }

  return result;
};

let showsFieldList = ["id", "title"];
let showsFieldListParam = `&field_list${showsFieldList.join(",")}`;
let baseShowsUrl = `https://www.giantbomb.com/api/video_shows?format=json${showsFieldListParam}`;

let getShowsResponse = async ({ apiKey, limit, offset, clean, debug }) => {
  let apiKeyParam = `&api_key=${apiKey}`;
  let limitParam = `&limit=${limit}`;
  let offsetParam = `&offset=${offset}`;

  let requestUrl = `${baseShowsUrl}${apiKeyParam}${limitParam}${offsetParam}`;

  let cacheData = clean ? null : readCache(requestUrl);
  if (cacheData) {
    if (debug) {
      console.log(`cache result found for ${requestUrl}`);
    }

    return cacheData;
  }

  await rateLimit(debug);

  if (debug) {
    console.log(`fetching ${requestUrl}`);
  }

  let { body } = await got(requestUrl, { json: true });

  if (!body) {
    console.error("shows: no response body");
    process.exit(1);
  }

  if (body.status_code !== 1) {
    console.error(body.error);
    process.exit(1);
  }

  return writeCache({ key: requestUrl, data: body });
};

let videosFieldListParam = `&field_list=${videosFieldList.join(",")}`;
let baseVideosUrl = `https://www.giantbomb.com/api/videos/?format=json${videosFieldListParam}`;

let getVideosResponse = async ({
  apiKey,
  offset,
  limit,
  filters,
  clean,
  debug
}) => {
  let apiKeyParam = `&api_key=${apiKey}`;
  let limitParam = `&limit=${limit}`;
  let offsetParam = `&offset=${offset}`;
  let filterParam = `&filter=${filters.join(",")}`;
  let requestUrl = `${baseVideosUrl}${apiKeyParam}${limitParam}${offsetParam}${filterParam}`;

  let cacheData = clean ? null : readCache(requestUrl);
  if (cacheData) {
    if (debug) {
      console.log(`cache result found for ${requestUrl}`);
    }

    return cacheData;
  }

  await rateLimit(debug);

  if (debug) {
    console.log(`fetching ${requestUrl}`);
  }

  let { body } = await got(requestUrl, { json: true });

  if (!body) {
    console.error("videos: no response body");
    process.exit(1);
  }

  if (body.status_code !== 1) {
    console.error(body.error);
    process.exit(1);
  }

  return writeCache({ key: requestUrl, data: body });
};

let downloadVideo = async ({ apiKey, video, quality, outDir, debug }) => {
  let qualityUrl =
    quality === "highest"
      ? getHighestQualityUrl(video)
      : video[`${quality}_url`];

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

  await rateLimit(debug);
  got.stream(downloadUrl).pipe(fs.createWriteStream(outputPath));
};

let qualityList = ["hd", "high", "low", "mobile"];
let getHighestQualityUrl = video => {
  let highestQualityUrl = null;
  for (let i = 0; i < qualityList.length; i++) {
    let quality = qualityList[i];
    let qualityUrl = video[`${quality}_url`];

    if (qualityUrl) {
      highestQualityUrl = qualityUrl;
      break;
    }
  }

  return highestQualityUrl;
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
  getVideoSearch,
  getShow,
  getVideo,
  getShowsResponse,
  getVideosResponse,
  downloadVideo
};
