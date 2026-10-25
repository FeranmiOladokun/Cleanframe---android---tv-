# Copy this prompt into your AI assistant

Use an assistant that can run local terminal commands and help with Android ADB. Run it on a computer on the same trusted Wi-Fi as the TV. A TV cannot execute a text prompt by itself. Sign-ins, TV authorization dialogs and some remote-mapper screens require you to use the remote. Review your assistant’s tool permissions.

Copy everything below:

---

Help me install and configure CleanFrame for Android TV from https://github.com/FeranmiOladokun/Cleanframe---android---tv- . I want a clean home screen, optional cleanup of unwanted manufacturer apps, and a tested remote-button shortcut so I can return to CleanFrame without my computer. Work through this with me; do not just give me a list of commands.

## 1. Identify my TV and connect

Ask for my TV brand/model and verify its actual OS/version. This fork is for Android TV/Google TV, not Samsung Tizen, LG webOS, Roku or Fire TV compatibility by assumption. Explain unsupported cases instead of running incompatible setup. Read README.md, android/README.md, UPSTREAM.md and the Android build/native source. Original Samsung tools and recorded reference-machine instructions are not an Android setup procedure. Do not run them on my TV. Do not assume another owner’s app list, IP address, passwords, keys, Home settings or permission grants.

Walk me through finding my current TV IP address and checking that the computer and TV are on the same network. Explain that Wi-Fi client isolation/guest networks or disabled debugging may prevent connection. Help enable developer/network debugging only as supported on my model; handle wireless pairing if needed. Have me approve my own computer’s ADB connection on the TV. Use the specific device serial for every ADB command. Never expose ADB to the Internet, open router ports or disable my firewall globally. Ask before installing tools or changing debugging settings.

## 2. Inventory and recovery before changes

Read-only inspection is allowed after connection. Record OS/model, free storage and available RAM separately, launchable apps, installed/enabled/disabled package state, original default Home component, relevant power timers and current button behavior. Map package IDs to plain-English names where possible. Show the app inventory grouped as: apps I use, optional apps that may be safe to disable, required TV components, and unknown/leave enabled. Ask which streaming/music/football apps I want to keep and which apps I want on my dock. Never assume live TV/tuner services are unwanted.

Save a private local baseline and change log under .local/ for this TV. Do not publish device identifiers, addresses, recovery files, credentials, screenshots or signing keys. Before each change, explain its exact scope and how to undo it, then ask me. Approval applies only to the changes I actually approved. Preserve existing uncommitted project work.

## 3. Optional cleanup, chosen for my TV

Ask whether I want to disable unused manufacturer/recommendation/streaming apps. Present each candidate’s plain-English purpose and package ID, dependency uncertainty, expected effect and restore command. I may approve a clearly enumerated group. Prefer reversible per-user disabling over uninstalling. Preserve originally disabled states in the baseline; recovery must restore exact prior state rather than indiscriminately enable everything. Save command results and verify state after each approved group. Skip unknown packages. Do not promise a specific speed or storage gain: disabling built-in apps may free little storage. Recheck RAM/storage under comparable conditions.

NEVER disable/uninstall Google Play services (com.google.android.gms), Play Store, Settings, System UI, package installer, permission controller, setup/provisioning apps, the original launcher, keyboard, Bluetooth, network services, HDMI inputs, input/tuner frameworks, remote services, accessibility framework or anything needed to boot/control the TV. Do not root, flash firmware, factory reset or change native Home/default startup as part of this setup. If a launcher/setup conflict occurs, preserve the original components and diagnose it; do not disable them to force CleanFrame to work.

CleanFrame avoids launcher recommendation feeds. Cleanup may remove specific manufacturer recommendations by disabling an approved optional app; it does not remove ads inside third-party services. Do not modify streaming apps or bypass DRM, authentication, subscriptions or service restrictions.

## 4. Install and personalize CleanFrame

Ask before installing CleanFrame or updating an existing installation. Check for an existing local.cleanframe.test package/certificate first; do not uninstall or clear its data to bypass a signing mismatch. For a fresh build, use the public build instructions with a new owner-controlled signing key and retain it privately for future updates. Existing authorized installations must preserve their package identity/certificate and preferences. Do not publish a personal signed APK or use someone else’s private key.

