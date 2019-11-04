# gb-dl

## A CLI for downloading Giant Bomb videos.

## How to Use

`npx gb-dl --api-key <YOUR_API_KEY> --show-regex <regex> --video-regex <regex>`

`npx gb-dl --api-key <YOUR_API_KEY> --show-regex "Giant Bombcast" --video-regex "Giant Bombcast 607"`

`npx gb-dl --api-key <YOUR_API_KEY> --show-regex "Giant Bombcast" --video-number 0`

## Options

| Option       | Type                                      | Required | Description                                                                           |
| ------------ | ----------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| api-key      | [API Key](https://www.giantbomb.com/api/) | true     | Individual API key for Giant Bomb.                                                    |
| show-regex   | String                                    | true     | Used to find matching show title. Passed into a `new RegExp()`.                       |
| video-regex  | String                                    | false    | Used to find matching video title of show. Passed into a `new RegExp()`.              |
| video-number | Number                                    | false    | Zero-based video index for provided show (most recent video is `0`). Defaults to `0`. |
| only-premium |                                           | false    | Filter search to only premium videos.                                                 |
| only-free    |                                           | false    | Filter search to only free videos.                                                    |
| quality      | hd/high/low                               | false    | Specify quality of video to download. Defaults to HD.                                 |
| out-dir      | String                                    | false    | Specify output directory for video. Defaults to current working directory.            |
| info         |                                           | false    | Output video information instead of download.                                         |
| clean        |                                           | false    | Ignore cache when making query.                                                       |
| version      |                                           | false    | Output the version number.                                                            |
| help         |                                           | false    | Output usage information.                                                             |

## Caching

- `gb-dl` will generate a `gb-dl-cache.json` in the current working directory when run in order to avoid hitting the Giant Bomb API repeatedly for the same set of data.
- Make sure to stay within the [Giant Bomb API usage guidelines](https://www.giantbomb.com/api/).
- The cached responses will be used for one hour.
- Adding `--clean` to the command will bypass the cache.
- Manually deleting the cache is also an option if needed.
