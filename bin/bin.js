#!/usr/bin/env node

let program = require("commander");
let { version } = require("../package.json");
let { getShowsResponse, getVideosResponse, downloadVideo } = require("./util");

let DEFAULT_LIMIT = 100;
let FILTERS = [];

program
  .version(version)
  .option(
    "--api-key <key>",
    "required: individual API key for the Giant Bomb API"
  )
  .option(
    "--show-regex <string>",
    "required: search shows for first show title that matches regex"
  )
  .option(
    "--video-number <number>",
    "video number to download (most recent = 0)",
    0
  )
  .option(
    "--video-regex <string>",
    "search show for first video name that matches regex"
  )
  .option("--only-premium", "show only premium versions")
  .option("--only-free", "show only free versions")
  .option("--quality <hd/high/low>", "video quality to download", "hd")
  .option("--out-dir <path>", "specify output directory", "./")
  .option("--info", "show selected video info instead of downloading")
  .option("--clean", "ignore previous cache results for query")
  .parse(process.argv);

if (!program.apiKey) {
  console.error("--api-key not provided");
  process.exit(1);
} else if (!program.showRegex) {
  console.error("--show-regex not provided");
  process.exit(1);
} else if (!program.videoRegex && !program.videoNumber) {
  console.error("--video-regex or --video-number must be provided");
  process.exit(1);
}

if (program.onlyPremium) {
  FILTERS.push("premium:true");
} else if (program.onlyFree) {
  FILTERS.push("premium:false");
}

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

let main = async () => {
  let show = await getShow({
    apiKey: program.apiKey,
    regexString: program.showRegex,
    clean: program.clean
  });

  if (!show) {
    console.error("no show found for query");
    process.exit(1);
  }

  FILTERS.push(`video_show:${show.id}`);

  const video = await getVideo({
    apiKey: program.apiKey,
    regexString: program.videoRegex,
    videoNumber: program.videoNumber,
    clean: program.clean,
    filters: FILTERS
  });

  if (!video) {
    console.error("no video found for query");
    process.exit(1);
  }

  if (program.info) {
    console.log(video);
    process.exit(0);
  }

  await downloadVideo({
    video,
    apiKey: program.apikey,
    outDir: program.outDir,
    quality: program.quality
  });
};

main();
