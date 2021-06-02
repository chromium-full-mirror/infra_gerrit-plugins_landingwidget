// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export const landingwidgetViewTemplate = Polymer.html`
  <style include="gr-change-metadata-shared-styles"></style>
  <template is="dom-if" if="[[hasVersionInfo]]">
    <span class="title">Landed in</span>
    <span class="value">
      <template is="dom-repeat" items="[[versions]]" as="version">
        <a href="[[version.link]]" target="_blank">[[version.text]]</a>
      </template>
    </span>
  </template>
`;
