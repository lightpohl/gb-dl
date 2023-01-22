const stream = require("stream");
const { promisify } = require("util");
const got = require("got");
const fs = require("fs");
const path = require("path");
const filenamify = require("filenamify");
const dayjs = require("dayjs");
const throttle = require("throttle-debounce").throttle;

const pipeline = promisify(stream.pipeline);

const MAX_DEPTH = 10;
const DEFAULT_LIMIT = 100;
const RATE_LIMIT_MS = 1000;
let LAST_FETCH_CALL = null;

const healthCheck = async ({ apiKey, debug }) => {
  const apiKeyParam = `&api_key=${apiKey}`;
  const limitParam = `&limit=10`;

  const searchTestUrl = `https://www.giantbomb.com/api/search?format=json&resources=video&query="Giant Bombcast"${apiKeyParam}`;
  const showTestUrl = `https://www.giantbomb.com/api/video_shows?format=json${limitParam}${apiKeyParam}`;
  const videosTestUrl = `https://www.giantbomb.com/api/videos/?format=json${limitParam}${apiKeyParam}`;
  const videoGuidTestUrl = `https://www.giantbomb.com/api/video/2970-21807?format=json&${apiKeyParam}`;

  try {
    const body = await got(searchTestUrl).json();

    if (!body) {
      throw new Error("no response body");
    }

    if (body.status_code !== 1) {
      throw new Error(body.error);
    }

    console.log("Search API ✅");
  } catch (error) {
    console.error("Search API ❌");

    if (debug) {
      console.error(error);
    }
  }

  await rateLimit(debug);

  try {
    const body = await got(showTestUrl).json();

    if (!body) {
      throw new Error("no response body");
    }

    if (body.status_code !== 1) {
      throw new Error(body.error);
    }

    console.log("Show List API ✅");
  } catch (error) {
    console.error("Show List API ❌");

    if (debug) {
      console.error(error);
    }
  }

  await rateLimit(debug);

  try {
    const body = await got(videosTestUrl).json();

    if (!body) {
      throw new Error("no response body");
    }

    if (body.status_code !== 1) {
      throw new Error(body.error);
    }

    console.log("Videos API ✅");
  } catch (error) {
    console.error("Videos API ❌");

    if (debug) {
      console.error(error);
    }
  }

  await rateLimit(debug);

  try {
    const body = await got(videoGuidTestUrl).json();

    if (!body) {
      throw new Error("no response body");
    }

    if (body.status_code !== 1) {
      throw new Error(body.error);
    }

    console.log("Video GUID API ✅");
  } catch (error) {
    console.error("Video GUID API ❌");

    if (debug) {
      console.error(error);
    }
  }
};

