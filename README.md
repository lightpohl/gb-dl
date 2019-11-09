# gb-dl

## A CLI for downloading [Giant Bomb](https://www.giantbomb.com) videos.

## How to Use

**[Node Required](https://nodejs.org/en/)**

`npx gb-dl --api-key <YOUR_API_KEY> --show-name <string> --video-name <string>`

`npx gb-dl --api-key <YOUR_API_KEY> --show-name "Giant Bombcast" --video-name "Giant Bombcast 607"`

`npx gb-dl --api-key <YOUR_API_KEY> --show-name "Giant Bombcast" --video-number 0`

## Options

**Either `--video-name` or `--video-number` must be provided.**

| Option       | Type   | Required | Description                                                                                         |
| ------------ | ------ | -------- | --------------------------------------------------------------------------------------------------- |
| api-key      | String | true     | Individual [Giant Bomb API key](https://www.giantbomb.com/api/).                                    |
| show-name    | String | false    | Used to find matching show title.                                                                   |
| video-name   | String | false\*  | Used to find matching video title.                                                                  |
| video-number | Number | false\*  | Zero-based video index for provided show (most recent video is `0`). Defaults to `0`.               |
| only-premium |        | false    | Filter search to only premium videos.                                                               |
| only-free    |        | false    | Filter search to only free videos.                                                                  |
| quality      | String | false    | Specify quality of video to download. Defaults to highest. Other options: hd, high, low and mobile. |
| out-dir      | String | false    | Specify output directory for video. Defaults to current working directory.                          |
| info         |        | false    | Output video information instead of download.                                                       |
| clean        |        | false    | Ignore cache when making query.                                                                     |
| debug        |        | false    | show debug statements                                                                               |
| version      |        | false    | Output the version number.                                                                          |
| help         |        | false    | Output usage information.                                                                           |

## [Giant Bomb API](https://www.giantbomb.com/api/)

- Make sure to stay within the [Giant Bomb API usage guidelines](https://www.giantbomb.com/api/).
- The Giant Bomb API has an account download limit of **100 videos per day.**

## Rate Limiting

- A one second delay between requests is added to avoid flooding the Giant Bomb API.
- `gb-dl` may need to make a few requests to find a video, so expect a short delay after starting.

## Caching

- `gb-dl` will generate a `gb-dl-cache.json` in the current working directory when run in order to avoid hitting the Giant Bomb API repeatedly for the same set of data.
- Cached responses will be used for one hour.
- Adding `--clean` to the command will bypass the cache.
- Expired cache results will be removed on script start.