Build and verify the APK, install it, launch it and ask me to confirm its visible appearance and remote navigation. Keep original Home available. Help choose apps already installed. Ask before installing missing apps; use official stores/developer sources, explain any sideloading or paid account requirement, and let me perform sign-ins. CleanFrame does not install third-party streaming services itself.

Ask for my weather cities and desired wallpaper/layout. This source currently hard-codes Łódź/Warsaw and has no city picker: explain that honestly and offer a reviewed source customization before building rather than claiming a nonexistent setting. Supply only wallpaper media I have permission to use; no personal stock footage is bundled. Test codec/resolution; label upscales honestly.

Ask separately whether I want Spotify details/controls. Explain Android notification access before guiding me to grant it in the TV UI; do not silently grant it. The existing bridge reads Spotify media sessions, not notification bodies. Verify that track/artwork/timing update, pause hides the banner, and Settings → Layout → Spotify placement offers Lower left, Above dock, Below weather and Off. Do not request unrelated permissions.

## 5. Required goal: remote access without the computer

Do not mark setup complete after merely launching CleanFrame over ADB. Ask which spare remote button I want to use and inspect what it currently does. Keep normal Home and Power working. Ask before installing a remote-mapping app, granting it accessibility/other access, purchasing features, or assigning a button. Choose a reputable mapper compatible with my exact TV/remote after checking its official documentation; explain that a mapper’s accessibility access is separate from CleanFrame’s notification access. Prefer local launch-app mapping, not a shortcut that calls my computer or an ADB command that requires an ongoing connection.

Map the chosen button to the actual installed CleanFrame activity. Use the mapper’s app/activity picker; if CleanFrame is missing, inspect exported activities and supported app-shortcut methods instead of telling me to select a nonexistent entry. Verify captured key events before saving so an input/source button does not unexpectedly switch HDMI. Do not blindly disable the manufacturer’s app as a substitute for remapping; that may not intercept a hardware-reserved key. Record original action, mapper settings, permissions and exact undo steps.

Test with my physical remote: from CleanFrame open another app, then press the chosen button and confirm CleanFrame returns. Test from original Home too. After reboot, test the same button without a new ADB launch. Disconnect the computer/ADB and repeat to confirm independent operation. Do not claim success from a command response alone.

Some manufacturers reserve keys. If the chosen key cannot be intercepted, explain the evidence and ask me to choose another supported spare key or supported long/double press. Never promise every button works or disable core TV services to force it. If no usable mapping is possible, report remote mapping as blocked/incomplete and explain a remote-only route through the TV’s normal Apps/Favorites list; do not claim it meets the dedicated-button goal. I should not need a PC simply to open CleanFrame from my TV app list.

## 6. Power behavior, final checks and undo

Ask before changing animations, screensaver or sleep timers; record exact original values. Ask my preferred idle behavior, including whether I want a persistent wallpaper display. This app already requests screen-awake while foreground and releases it when paused; background Spotify audio alone does not guarantee an awake display. Do not rewrite global timers or add a background keep-awake service without separate approval. Verify normal Power-button behavior.

After the final change, wait at least 30 seconds, ask before rebooting, then restart the TV once when I approve. Confirm visible normal startup and working original Home, inputs, Bluetooth, app launches, CleanFrame settings and the remote shortcut. Have me verify the independent button test described above. Do not use an arbitrary wake/launch command to mask a failed startup or shortcut test. Turn off network debugging when it is no longer needed, after my approval, and retest the mapper if it relies on debugging.

Finish with a short table of changes, exact recovery steps, free storage and available RAM before/after (do not label storage as RAM), and any pending/blocked tests. Supply a private local recovery guide. Do not say “done” if the TV cannot boot normally, the mapped button has not been physically tested, or I still need the PC for the promised shortcut. Do not claim an app disables advertisements or speeds up all TVs without evidence.

---

This is an agent-guided procedure, not an unattended installer. It requires the owner’s choices, a capable assistant and device-specific verification. The prompt is not proof of compatibility or permission to make every change.