const rateLimit = (debug) => {
  return new Promise((resolve) => {
    if (!LAST_FETCH_CALL) {
      LAST_FETCH_CALL = Date.now();
      resolve();
      return;
    }

    const diffMs = Date.now() - LAST_FETCH_CALL;
    if (diffMs < RATE_LIMIT_MS) {
      const delayMs = Math.max(RATE_LIMIT_MS - diffMs, 0);

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

const videosFieldList = [
  "name",
  "deck",
  "publish_date",
  "guid",
  "id",
  "api_detail_url",
  "site_detail_url",
  "hd_url",
  "high_url",
  "low_url",
  "premium",
  "video_show",
];

const searchFieldList = [...videosFieldList, "video_show"];
const searchFieldListParam = `&field_list=${searchFieldList.join(",")}`;
const baseSearchUrl = `https://www.giantbomb.com/api/search?format=json&resources=video${searchFieldListParam}`;
const baseVideoUrl = ` https://www.giantbomb.com/api/video`;

const getVideoByGuid = async ({ apiKey, clean, debug, videoGuid }) => {
  let result = null;
  const requestUrl = `${baseVideoUrl}/${videoGuid}?api_key=${apiKey}&format=json`;

  const cacheData = clean ? null : readCache(requestUrl);
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

  const body = await got(requestUrl).json();

  if (!body) {
    console.error("no video response body");
    return null;
  }

  if (body.status_code !== 1) {
    console.error(body.error);
    return null;
  }

  result = body.results;
  return result;
};

const getVideoSearch = async ({
  apiKey,
  videoName,
  showName,
  isOnlyFree,
  isOnlyPremium,
  clean,
  debug,
}) => {
  let result = null;
  const showRegex = showName ? new RegExp(showName, "ig") : null;
  const videoRegex = videoName ? new RegExp(videoName, "ig") : null;

  const query = showRegex ? `${showName} ${videoName}` : videoName;
  const queryParam = `&query="${query}"`;
  const apiKeyParam = `&api_key=${apiKey}`;

  const requestUrl = `${baseSearchUrl}${apiKeyParam}${queryParam}`;

  const cacheData = clean ? null : readCache(requestUrl);
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

  const body = await got(requestUrl).json();

  if (!body) {
    console.error("search: no response body");
    return null;
  }

  if (body.status_code !== 1) {
    console.error(body.error);
    return null;
  }

  const { results } = body;
  result = results.find((video) => {
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

  if (!result) {
    return null;
  }

  /*
    The Giant Bomb API has a bug where video quality URLs will be missing in some search responses.
    Grabbing the details for the direct URL mitigates this issue.
    @see https://github.com/lightpohl/gb-dl/issues/2
  */
  if (result.api_detail_url) {
    await rateLimit(debug);
    const detailsResponse = await got(
      `${result.api_detail_url}?format=json${apiKeyParam}`
    ).json();

    if (detailsResponse.result) {
      result = detailsResponse.result;
    }
  }

  return writeCache({ key: requestUrl, data: result });
};

const getShow = async ({ apiKey, name, clean, debug }) => {
  let result = null;
  const regex = new RegExp(name, "ig");
  let offset = 0;
  const limit = DEFAULT_LIMIT;
  let totalShows = Infinity;

  while (!result && offset < totalShows) {
    const response = await getShowsResponse({
      apiKey,
      limit,
      offset,
      clean,
      debug,
    });

    /*
      The Giant Bomb API is returning an incorrect 'number_of_total_results'.
      It is currently always the value of the provided offset (i.e. 100).
      This is a hacky workaround to manually check a second page of results and will work
      until Giant Bomb has >200 shows.
      @see https://github.com/lightpohl/gb-dl/issues/12
    */
    totalShows = response.number_of_total_results + 1;

    const { results } = response;
    result = results.find((show) => {
      return regex.test(show.title);
    });

    offset += limit;
  }

  return result;
};

const getVideo = async ({
  apiKey,
  name,
  number,
  reverse,
  filters,
  clean,
  debug,
}) => {
  let result = null;

  if (name) {
    const nameRegex = new RegExp(name, "ig");
    let totalVideos = Infinity;
    let attempts = 0;
    let offset = 0;

    while (!result && offset < totalVideos) {
      const response = await getVideosResponse({
        apiKey,
        offset,
        filters,
        clean,
        debug,
        limit: DEFAULT_LIMIT,
      });

      totalVideos = response.number_of_total_results;

      const { results } = response;
      result = results.find((video) => {
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
    const response = await getVideosResponse({
      apiKey,
      filters,
      clean,
      debug,
      reverse,
      offset: number,
      limit: 1,
    });

    const { results } = response;
    result = results[0];
  }

  return result;
};

const showsFieldList = ["id", "title"];
const showsFieldListParam = `&field_list${showsFieldList.join(",")}`;
const baseShowsUrl = `https://www.giantbomb.com/api/video_shows?format=json${showsFieldListParam}`;

const getShowsResponse = async ({ apiKey, limit, offset, clean, debug }) => {
  const apiKeyParam = `&api_key=${apiKey}`;
  const limitParam = `&limit=${limit}`;
  const offsetParam = `&offset=${offset}`;

  const requestUrl = `${baseShowsUrl}${apiKeyParam}${limitParam}${offsetParam}`;

  const cacheData = clean ? null : readCache(requestUrl);
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

  const body = await got(requestUrl).json();

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

const videosFieldListParam = `&field_list=${videosFieldList.join(",")}`;
const baseVideosUrl = `https://www.giantbomb.com/api/videos/?format=json${videosFieldListParam}`;

const getVideosResponse = async ({
  apiKey,
  offset,
  limit,
  filters,
  reverse,
  clean,
  debug,
}) => {
  const apiKeyParam = `&api_key=${apiKey}`;
  const limitParam = `&limit=${limit}`;
  const offsetParam = `&offset=${offset}`;
  const filterParam = `&filter=${filters.join(",")}`;
  const sortParam = reverse ? "&sort=id:asc" : "";
  const requestUrl = `${baseVideosUrl}${apiKeyParam}${limitParam}${offsetParam}${filterParam}${sortParam}`;

  const cacheData = clean ? null : readCache(requestUrl);
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

  const body = await got(requestUrl).json();

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

const BYTES_IN_MB = 1000000;

const printProgress = throttle(500, ({ percent, total, transferred }) => {
  if (!process.stdout.isTTY) {
    return;
  }

  let line = `downloading...`;

  if (transferred > 0 && percent < 1) {
    const percentRounded = (percent * 100).toFixed(2);
    line += ` ${percentRounded}%`;

    if (total) {
      const totalMBs = total / BYTES_IN_MB;
      const roundedTotalMbs = totalMBs.toFixed(2);
      line += ` of ${roundedTotalMbs} MB`;
    }
  }

  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(line);
});

const endPrintProgress = () => {
  if (!process.stdout.isTTY) {
    return;
  }

  process.stdout.write("\n");
};

const downloadVideo = async ({
  apiKey,
  video,
  quality,
  outDir,
  debug,
  archive,
  blocklist,
  addGuidPrefix,
  addDatePrefix,
}) => {
  const publishDate = dayjs(new Date(video.publish_date));
  let qualityUrl =
    quality === "highest"
      ? getHighestQualityUrl(video)
      : video[`${quality}_url`];

  if (!qualityUrl) {
    console.error(`quality ${quality} not found for ${video.name}`);
    process.exit(1);
  }

  let downloadUrl = `${qualityUrl}?api_key=${apiKey}`;
  const showTitle =
    video.video_show && video.video_show.title ? video.video_show.title : null;

  /*
    The Giant Bomb API isn't returning the highest bitrate version
    for newer videos. We manually check for this highest quality as a workaround.
    @see https://github.com/lightpohl/gb-dl/issues/4
  */
  if (quality === "highest" && qualityUrl.includes("_4000.")) {
    const maxBitrateUrl = `${qualityUrl.replace("_4000.", "_8000.")}`;
    const maxBitrateDownloadUrl = `${maxBitrateUrl}?api_key=${apiKey}`;

    try {
      await rateLimit(debug);
      await got(maxBitrateDownloadUrl, {
        timeout: 5000,
        method: "HEAD",
        responseType: "json",
      });

      qualityUrl = maxBitrateUrl;
      downloadUrl = maxBitrateDownloadUrl;
    } catch (error) {
      // do nothing
    }
  }

  if (archive && isInArchive(qualityUrl)) {
    console.log(`${video.name} at ${quality} quality exists in archive`);
    console.log("skipping download...");
    return;
  }

  if (blocklist && showTitle && isInBlocklist(showTitle)) {
    console.log(`show "${showTitle}" exists in blocklist`);
    console.log("ignoring...");
    return;
  }

  const safeFilename = filenamify(video.name, { replacement: "_" });
  const fileExt = path.extname(qualityUrl);
  let fullFilename =
    addGuidPrefix && video.guid
      ? `${video.guid} - ${safeFilename}${fileExt}`
      : `${safeFilename}${fileExt}`;
  fullFilename = addDatePrefix
    ? `${publishDate.format("YYYY-MM-DD")} - ${fullFilename}`
    : fullFilename;

  const outputPath = path.resolve(process.cwd(), outDir, fullFilename);
  const tempOutputPath = `${outputPath}.tmp`;
  const removeFile = () => {
    if (fs.existsSync(tempOutputPath)) {
      fs.unlinkSync(tempOutputPath);
    }
  };

  if (fs.existsSync(outputPath)) {
    console.log("video exists locally. skipping download...");
    return;
  }

  console.log(`starting download for ${video.name}`);
  console.log(`video url: ${qualityUrl}`);
  console.log(`output path: ${outputPath}`);

  await rateLimit(debug);
  await got(downloadUrl, {
    timeout: 5000,
    method: "HEAD",
    responseType: "json",
  });

  await rateLimit(debug);
  try {
    await pipeline(
      got
        .stream(downloadUrl)
        .on("downloadProgress", (progress) => {
          printProgress(progress);
        })
        .on("end", () => {
          printProgress.cancel();
          endPrintProgress();
          console.log("download complete!");
        }),
      fs.createWriteStream(tempOutputPath)
    );
  } catch (error) {
    removeFile();
    throw error;
  }

  const fileSize = fs.statSync(tempOutputPath).size;

  if (fileSize === 0) {
    removeFile();
    throw new Error("Unable to save video. Suggestion: verify permissions");
  }

  fs.renameSync(tempOutputPath, outputPath);

  if (archive) {
    writeToArchive(qualityUrl);
  }
};

const qualityList = ["hd", "high", "low", "mobile"];
const getHighestQualityUrl = (video) => {
  let highestQualityUrl = null;
  for (let i = 0; i < qualityList.length; i++) {
    const quality = qualityList[i];
    const qualityUrl = video[`${quality}_url`];

    if (qualityUrl) {
      highestQualityUrl = qualityUrl;
      break;
    }
  }

  return highestQualityUrl;
};

const cachePath = path.resolve(process.cwd(), "gb-dl-cache.json");
const writeCache = ({ key, data }) => {
  let cache = {};

  if (fs.existsSync(cachePath)) {
    cache = JSON.parse(fs.readFileSync(cachePath));
  }

  cache[key] = {
    data,
    ts: Date.now(),
  };

  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 4));
  return data;
};

const isExpiredTimestamp = (ts) => {
  const timeDiffMs = Date.now() - ts;
  const timeDiffInMinutes = Math.floor(timeDiffMs / 1000 / 60);

  return timeDiffInMinutes > 60;
};

const readCache = (key) => {
  if (!fs.existsSync(cachePath)) {
    return null;
  }

  const cache = JSON.parse(fs.readFileSync(cachePath));

  if (!cache[key]) {
    return null;
  }

  const { ts, data } = cache[key];

  if (isExpiredTimestamp(ts)) {
    return null;
  }

  return data;
};

const trimCache = (debug) => {
  if (!fs.existsSync(cachePath)) {
    return;
  }

  const cache = JSON.parse(fs.readFileSync(cachePath));
  const trimmedCache = Object.keys(cache).reduce((acc, key) => {
    const cacheItem = cache[key];

    if (isExpiredTimestamp(cacheItem.ts)) {
      if (debug) {
        console.log(`trimming cache result for ${key}`);
      }
      return acc;
    }

    return Object.assign(acc, { [key]: cacheItem });
  }, {});

  fs.writeFileSync(cachePath, JSON.stringify(trimmedCache, null, 4));
};

const archivePath = path.resolve(process.cwd(), "gb-dl-archive.json");
const writeToArchive = (downloadUrl) => {
  let archive = [];

  if (fs.existsSync(archivePath)) {
    archive = JSON.parse(fs.readFileSync(archivePath));
  }

  if (!archive.includes(downloadUrl)) {
    archive.push(downloadUrl);
  }

  fs.writeFileSync(archivePath, JSON.stringify(archive, null, 4));
};

const isInArchive = (downloadUrl) => {
  if (!fs.existsSync(archivePath)) {
    return false;
  }

  const archive = JSON.parse(fs.readFileSync(archivePath));

  return archive.includes(downloadUrl);
};

const blocklistPath = path.resolve(process.cwd(), "gb-dl-blocklist.json");
const isInBlocklist = (showTitle) => {
  if (!fs.existsSync(blocklistPath)) {
    return false;
  }

  const blocklist = JSON.parse(fs.readFileSync(blocklistPath));

  return blocklist.includes(showTitle);
};

module.exports = {
  getVideoSearch,
  getShow,
  getVideo,
  getVideoByGuid,
  getShowsResponse,
  getVideosResponse,
  downloadVideo,
  trimCache,
  healthCheck,
};
