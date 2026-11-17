#!/bin/sh
set -e
cd "$(dirname "$0")/../native/android"
if [ -z "$JAVA_HOME" ]; then
  for home in /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home "/Applications/Android Studio.app/Contents/jbr/Contents/Home"; do
    [ -x "$home/bin/java" ] && JAVA_HOME="$home" && break
  done
  export JAVA_HOME
fi
if [ -z "$ANDROID_HOME" ] && [ ! -f local.properties ]; then
  for sdk in /opt/homebrew/share/android-commandlinetools "$HOME/Library/Android/sdk"; do
    [ -d "$sdk/platforms" ] && ANDROID_HOME="$sdk" && break
  done
  export ANDROID_HOME
fi
exec ./gradlew --console=plain "$@"
