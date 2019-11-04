let got = require("got");
let fs = require("fs");
let path = require("path");

let baseVideosUrl = "https://www.giantbomb.com/api/videos/?format=json";

let getVideosResponse = async ({ apiKey, offset, limit, filters }) => {
  let apiKeyParam = `&api_key=${apiKey}`;
  let limitParam = `&limit=${limit}`;
  let offsetParam = `&offset=${offset}`;
  let filterParam = `&filter=${filters.join(",")}`;

  let { body } = await got(
    `${baseVideosUrl}${apiKeyParam}${limitParam}${offsetParam}${filterParam}`,
    { json: true }
  );

  return body;
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

module.exports = { getVideosResponse, downloadVideo };
