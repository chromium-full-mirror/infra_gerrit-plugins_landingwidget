// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

package com.googlesource.chromium.plugins.landingwidget;

import com.google.gerrit.extensions.annotations.PluginName;
import com.google.gerrit.extensions.restapi.Response;
import com.google.gerrit.extensions.restapi.RestReadView;
import com.google.gerrit.server.config.PluginConfigFactory;
import com.google.gerrit.server.project.NoSuchProjectException;
import com.google.gerrit.server.project.ProjectResource;
import com.google.gson.annotations.SerializedName;
import java.util.Iterator;
import javax.inject.Inject;
import org.eclipse.jgit.lib.Config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


class GetLandingWidgetConfig implements RestReadView<ProjectResource> {
  private static final String PROJECT = "project";
  private static final Logger LOG = LoggerFactory.getLogger(GetLandingWidgetConfig.class);
  private final PluginConfigFactory configFactory;
  private final String pluginName;

  @Inject
  GetLandingWidgetConfig(PluginConfigFactory configFactory, @PluginName String pluginName) {
    this.configFactory = configFactory;
    this.pluginName = pluginName;
  }

  @Override
  public Response<LandingConfig> apply(ProjectResource project) throws NoSuchProjectException {
    LandingConfig r = new LandingConfig();

    if (!project.getControl().getUser().isIdentifiedUser()) {
      return Response.none();
    }

    Config cfg =
        configFactory.getProjectPluginConfigWithInheritance(project.getNameKey(), pluginName);

    Iterator<String> names = cfg.getSubsections(PROJECT).iterator();
    if (!names.hasNext()) {
      LOG.info("Project " + project.getName() + " has an empty config.");
      return Response.none();
    }
    String name = names.next();
    if (names.hasNext()) {
      LOG.info("Project " + project.getName() + " has more than one config; using the first.");
    }

    r.disabled = cfg.getString(PROJECT, name, "disabled");
    r.instanceName = cfg.getString(PROJECT, name, "instanceName");
    r.serviceUrl = cfg.getString(PROJECT, name, "serviceUrl");
    return Response.ok(r);
  }

  static class LandingConfig {
    @SerializedName("disabled")
    String disabled;

    @SerializedName("instanceName")
    String instanceName;

    @SerializedName("serviceUrl")
    String serviceUrl;
  }
}
