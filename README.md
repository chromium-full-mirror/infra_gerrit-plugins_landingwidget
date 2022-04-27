# LandingWidget Plugin for Gerrit

## Setup

This plugin must be placed inside the Gerrit plugins directory:

    git clone --recurse-submodules https://gerrit.googlesource.com/gerrit
    cd gerrit/plugins
    git clone https://chromium.googlesource.com/infra/gerrit-plugins/landingwidget

## Web Plugin Development

Run the commands below in web/.

For running unit tests execute:

    make test

For checking or fixing eslint formatter problems run:

    make lint_test
    make lint_fix

For testing the plugin with
[Gerrit FE Dev Helper](https://gerrit.googlesource.com/gerrit-fe-dev-helper/)
the command below builds build the JavaScript bundle and copies it to the `plugins/landingwidget` folder:

    make build

and let the Dev Helper redirect from `.+/plugins/landingwidget/static/landingwidget.js` to
`http://localhost:8081/plugins_/plugins/landingwidget.js`.

Note for local testing: this plugin fetches from an external site which may be
blocked by CORS policy.
