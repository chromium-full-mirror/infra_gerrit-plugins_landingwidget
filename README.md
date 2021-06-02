# LandingWidget Plugin for Gerrit

## To use with the local testsite

```
ln -s /path/to/landingwidget-plugin plugins/landingwidget
bazel build plugins/landingwidget && \
  cp buck-out/gen/plugins/landingwidget/landingwidget.jar ../gerrit_testsite/plugins/ && \
  ../gerrit_testsite/bin/gerrit.sh restart
```

## To use with the polygerrit-ui server against live data

```
mkdir -p polygerrit-ui/app/plugins/landingwidget
ln -s /path/to/landingwidget-plugin/src/main/resources/static polygerrit-ui/app/plugins/landingwidget/static
./polygerrit-ui/run-server.sh -host chromium-review.googlesource.com
```

## To run tests

```
npm run wct-test
```
