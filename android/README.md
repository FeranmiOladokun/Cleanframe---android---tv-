# Android TV setup (experimental)

## Download (normal installation)

Get the `.apk` and SHA256SUMS.txt from the [latest GitHub Release](https://github.com/FeranmiOladokun/Cleanframe---android---tv-/releases/latest). No SDK or source compilation is needed for that APK; ADB/network authorization is still needed for the guided computer-based install below. Keep release-signed updates on the same signing identity. A self-built APK uses a different key and may not update an existing release installation.

## Build from source (optional)

Install Java 17, Python 3.10+, and Android SDK platform 34 and build-tools 34.0.0. Set ANDROID_HOME (or ANDROID_SDK_ROOT) to your SDK directory. Ensure Java tools are on PATH. Run `sh android/build.sh` from the repository root. Build output and signing material stay ignored. A fresh checkout generates a unique local signing key; retain android/shortcut-key.jks and .local/android-signing-password for compatible updates. Never publish them. The shared package identity is local.cleanframe.test; do not install over an unrelated app using that identity.

## Connect and install manually

Use the TV’s own Developer options to enable network/ADB debugging if supported. Keep the computer and TV on the same trusted local network. Read the TV’s current IP address from its network settings; do not assume a fixed address. Some TVs use wireless pairing and a different port. Approve only your own computer in the TV’s authorization prompt.

```sh
adb connect TV_ADDRESS:PORT
adb -s TV_ADDRESS:PORT install -r PATH_TO_DOWNLOADED_OR_BUILT_APK
adb -s TV_ADDRESS:PORT shell am start -n local.cleanframe.test/.MainActivity
```

Replace TV_ADDRESS:PORT with your device’s value. No setup command here changes your native Home or disables a system package. Open CleanFrame from the TV app list. Configure Apps on Home for your installed apps; the initial five shortcuts are Nuvio, Stremio, SmartTube, Spotify and Twitch, which are not installed by this project.

## Spotify and layout

Enable CleanFrame Spotify controls under Android’s Notification access settings only if you want media metadata/control. That permission can expose notifications; this implementation selects Spotify media sessions rather than reading notification bodies. Revoke access there at any time. Layout → Dock adjusts size, position and surface. Layout → Spotify placement, directly below Dock, provides three positions and Off. Up/Down previews, OK saves, Back cancels. The floating banner has no buttons; controls remain in Quick controls. Timing hides if Spotify does not provide it.

Weather currently uses fixed Łódź/Warsaw coordinates. A city picker is not implemented. Native videos use app-owned files under Android/data/local.cleanframe.test/files/live/ with names fire.mp4, snow.mp4, waves.mp4 and amber.mp4. Supply appropriately licensed footage compatible with your decoder; no clips are distributed in this repository. Public reflection files are static fallback material, not personal stock-video frames.

## Remote shortcut in guided setup

Choose a button-mapping app compatible with your remote/TV, review its permissions, and map a spare button to launch CleanFrame. Reserved manufacturer buttons may not be remappable. The [guided setup prompt](../SETUP-PROMPT.md) instructs your assistant to ask permission, configure and physically test the mapping, including after reboot and without a computer. The APK does not configure a mapper itself; reserved keys may require a different supported button or gesture. The agent must report unsupported mapping rather than claim success. Preserve the ordinary Home button until you have tested recovery. No accessibility permission is required by CleanFrame itself.

## Recovery

Use ordinary Home to return to the original launcher. Disable the optional remote mapping in the mapper. Remove CleanFrame through Android app settings (or `adb -s TV_ADDRESS:PORT uninstall local.cleanframe.test`); uninstalling deletes its preferences and app-owned files. Keep an APK and signing key if you want future compatible updates. No system restoration is needed because this app does not debloat or change Home. Turn off developer/network debugging when you no longer need it.

## Scope

Personally tested on one Xiaomi Android 11 TV; other hardware remains unverified. App code requests KEEP_SCREEN_ON while resumed and releases it when paused; global power timers are not rewritten. The native app identity/certificate must stay consistent for updates. Do not run the upstream Samsung-specific device tools on an Android TV.
