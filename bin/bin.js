#!/usr/bin/env node

const fs = require("fs");
const program = require("commander");
const dayjs = require("dayjs");

const { version } = require("../package.json");
const {
  getVideoSearch,
  getShow,
  getVideo,
  downloadVideo,
  trimCache,
  getVideoByGuid,
} = require("./util");
const { createParseNumber } = require("./validate");

const { GIANTBOMB_TOKEN } = process.env;

const filters = [];

program
  .version(version)
  .option(
    "--api-key <key>",
    "individual API key for the Giant Bomb API (GIANTBOMB_TOKEN env var may also be used)"
  )
  .option("--show-name <string>", "show to filter search by")
  .option("--video-name <string>", "video name to find")
  .option("--video-guid <string>", "video GUID")
  .option(
    "--video-number <number>",
    "video number to download (most recent = 0)",
    createParseNumber({ min: 0, name: "--video-number" }),
    0
  )
  .option(
    "--video-number-reverse",
    "swaps direction of provided video number (oldest = 0)"
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
    "MM/DD/YYYY video must be published after (inclusive)"
  )
  .option(
    "--date-before <string>",
    "MM/DD/YYYY video must be published before (inclusive)"
  )
  .option(
    "--add-guid-prefix",
    "Prefixes the downloaded video with its associated GUID"
  )
  .option(
    "--add-date-prefix",
    "Prefixes the downloaded video with its publish date (YYYY-MM-DD)"
  )
  .option("--info", "show selected video info instead of downloading")
  .option("--archive", "check if video exists in archive before downloading")
  .option("--clean", "ignore previous cache results for query")
  .option("--debug", "show debug statements")
  .option("--blocklist", "check if show is on blocklist before downloading")
  .parse(process.argv);

if (!program.apiKey && !GIANTBOMB_TOKEN) {
  console.error("--api-key not provided");
  process.exit(1);
} else if (
  !program.videoName &&
  !program.videoGuid &&
  typeof program.videoNumber === "undefined"
) {
  console.log(program.videoName, program.videoNumber);
  console.error(
    "--video-name, --video-guid, or --video-number must be provided"
  );
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

const main = async () => {
  let result = null;
  const apiKey = program.apiKey || GIANTBOMB_TOKEN;

  if (program.videoGuid) {
    let videoGuid = program.videoGuid;

    try {
      const { pathname } = new URL(program.videoGuid);
      const guidRegex = new RegExp("/[0-9]+(-[0-9]+)(/|$)", "g");
      videoGuid = guidRegex.exec(pathname)[0].split("/")[1];
    } catch (error) {
      // do nothing
    }

    result = await getVideoByGuid({
      apiKey,
      videoGuid,
      clean: program.clean,
      debug: program.debug,
    });
  } else if (program.videoName) {
    result = await getVideoSearch({
      apiKey,
      videoName: program.videoName,
      showName: program.showName,
      isOnlyPremium: program.onlyPremium,
      isOnlyFree: program.onlyFree,
      clean: program.clean,
      debug: program.debug,
    });
  }

  if (program.videoGuid && !result) {
    console.error("no video found for GUID");
    process.exit(1);
  }

  if (result) {
    if (program.info) {
      console.log(result);
    } else {
      await downloadVideo({
        apiKey,
        video: result,
        outDir: program.outDir,
        quality: program.quality,
        debug: program.debug,
        addGuidPrefix: program.addGuidPrefix,
        addDatePrefix: program.addDatePrefix,
      });
    }

    return;
  }

  if (program.showName) {
    const show = await getShow({
      apiKey,
      name: program.showName,
      clean: program.clean,
      debug: program.debug,
    });

    if (!show) {
      console.error(`no show found for ${program.showName}`);
      process.exit(1);
    }

    filters.push(`video_show:${show.id}`);
  }

  const video = await getVideo({
    filters,
    apiKey,
    name: program.videoName,
    number: program.videoNumber,
    reverse: program.videoNumberReverse,
    clean: program.clean,
    debug: program.debug,
  });

  if (!video) {
    console.error("no video found for query");
    process.exit(1);
  }

  if (program.dateBefore) {
    const dateBefore = dayjs(new Date(program.dateBefore));
    const videoDate = dayjs(new Date(video.publish_date));

    if (
      !videoDate.isBefore(dateBefore, "day") &&
      !videoDate.isSame(dateBefore, "day")
    ) {
      console.error(
        `${video.name} was published after ${dateBefore.format("MM/DD/YYYY")}`
      );
      process.exit(1);
    }
  }

  if (program.dateAfter) {
    const dateAfter = dayjs(new Date(program.dateAfter));
    const videoDate = dayjs(new Date(video.publish_date));

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
    apiKey,
    outDir: program.outDir,
    quality: program.quality,
    archive: program.archive,
    blocklist: program.blocklist,
    debug: program.debug,
    addGuidPrefix: program.addGuidPrefix,
    addDatePrefix: program.addDatePrefix,
  });
};

main();
