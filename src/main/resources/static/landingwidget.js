/**
 * Display a widget with the version of the first build that contains the
 * change (i.e. the version that the change 'landed in').
 */
class ChromiumLandingWidget extends Polymer.Element {
  static get template() {
    return Polymer.html`
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
  }

  static get is() {
    return 'chromium-landing-widget';
  }

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
        type: Function,
      },
      versions: {
        type: Array,
        value: [],
      },
    };
  }

  static get observers() {
    return [
      '_onChange(change, restApi)',
    ];
  }

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
      console.log('LandingWidget disabled.');
      this.hasVersionInfo = false;
      return;
    }

    // Fetch the first build version that the change landed in.
    const changeNum = this.change._number;
    const response = await this.restApi(config.serviceUrl).get(
      `/lookupFirstBuild?instance=${config.instanceName}&cl=${changeNum}`);
    const versionsLink =
      `${config.serviceUrl}/cl?q=${config.instanceName}:${changeNum}`;

    if (response && response.versions) {
      this.versions = response.versions.map(v => {
        return {text: v, link: versionsLink}
      });
      this.hasVersionInfo = response.versions.length > 0;
    } else {
      this.hasVersionInfo = false;
    }
  }

  /**
   * Get the LandingWidget configuration for the given project.
   */
  async _getProjectConfig(project) {
    const landingWidgetUrl =
      `/projects/${encodeURIComponent(project)}/landingwidget~config`;
    const config = await this.restApi().get(landingWidgetUrl) || null;
    if (!config) {
      console.log('LandingWidget is not configured');
      return null;
    }
    // Legacy config from GerritSiteFooter.html
    if (config.projectPatterns) {
      const configMatchesProject = config.projectPatters.some(
        (pattern) => project.match(pattern));
      if (!configMatchesProject) {
        return null;
      }
    }
    return config;
  }
};

customElements.define(ChromiumLandingWidget.is, ChromiumLandingWidget);

Gerrit.install((plugin) => {
  plugin.registerCustomComponent(
    'change-metadata-item', 'chromium-landing-widget').onAttached(view => {
      view.restApi = plugin.restApi;
    });
});
