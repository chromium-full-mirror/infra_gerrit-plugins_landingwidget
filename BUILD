load("//tools/bzl:plugin.bzl", "gerrit_plugin")

gerrit_plugin(
    name = "landingwidget",
    srcs = glob(["src/main/java/**/*.java"]),
    manifest_entries = [
        "Gerrit-PluginName: landingwidget",
        "Gerrit-Module: com.googlesource.chromium.plugins.landingwidget.LandingWidgetModule",
        "Implementation-Title: LandingWidget plugin",
    ],
    resources = glob(["src/main/**/*"]),
)
