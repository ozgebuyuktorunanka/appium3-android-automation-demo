# Android SDK environment variables
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME

#Path Ayarları
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# Java environment (if needed)
export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home

# Java ayarı (Android Studio'nun kendi JDK'sı)
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"

# Apple Silicon için özel ayar
export ANDROID_EMULATOR_USE_SYSTEM_LIBS=1