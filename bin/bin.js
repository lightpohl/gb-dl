#!/usr/bin/env node

let program = require("commander");
let version = require("../package.json").version;
let { getVideosResponse, downloadVideo } = require("./util");

let showInfo = {
  bombcast: {
    api_detail_url: "https://www.giantbomb.com/api/video_show/2340-5/",
    id: 5,
    title: "Giant Bombcast"
  }
};

program
  .version(version)
  .option(
    "--api-key <key>",
    "required: individual API key for the Giant Bomb API"
  )
  .option("--show <name>", "required: supported show name")
  .option(
    "--video-number <number>",
    "video number to download (most recent = 0)",
    0
  )
  .option("--regex <string>", "search show for first name match to regex")
  .option("--only-premium", "show only premium versions")
  .option("--only-free", "show only free versions")
  .option("--quality <hd/high/low>", "video quality to download", "hd")
  .option("--out-dir <path>", "specify output directory", "./")
  .option("--info", "show selected video info instead of downloading")
  .parse(process.argv);

let {
  apiKey,
  show,
  videoNumber,
  regex,
  onlyPremium,
  onlyFree,
  quality,
  outDir,
  info
} = program;

if (!apiKey) {
  console.error("--api-key not provided");
  process.exit(1);
} else if (!show) {
  console.error("--show not provided");
  process.exit(1);
} else if (!regex && !videoNumber) {
  console.error("--regex or --video-number must be provided");
  process.exit(1);
} else if (!showInfo[show]) {
  console.error(
    `--show ${show} either does not exist or is not currently supported`
  );
  process.exit(1);
}

let filters = [`video_show:${showInfo[show].id}`];
if (onlyPremium) {
  filters.push("premium:true");
} else if (onlyFree) {
  filters.push("premium:false");
}

let main = async () => {
  let result;
  if (regex) {
    let nameRegex = new RegExp(regex);
    let totalVideos = Infinity;
    let limit = 100;
    let offset = 0;

    while (!result && offset < totalVideos) {
      let response = await getVideosResponse({
        apiKey,
        limit,
        offset,
        filters
      });

      totalVideos = response.number_of_total_results;

      let { results } = response;
      result = results.find(video => {
        return nameRegex.test(video.name);
      });

      offset += limit;
    }
  } else {
    let limit = 1;
    let offset = videoNumber;

    let response = await getVideosResponse({
      apiKey,
      limit,
      offset,
      filters
    });

    let { results } = response;
    result = results[0];
  }

  if (!result) {
    console.error("no result for query");
    process.exit(1);
  }

  if (info) {
    console.log("name:", result.name);
    console.log("deck:", result.deck);
    console.log("publish_date:", result.publish_date);
    console.log("id:", result.id);
    console.log("api_detail_url:", result.api_detail_url);
    console.log("site_detail_url:", result.site_detail_url);
    process.exit(0);
  }

  await downloadVideo({
    apiKey,
    outDir,
    quality,
    video: result
  });
};

main();
