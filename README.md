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

## Guided setup with your AI assistant

**[Copy the setup prompt](SETUP-PROMPT.md)** into an assistant with local terminal/ADB access. It walks you through Wi-Fi connection, TV-specific app inventory, optional approved cleanup, app installation, Spotify access, personalization, and a remote-button shortcut. It asks before changes and keeps a private undo log.

**A physically tested remote shortcut is a required setup goal**, including a test after reboot and with the computer disconnected. The agent must try a supported spare key or supported alternate gesture if the first key is reserved. Some TV/remote firmware blocks remapping: the agent must report that limitation and leave the dedicated-button task incomplete rather than promise universal support. CleanFrame also remains accessible using the TV’s normal Apps list without a PC.

The prompt guides an assistant; the APK does not itself debloat the TV or configure a mapper. Cleanup is optional, uses that TV’s inventory, and preserves essential packages and original Home. The clean launcher avoids recommendation feeds; it cannot remove advertisements inside third-party streaming services. No app subscriptions, sign-ins or private wallpaper footage are included.

Spotify metadata requires your explicit Android notification-access grant. The bridge selects Spotify media sessions rather than parsing/storing notification bodies. Weather currently requests fixed Łódź/Warsaw coordinates from Open-Meteo without location permission; the prompt can guide a source customization for your cities. Wallpapers run locally.

## Development

```sh
npm ci
npm run check
python3 android/prepare.py
node android/check.mjs
```

Browser tests need `npx playwright install chromium`. Desktop recording preview is an optional local development tool, requires your own video files/cache, and uses sample media/weather data. It is not a remote connection to the TV.

Public source excludes signing keys, proprietary font overlays, personal footage, device addresses, TV inventories, recordings and recovery backups. Original upstream documentation is retained for attribution/context; use the Android guide for this fork.
