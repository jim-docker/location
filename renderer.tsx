import { LensRendererExtension, Interface, Component, K8sApi } from "@k8slens/extensions";
import React from "react"

import { GlobalPage } from "./components/GlobalPage";
import { GlobalPageMenuIcon } from "./components/GlobalPageMenuIcon";
import { TheMap } from "./components/the-map";
import { NodeDetailsItem } from "./components/node-details-item";

const { Icon } = Component;

/**
 * 
 * RendererExtension which extends LensRendererExtension runs in Lens' 'renderer' process (NOT 'main' process)
 * main vs renderer <https://www.electronjs.org/docs/tutorial/quick-start#main-and-renderer-processes>
 * 
 * LensRendererExtension is the interface to Lens' renderer process. Its api allows you to access, configure, 
 * and customize Lens data add custom Lens UI elements, and generally run custom code in Lens' renderer process.
 * 
 * The custom Lens UI elements that can be added include global pages, cluster pages, 
 * cluster features, app preferences, status bar items... See details:
 * <https://docs.k8slens.dev/master/extensions/capabilities/common-capabilities/#renderer-extension>
 *
 * LensRendererExtension API doc <https://docs.k8slens.dev/master/extensions/api/classes/lensrendererextension/>
 *
 * To see console statements in 'renderer' process, go to the console tab in DevTools in Lens
 * View > Toggle Developer Tools > Console.
 * 
 * @export
 * @class RendererExtension
 * @extends {LensRendererExtension}
 */
export default class RendererExtension extends LensRendererExtension {

  /**
   *  `globalPages` allows you register custom global page.
   * 
   *  The global page is a full-screen page that hides all other content from a window.
   *
   *  ```
   *            Lens
   *   +-----------------------+
   *   |                       |
   *   |                       |
   *   |      globalPages      |
   *   |                       |
   *   |                       |
   *   |                       |
   *   +-----------------------+
   * 
   * ```
   *
   * @memberof RendererExtension
   */
  globalPages: Interface.PageRegistration[] = [
    {
      id: "location",
      components: {
        Page: () => <GlobalPage extension={this}/>,
      }
    }
  ]

  /**
   *  `globalPageMenus` allows you register custom global page.
   *
   *  ```
   *            Lens
   *   +-----------------------+
   *   |*|                     |
   *   |*| <---------------+ globalPageMenus
   *   | |                     |
   *   | |                     |
   *   | |                     |
   *   | |                     |
   *   +-----------------------+
   * 
   * ```
   *
   * @memberof RendererExtension
   */
  globalPageMenus: Interface.PageMenuRegistration[] = [
    {
      title: "Map Overview",
      target: { pageId: "location"},
      components: {
        Icon: GlobalPageMenuIcon,
      }
    }
  ]

  /**
   *  `clusterPages` allows you register custom cluster page.
   *
   *  ```
   *            Lens
   *   +-----------------------+
   *   |*|-----|               |
   *   |*|-----|               |
   *   | |-----|  clusterPages |
   *   | +-----+               |
   *   | |     |               |
   *   | |     |               |
   *   +-----------------------+
   * 
   * ```
   *
   * @memberof RendererExtension
   */
  #clusterPageId = "cluster_page";
  clusterPages = [
    // a standard cluster page
    {
      id: this.#clusterPageId,
      title: "Cluster Map",
      components: {
        Page: (): JSX.Element => (
          <div style={{
            padding: "2em",
          }}>
            <TheMap height="600px" />
          </div>      
        ),
         }
    },
  ]
  /**
   *  `clusterPageMenus` allows you register custom cluster page menu items.
   * 
   *  `clusterPageMenus` are menu items showing the sidebar of  a `clusterPages`.
   *  
   * ```
   *             Lens
   *   +-----------------------+
   *   |*|-----|               |
   *   |*|-----|  <---------------+ clusterPageMenus
   *   | |-----|               |
   *   | +-----+               |
   *   | |     |               |
   *   | |     |               |
   *   +-----------------------+
   * 
   * ```
   *
   * @memberof RendererExtension
   */

  #menuItemParentId = "cluster_page_menu_folder";
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
      priority: 1000,
      components: {
        Details: (props: Component.KubeObjectDetailsProps<K8sApi.Node>) => <NodeDetailsItem {...props} />
      }
    }
  ];  
}
