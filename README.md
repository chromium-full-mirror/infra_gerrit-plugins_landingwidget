# LandingWidget Plugin for Gerrit

## Setup

This plugin must be placed inside the Gerrit plugins directory:

    git clone --recurse-submodules https://gerrit.googlesource.com/gerrit
    cd gerrit/plugins
    git clone https://chromium.googlesource.com/infra/gerrit-plugins/landingwidget

## Web Plugin Development

For running unit tests execute:

    bazel test --test_output=all //plugins/landingwidget/web:karma_test

For checking or fixing eslint formatter problems run:

    bazel test //plugins/landingwidget/web:lint_test
    bazel run //plugins/landingwidget/web:lint_bin -- --fix "$(pwd)/plugins/landingwidget/web"

For testing the plugin with
[Gerrit FE Dev Helper](https://gerrit.googlesource.com/gerrit-fe-dev-helper/)
build the JavaScript bundle and copy it to the `plugins/landingwidget` folder:

    bazel build //plugins/landingwidget/web:landingwidget
    cp -f bazel-bin/plugins/landingwidget/web/landingwidget.js plugins/landingwidget

and let the Dev Helper redirect from `.+/plugins/landingwidget/static/landingwidget.js` to
`http://localhost:8081/plugins_/plugins/landingwidget.js`.

Note for local testing: this plugin fetches from an external site which may be
blocked by CORS policy.
