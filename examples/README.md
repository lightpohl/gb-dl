# Examples

## Download the most recent Giant Bombcast video

```bash
npx gb-dl --api-key <YOUR_API_KEY> --show-name "Giant Bombcast" --video-number 0
```

## Download the first Giant Bombcast video

```bash
npx gb-dl --api-key <YOUR_API_KEY> --show-name "Giant Bombcast" --video-number 0 --video-number-reverse
```

## Download a video based on the URL

```bash
npx gb-dl --api-key <YOUR_API_KEY> --video-guid "https://www.giantbomb.com/videos/video-thing-its-a-website/2300-20/"
```

## Download a video based on the GUID

```bash
npx gb-dl --api-key <YOUR_API_KEY> --video-guid "2300-20"
```
