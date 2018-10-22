load("//tools/bzl:plugin.bzl", "gerrit_plugin")
load("//tools/bzl:js.bzl", "bundle_assets", "polygerrit_plugin")

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

polygerrit_plugin(
    name = "landingwidget_ui",
    plugin_name = "landingwidget",
    app = "src/main/resources/static/landingwidget.js",
)
