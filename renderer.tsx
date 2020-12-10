import { LensRendererExtension, Interface, Component, K8sApi } from "@k8slens/extensions";
import React from "react"

import { GlobalPage } from "./components/global-page";
import { ClusterPage } from "./components/cluster-page";
import { GlobalPageMenuIcon } from "./components/GlobalPageMenuIcon";
import { TheMap } from "./components/the-map";
import { NodeDetailsItem } from "./components/node-details-item";

import { LocationPreferenceHint, LocationPreferenceInput } from "./components/location-preference";
import { locationPreferencesStore } from "./components/location-store";

const { Icon } = Component;

export default class RendererExtension extends LensRendererExtension {

  async onActivate(): Promise<void> {
    console.log("location renderer activated");
    await locationPreferencesStore.loadExtension(this);
  }

  onDeactivate(): void {
    console.log("location renderer deactivated");
  }

  globalPages: Interface.PageRegistration[] = [
    {
      id: "location",
      components: {
        Page: () => <GlobalPage extension={this}/>,
      }
    }
  ]

  globalPageMenus: Interface.PageMenuRegistration[] = [
    {
      title: "Map Overview",
      target: { pageId: "location"},
      components: {
        Icon: GlobalPageMenuIcon,
      }
    }
  ]

  #clusterPageId = "cluster_page";
  clusterPages = [
    // a standard cluster page
    {
      id: this.#clusterPageId,
      title: "Cluster Map",
      components: {
        Page: (): JSX.Element => <ClusterPage extension={this} />,
         }
    },
  ]

  clusterPageMenus = [
    // a cluster menu item which links to a cluster page
    {
      title: "Cluster Map",
      target: {
        pageId: this.#clusterPageId,
        params: {}
      },
      components: {
        Icon: (): JSX.Element => <Icon material="map" />,
      }
    },
  ];

  kubeObjectDetailItems = [
    {
      kind: "Node",
      apiVersions: ["v1"],
      priority: 100000000,
      components: {
        Details: (props: Component.KubeObjectDetailsProps<K8sApi.Node>) => <NodeDetailsItem {...props} />
      }
    }
  ];
  
  appPreferences = [
    {
      title: "Location Preferences",
      components: {
        Input: () => <LocationPreferenceInput preferences={locationPreferencesStore}/>,
        Hint: () => <LocationPreferenceHint/>
      }
    }
  ];
}
