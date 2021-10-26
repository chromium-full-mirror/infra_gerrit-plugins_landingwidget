// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import {PluginApi} from '@gerritcodereview/typescript-api/plugin';
import {ChangeInfo} from '@gerritcodereview/typescript-api/rest-api';
import {css, html, LitElement, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators';

declare interface LandingWidgetConfig {
  disabled: boolean;
  instanceName: string;
  serviceUrl: string;
  projectPatterns: string[];
}

declare interface LandingWidgetResponse {
  versions: string[];
}

declare interface LandingWidgetVersion {
  text: string;
  link: string;
}

declare global {
  interface HTMLElementTagNameMap {
    'chromium-landing-widget': ChromiumLandingWidget;
  }
}

/**
 * Display a widget with the version of the first build that contains the
 * change (i.e. the version that the change 'landed in').
 */
@customElement('chromium-landing-widget')
export class ChromiumLandingWidget extends LitElement {
  /** Guaranteed to be provided by the 'change-metadata-item' endpoint. */
  @property()
  plugin!: PluginApi;

  /** Guaranteed to be provided by the 'change-metadata-item' endpoint. */
  @property()
  change!: ChangeInfo;

  @state()
  hasVersionInfo = false;

  @state()
  versions: LandingWidgetVersion[] = [];

  override update(changedProperties: PropertyValues) {
    if (changedProperties.has('change')) {
      this.onChange();
    }
    super.update(changedProperties);
  }

  static override styles = css`
    /* Copied from gr-change-metadata-shared-styles */
    section {
      display: table-row;
    }

    section:not(:first-of-type) .title,
    section:not(:first-of-type) .value {
      padding-top: var(--spacing-s);
    }

    .title,
    .value {
      display: table-cell;
      vertical-align: top;
    }

    .title {
      color: var(--deemphasized-text-color);
      max-width: 20em;
      padding-left: var(--metadata-horizontal-padding);
      padding-right: var(--metadata-horizontal-padding);
      word-break: break-word;
    }

    a {
      color: var(--link-color);
    }

    ul {
      list-style-type: none;
      padding-left: 0;
    }
  `;

  override render() {
    if (!this.hasVersionInfo) {
      return;
    }
    const items = this.versions.map((v: LandingWidgetVersion) =>
        html`<li><a href="${v.link}" target="_blank">${v.text}</a></li>`);
    return html`
      <section>
        <span class="title">Landed in</span>
        <ul class="value">${items}</ul>
      </section>
    `;
  }

  async onChange() {
    if (!this.change) {
      this.hasVersionInfo = false;
      return;
    }

    // Display only for merged changes.
    if (this.change.status !== 'MERGED') {
      this.hasVersionInfo = false;
      return;
    }

    // Fetch the configuration for the current project, if any.
    const config = await this.getProjectConfig(this.change.project);
    if (!config || config.disabled) {
      console.info('LandingWidget disabled.');
      this.hasVersionInfo = false;
      return;
    }

    // Fetch the first build version that the change landed in.
    const changeNum = this.change._number;
    // We need to use fetch instead of restApi because we need to include
    // credentials.
    const response = await this.fetchJSON(
      `${config.serviceUrl}/lookupFirstBuild` +
        `?instance=${config.instanceName}&cl=${changeNum}`,
      {credentials: 'include'}
    ) as LandingWidgetResponse;
    const versionsLink =
        `${config.serviceUrl}/cl?q=${config.instanceName}:${changeNum}`;

    if (response?.versions) {
      this.versions = response.versions.map((v: string) => {
        return {text: v, link: versionsLink};
      });
      this.hasVersionInfo = response.versions.length > 0;
    } else {
      this.hasVersionInfo = false;
    }
  }

  /**
   * Get the LandingWidget configuration for the given project.
   */
  async getProjectConfig(project: string): Promise<LandingWidgetConfig | null> {
    const landingWidgetUrl =
        `/projects/${encodeURIComponent(project)}/landingwidget~config`;
    const config: LandingWidgetConfig =
        await this.plugin.restApi().get(landingWidgetUrl) || null;
    if (!config) {
      console.info('LandingWidget is not configured');
      return null;
    }
    // Legacy config from GerritSiteFooter.html
    if (config.projectPatterns) {
      const configMatchesProject = config.projectPatterns.some(pattern =>
          project.match(pattern));
      if (!configMatchesProject) {
        return null;
      }
    }
    return config;
  }

  /**
   * Fetch JSON from the given url endpoint.
   */
  async fetchJSON(url: string, options: object): Promise<object | null> {
    const JSON_PREFIX = ")]}'";
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
      return JSON.parse(responseText) as object;
    } catch (e) {
      console.error(`${url} returned invalid JSON '${responseText}'`);
      return null;
    }
  }
}
