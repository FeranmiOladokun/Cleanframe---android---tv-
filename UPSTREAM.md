# Upstream attribution

This is an Android TV adaptation of [CleanFrame by Nathan Clark](https://github.com/nthnclrk/CleanFrame), based on upstream commit `fa537d1892b71d2de2bf94c24cbff3812e9f70d5`. The original MIT license is retained in LICENSE. The imported foundation is recorded separately from Android additions.

Android additions include the WebView/native bridge, app launching, remote navigation, quick controls, two-city weather, native video backgrounds, adjustable glass dock, Spotify Now Playing and placement settings, and foreground screen-awake behavior. The original app/ remains upstream source; android/prepare.py applies the adaptation at build time.

Upstream docs and Samsung tooling describe the original project, not a supported Samsung installation path for this Android fork. Asset and font terms remain in THIRD_PARTY_NOTICES.md. Android brand marks identify their respective apps; no endorsement is implied. Public video/reflection fallback differences are described in android/reflections/README.md.
