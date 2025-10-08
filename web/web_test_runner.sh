#!/bin/bash

set -euo pipefail

./$1 --config $2 \
  --dir 'plugins/landingwidget/web/_bazel_ts_out_tests' \
  --test-files 'plugins/landingwidget/web/_bazel_ts_out_tests/*_test.js' \
  --ts-config="plugins/landingwidget/web/tsconfig.json"
