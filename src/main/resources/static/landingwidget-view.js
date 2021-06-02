// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {landingwidgetViewTemplate} from './landingwidget-view_html.js';

/**
 * Display a widget with the version of the first build that contains the
 * change (i.e. the version that the change 'landed in').
 */
class ChromiumLandingWidget extends Polymer.Element {
  /** @returns {?} html template for the component */
  static get template() {
    return landingwidgetViewTemplate;
  }

  /** @returns {string} name of the component */
  static get is() {
    return 'chromium-landing-widget';
  }

  /** @returns {?Object} properties of the component */
  static get properties() {
    return {
      change: {
        type: Object,
      },
      hasVersionInfo: {
        type: Boolean,
        value: false,
      },
      restApi: {
        type: Object,
      },
      versions: {
        type: Array,
        value: [],
      },
    };
  }

  /** @returns {!Array<string>} obsevers of the component */
  static get observers() {
    return [
      '_onChange(change, restApi)',
    ];
  }

  /**
   * @param {?Object} change
   * @param {?Object} restApi
   */
  async _onChange(change, restApi) {
    if (!this.change || !this.restApi) {
      this.hasVersionInfo = false;
      return;
    }

    // Display only for merged changes.
    if (this.change.status !== 'MERGED') {
      this.hasVersionInfo = false;
      return;
    }

    // Fetch the configuration for the current project, if any.
    const config = await this._getProjectConfig(this.change.project);
    if (!config || config.disabled) {
      console.info('LandingWidget disabled.');
      this.hasVersionInfo = false;
      return;
    }

    // Fetch the first build version that the change landed in.
    const changeNum = this.change._number;
    // We need to use fetch instead of restApi because we need to include
    // credentials.
    const response = await this._fetchJSON(
      `${config.serviceUrl}/lookupFirstBuild` +
        `?instance=${config.instanceName}&cl=${changeNum}`,
      {credentials: 'include'});
    const versionsLink =
      `${config.serviceUrl}/cl?q=${config.instanceName}:${changeNum}`;

    if (response && response.versions) {
      this.versions = response.versions.map(v => {
        return {text: v, link: versionsLink};
      });
      this.hasVersionInfo = response.versions.length > 0;
    } else {
      this.hasVersionInfo = false;
    }
  }

  /**
   * Get the LandingWidget configuration for the given project.
   * @param {!Object} project
   * @returns {?Object}
   */
  async _getProjectConfig(project) {
    const landingWidgetUrl =
      `/projects/${encodeURIComponent(project)}/landingwidget~config`;
    const config = await this.restApi.get(landingWidgetUrl) || null;
    if (!config) {
      console.info('LandingWidget is not configured');
      return null;
    }
    // Legacy config from GerritSiteFooter.html
    if (config.projectPatterns) {
      const configMatchesProject = config.projectPatterns.some(
        (pattern) => project.match(pattern));
      if (!configMatchesProject) {
        return null;
      }
    }
    return config;
  }

  /**
   * Fetch JSON from the given url endpoint.
   * @param {!string} url to fetch the JSON from.
   * @param {?Object} options to pass to fetch.
   * @returns {?Object}
   */
  async _fetchJSON(url, options) {
    const JSON_PREFIX = ')]}\'';
    const response = await fetch(url, options);
    if (response.status == 204 || !response.ok) {
      console.error(`${url} returned with status ${response.status}.`);
      return null;
    }
    let responseText = await response.text();
    try {
      if (responseText.startsWith(JSON_PREFIX)) {
        responseText = responseText.substring(JSON_PREFIX.length);
      }
      return JSON.parse(responseText);
    } catch (e) {
      console.error(`${url} returned invalid JSON '${responseText}'`);
      return null;
    }
  }
}

customElements.define(ChromiumLandingWidget.is, ChromiumLandingWidget);
