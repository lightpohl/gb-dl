#!/usr/bin/env node

let fs = require("fs");
let program = require("commander");
let dayjs = require("dayjs");
let { version } = require("../package.json");
let {
  getVideoSearch,
  getShow,
  getVideo,
  downloadVideo,
  trimCache
} = require("./util");

let filters = [];

program
  .version(version)
  .option(
    "--api-key <key>",
    "required: individual API key for the Giant Bomb API"
  )
  .option("--show-name <string>", "show to filter search by")
  .option("--video-name <string>", "video name to find")
  .option(
    "--video-number <number>",
    "video number to download (most recent = 0)",
    0
  )
  .option("--only-premium", "show only premium versions")
  .option("--only-free", "show only free versions")
  .option(
    "--quality <highest/hd/high/low/mobile>",
    "video quality to download",
    "highest"
  )
  .option("--out-dir <path>", "specify output directory", "./")
  .option(
    "--date-after <string>",
    "MM/DD/YYYY to filter video result (inclusive)"
  )
  .option("--info", "show selected video info instead of downloading")
  .option("--archive", "check if video exists in archive before downloading")
  .option("--clean", "ignore previous cache results for query")
  .option("--debug", "show debug statements")
  .parse(process.argv);

if (!program.apiKey) {
  console.error("--api-key not provided");
  process.exit(1);
} else if (!program.videoName && !program.videoNumber) {
  console.error("--video-name or --video-number must be provided");
  process.exit(1);
} else if (!fs.existsSync(program.outDir)) {
  console.error(`--out-dir ${program.outDir} does not exist`);
  process.exit(1);
}

if (program.onlyPremium) {
  filters.push("premium:true");
} else if (program.onlyFree) {
  filters.push("premium:false");
}

trimCache(program.debug);

let main = async () => {
  let searchResult = null;

  if (program.videoName) {
    searchResult = await getVideoSearch({
      apiKey: program.apiKey,
      videoName: program.videoName,
      showName: program.showName,
      isOnlyPremium: program.onlyPremium,
      isOnlyFree: program.onlyFree,
      clean: program.clean,
      debug: program.debug
    });
  }

  if (searchResult) {
    if (program.info) {
      console.log(searchResult);
    } else {
      await downloadVideo({
        video: searchResult,
        apiKey: program.apiKey,
        outDir: program.outDir,
        quality: program.quality,
        debug: program.debug
      });
    }

    return;
  }

  if (program.showName) {
    let show = await getShow({
      apiKey: program.apiKey,
      name: program.showName,
      clean: program.clean,
      debug: program.debug
    });

    if (!show) {
      console.error(`no show found for ${program.showName}`);
      process.exit(1);
    }

    filters.push(`video_show:${show.id}`);
  }

  const video = await getVideo({
    filters,
    apiKey: program.apiKey,
    name: program.videoName,
    number: program.videoNumber,
    clean: program.clean,
    debug: program.debug
  });

  if (!video) {
    console.error("no video found for query");
    process.exit(1);
  }

  if (program.dateAfter) {
    let dateAfter = dayjs(new Date(program.dateAfter));
    let videoDate = dayjs(new Date(video.publish_date));

    if (
      !videoDate.isAfter(dateAfter, "day") &&
      !videoDate.isSame(dateAfter, "day")
    ) {
      console.error(
        `${video.name} was published before ${dateAfter.format("MM/DD/YYYY")}`
      );
      process.exit(1);
    }
  }

  if (program.info) {
    console.log(video);
    return;
  }

  await downloadVideo({
    video,
    apiKey: program.apiKey,
    outDir: program.outDir,
    quality: program.quality,
    archive: program.archive,
    debug: program.debug
  });
};

main();
