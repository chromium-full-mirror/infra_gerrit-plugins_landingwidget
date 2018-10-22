// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

Gerrit.install(function(self) {

  /**
   * Gerrit JSON response prefix.
   */
  var JSON_PREFIX = ')]}\'';

  // Fetches JSON from URL, returns Promise.
  function fetchJSON(url) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = function() {
        var result = null;
        if (this.status === 204) {
          resolve(null);
        } else if (this.status >= 200 && this.status < 300) {
          try {
            result = JSON.parse(xhr.response.substring(JSON_PREFIX.length));
            resolve(result);
          } catch (_) {
            reject("Unable to parse JSON");
          }
        } else {
          reject("Got non-200 response");
        }
      };
      xhr.onerror = function() {
        reject("Unhandled error");
      };
      xhr.send();
    });
  }

  /**
   * @param {!Object} project
   * @returns {!Promise} that resolves to config Object or null.
   */
  var getProjectConfig = function(project) {
    var config = window.landingWidgetConfig;

    if (config && config.projectPatterns) {
      // Legacy config from GerritSiteFooter.html

      var isEnabledForProject = false;
      for (var i = 0; i < config.projectPatterns.length; i++) {
        if (project.match(config.projectPatterns[i])) {
          isEnabledForProject = true;
          break;
        }
      }
      if (!isEnabledForProject) {
        return Promise.resolve(null);
      }
    }

    if (config !== undefined) {
      return Promise.resolve(config);
    }

    // Otherwise, fetch it from plugin endpoint and store it for reuse.
    var landingWidgetURL = '/projects/' + encodeURIComponent(project) +
      '/landingwidget~config';
    return fetchJSON(landingWidgetURL).then(function(cfg) {
      window.landingWidgetConfig = cfg || null;
      if (!window.landingWidgetConfig) {
        console.log('LandingWidget is not configured.');
        return Promise.resolve(null);
      }
      return getProjectConfig(project);
    });
  };

  /**
   * A widget that displays the version of the first build that contains the
   * change (i.e. the version that the change 'landed in').
   * @constructor
   */
  var LandingWidget = function() {
    /**
     * The main <tr> of the widget which displays the version of the first build.
     * @type {!HTMLElement}
     */
    this.row = document.createElement('tr');
    this.row.innerHTML = '<th>&nbsp;</th><td>&nbsp;</td>';

    // Insert the row into the change info table, before the change actions row.
    var table = document.querySelector('#change_infoTable');
    if (table) {
      var tbody = table.querySelector('tbody');
      var changeActionsRow = tbody.querySelector('tr #change_actions');
      while (changeActionsRow && changeActionsRow.nodeName != 'TR') {
        changeActionsRow = changeActionsRow.parentNode;
      }
      if (changeActionsRow && changeActionsRow.parentNode == tbody) {
        tbody.insertBefore(this.row, changeActionsRow);
      } else {
        // Gerrit doesn't guarantee that #change_actions will forever be a child of
        // a <tr> of #change_infoTable; if not the case, fall back to just adding
        // the row at the bottom of the info table.
        tbody.appendChild(this.row);
      }
    } else {
      // TODO (viktard): Refactor when PolyGerrit plugins are implemented.
      var section = document.createElement('section');
      section.className = 'style-scope gr-change-metadata';
      section.innerHTML =
          '<span class="gr-change-metadata style-scope title"></span>' +
          '<span class="value style-scope gr-change-metadata">&nbsp;</span>';
      document.querySelector('gr-change-metadata > gr-external-style').appendChild(section);
      this.row = section;
    }
  };


  /**
   * Updates the widget.
   * @param {!Array<string>} versions List of version numbers to display.
   * @param {string} url Target url that will be opened when the users clicks any
   *     of the versions.
   */
  LandingWidget.prototype.update = function(versions, url) {
    var headerCell = this.row.querySelector('th');
    if (!headerCell) {
      headerCell = this.row.querySelector('.title');
    }
    headerCell.innerText = 'Landed in';

    var dataCell = this.row.querySelector('td');
    if (!dataCell) {
      dataCell = this.row.querySelector('.value');
    }
    if (versions.length > 0) {
      dataCell.innerHTML = '';
      versions.forEach(function(v) {
        var link = document.createElement('a');
        link.setAttribute('target', '_blank');
        link.setAttribute('href', url);
        link.innerText = v;
        dataCell.appendChild(link);
        dataCell.appendChild(document.createTextNode(' '));
      });
      var span = document.createElement('span');
      span.setAttribute('style',
        'font-weight: bold; background-color: #ffff00; color: #000');
      span.innerText = 'NEW!';
      dataCell.appendChild(span);
    } else {
      dataCell.innerText = 'Unknown';
    }
  };


  /**
   * Handles Gerrit's 'showchange' event.
   */
  self.on('showchange', function(change) {
    if (change.status != 'MERGED') {
      return;
    }

    getProjectConfig(change.project).then(function(config) {
      if (!config || config.disabled) {
        console.log('LandingWidget disabled.');
        return;
      }

      // Create widget now, with its final size, to prevent any re-layout later on
      // (when we know which build number to display) which could be distracting.
      var widget = new LandingWidget();

      // Fire off XHR to find the first build version.
      var xhr = new XMLHttpRequest();
      xhr.open('GET',
          config.serviceUrl + '/lookupFirstBuild?instance=' +
          config.instanceName + '&cl=' + change._number);
      xhr.withCredentials = true;
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          var safetyPrefix = ')]}\'\n';
          var responseText = xhr.responseText;
          if (responseText.indexOf(safetyPrefix) == 0) {
            responseText = responseText.substring(safetyPrefix.length);
          }
          var response = JSON.parse(responseText);
          var link = config.serviceUrl +
              '/cl?q=' + config.instanceName + ':' + change._number;
          widget.update(response.versions, link);
        }
      };
      xhr.send();
    });
  });
});
