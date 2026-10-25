#!/bin/sh
set -eu
cd "$(dirname "$0")"
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
if [ -z "$SDK" ]; then echo 'Set ANDROID_HOME to your Android SDK directory.' >&2; exit 1; fi
BT="$SDK/build-tools/34.0.0"
JAR="$SDK/platforms/android-34/android.jar"
python3 prepare.py
mkdir -p out/classes out/dex ../.local
if [ ! -f ../.local/android-signing-password ]; then
  python3 -c 'import secrets,pathlib; p=pathlib.Path("../.local/android-signing-password"); p.write_text(secrets.token_hex(24)); p.chmod(0o600)'
fi
if [ ! -f shortcut-key.jks ]; then
  keytool -genkeypair -keystore shortcut-key.jks -storepass:file ../.local/android-signing-password -keypass:file ../.local/android-signing-password -alias shortcut -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=CleanFrame Local Android Build'
fi
"$BT/aapt2" link -o out/base.apk -I "$JAR" --manifest AndroidManifest.xml -A out/assets
javac -source 8 -target 8 -bootclasspath "$JAR:$BT/core-lambda-stubs.jar" -d out/classes src/local/cleanframe/test/MainActivity.java
"$BT/d8" --min-api 21 --lib "$JAR" --output out/dex $(find out/classes -name '*.class')
cp out/base.apk out/unsigned.apk
(cd out/dex && zip -q ../unsigned.apk classes.dex)
"$BT/zipalign" -f 4 out/unsigned.apk out/aligned.apk
"$BT/apksigner" sign --ks shortcut-key.jks --ks-pass file:../.local/android-signing-password --out out/cleanframe-test.apk out/aligned.apk
"$BT/apksigner" verify out/cleanframe-test.apk
