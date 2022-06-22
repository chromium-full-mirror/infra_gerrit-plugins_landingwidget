// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

package com.googlesource.chromium.plugins.landingwidget;

import com.google.common.flogger.FluentLogger;
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

class GetLandingWidgetConfig implements RestReadView<ProjectResource> {
  private static final FluentLogger logger = FluentLogger.forEnclosingClass();
  private static final String PROJECT = "project";
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

    if (!project.getUser().isIdentifiedUser()) {
      return Response.none();
    }

    Config cfg =
        configFactory.getProjectPluginConfigWithInheritance(project.getNameKey(), pluginName);

    Iterator<String> names = cfg.getSubsections(PROJECT).iterator();
    if (!names.hasNext()) {
      logger.atInfo().log("Project %s has an empty config.", project.getName());
      return Response.none();
    }
    String name = names.next();
    if (names.hasNext()) {
      logger.atInfo().log(
          "Project %s has more than one config; using the first.", project.getName());
    }

    r.disabled = cfg.getString(PROJECT, name, "disabled");
    r.instanceName = cfg.getString(PROJECT, name, "instanceName");
    r.serviceUrl = cfg.getString(PROJECT, name, "serviceUrl");
    r.endpoint = cfg.getString(PROJECT, name, "endpoint");
    r.copyText = cfg.getString(PROJECT, name, "copyText");
    return Response.ok(r);
  }

  static class LandingConfig {
    @SerializedName("disabled")
    String disabled;

    @SerializedName("instanceName")
    String instanceName;

    @SerializedName("serviceUrl")
    String serviceUrl;

    @SerializedName("endpoint")
    String endpoint;

    @SerializedName("copyText")
    String copyText;
  }
}
