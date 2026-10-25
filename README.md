# CleanFrame for Android TV

An experimental, distraction-free Android TV launcher, adapted from **[Nathan Clark’s CleanFrame](https://github.com/nthnclrk/CleanFrame)**. Original code is MIT licensed; see [upstream attribution](UPSTREAM.md), [LICENSE](LICENSE) and [asset notices](THIRD_PARTY_NOTICES.md).

## What this fork adds

- A floating, adjustable dock with an optional Liquid Glass-style surface.
- Quick controls expanding from the top center: Spotify playback and volume controls, plus Android settings shortcuts.
- Floating Spotify artwork, song/artist, progress and animated playback indicator. Choose Lower left, Above dock, Below weather or Off in Settings → Layout → Spotify placement.
- Weather for Łódź and Warsaw (currently fixed in native code; not a configurable city picker).
- Optional local native-video backgrounds. Video files are **not included**; provide files you have permission to use. Upscaling does not create native 4K detail.
- Foreground screen-awake behavior while CleanFrame is open. Power-button sleep remains available.

Tested personally on a Xiaomi Android 11 TV. Other models, Android versions and remote buttons are unverified. This is a normal launcher app with no default-Home assignment: keep the original TV Home available for recovery.

## Build and install

See [Android setup](android/README.md). Requires Java 17, Python 3.10+, Android SDK platform 34/build-tools 34.0.0, and ADB. Build from this clean source with your own generated signing key; keep the key for future updates.

```sh
sh android/build.sh
```

Output: `android/out/cleanframe-test.apk`. No prebuilt APK is published in this source upload.

## Important boundaries

This repository does **not** automatically debloat a TV, disable system apps, remove ads inside third-party apps, install streaming services, remap remote buttons or replace native Home. The clean launcher avoids recommendation feeds; that is separate from system cleanup. A guided cross-brand cleanup/remote installer is future work, not an implemented feature. Never copy another TV’s disable list.

Spotify metadata requires explicitly enabling CleanFrame notification access in Android settings. The bridge selects Spotify media sessions and does not parse/store notification bodies. Weather requests fixed city coordinates from Open-Meteo; no location permission. Wallpapers run locally. Keep Spotify and any other apps installed through their legitimate distribution channels.

## Development

```sh
npm ci
npm run check
python3 android/prepare.py
node android/check.mjs
```

Browser tests need `npx playwright install chromium`. Desktop recording preview is an optional local development tool, requires your own video files/cache, and uses sample media/weather data. It is not a remote connection to the TV.

Public source excludes signing keys, proprietary font overlays, personal footage, device addresses, TV inventories, recordings and recovery backups. Original upstream documentation is retained for attribution/context; use the Android guide for this fork.
