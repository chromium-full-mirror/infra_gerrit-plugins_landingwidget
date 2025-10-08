# Copyright 2022 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

.PHONY: test

test:
	bazel test --test_output=all //plugins/landingwidget/web:web_test_runner

lint_test:
	bazel test //plugins/landingwidget/web:lint_test

lint_fix:
	bazel run //plugins/landingwidget/web:lint_bin -- --fix "./"

build:
	bazel build //plugins/landingwidget/web:landingwidget && \
	cp -f ../../../bazel-bin/plugins/landingwidget/web/landingwidget.js ../
