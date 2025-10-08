// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import '@gerritcodereview/typescript-api/gerrit';
import './landingwidget';

window.Gerrit?.install(plugin => {
  plugin.registerCustomComponent(
    'change-metadata-item',
    'chromium-landing-widget'
  );
});
