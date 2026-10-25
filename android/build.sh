#!/bin/sh
set -eu
cd "$(dirname "$0")"
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
SDK=/opt/homebrew/share/android-commandlinetools
BT="$SDK/build-tools/34.0.0"
JAR="$SDK/platforms/android-34/android.jar"
python3 prepare.py
mkdir -p out/classes out/dex
"$BT/aapt2" link -o out/base.apk -I "$JAR" --manifest AndroidManifest.xml -A out/assets
javac -source 8 -target 8 -bootclasspath "$JAR:$BT/core-lambda-stubs.jar" -d out/classes src/local/cleanframe/test/MainActivity.java
"$BT/d8" --min-api 21 --lib "$JAR" --output out/dex $(find out/classes -name '*.class')
cp out/base.apk out/unsigned.apk
(cd out/dex && zip -q ../unsigned.apk classes.dex)
"$BT/zipalign" -f 4 out/unsigned.apk out/aligned.apk
if [ ! -f shortcut-key.jks ]; then
keytool -genkeypair -keystore shortcut-key.jks -storepass local-shortcut -keypass local-shortcut -alias shortcut -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=Local CleanFrame Test'
fi
"$BT/apksigner" sign --ks shortcut-key.jks --ks-pass pass:local-shortcut --out out/cleanframe-test.apk out/aligned.apk
"$BT/apksigner" verify out/cleanframe-test.apk
"$BT/aapt2" dump badging out/cleanframe-test.apk
