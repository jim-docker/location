import "./global-page.css";
import React from "react";
import { findDOMNode } from "react-dom";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Component, K8sApi, LensRendererExtension, Store } from "@k8slens/extensions";
import { TheMap } from "./the-map";

const { PageLayout } = Component;

const clusterStore = Store.clusterStore

@observer
export class GlobalPage extends React.Component<{ extension: LensRendererExtension }> {

  @observable locations: [ lon: number, lat: number ][] = [];
  @observable clusterLabels: string[] = [];
  @observable hoverText: string = "";
  private rootElem: HTMLElement;

  async componentDidMount() {
    this.locations = [];
    this.clusterLabels = [];

    await Promise.all(clusterStore.connectedClustersList.map(async (cluster) => await this.addClusterLocations(cluster)));
    var locations = this.locations;
    this.locations = [];
    this.locations = locations;
  }

  componentDidUpdate() {
    if (!this.rootElem) {
      try {
        this.rootElem = findDOMNode(this) as HTMLElement;
      } catch {

      }
    }
  }

  render() {
    console.log("rendering global page");

    var hoverElem;
    if (this.rootElem) {
      console.log("got rootElem");
      hoverElem = this.rootElem.querySelector("#hoverCluster");
    }

    return (
      <PageLayout
        header={
          <h2 key={"header"}>Clusters Map</h2>
        }
        showOnTop
      >
        <div>
          <TheMap height="600px" points={this.locations} isLonLat={true} labels={this.clusterLabels} onClick={this.onClick} /*hoverElem={hoverElem}*/ />
          <HoverText text={this.hoverText} />
        </div>      
      </PageLayout>
    )
  }

  async addClusterLocations(cluster: Store.Cluster) {

    // find the geolocations ConfigMap on the cluster
    const configMapApi = K8sApi.forCluster(cluster, K8sApi.ConfigMap);
    const nodeApi = K8sApi.forCluster(cluster, K8sApi.Node);
    try {
      const configMap = await configMapApi.get({name: "geolocations", namespace: "default"});
      const nodes = await nodeApi.list();
      var data = observable.map(configMap.data);
      nodes.forEach(node => {
        var nodeName = node.getName();
        var lonStr = data.get([cluster.contextName, nodeName, "lon"].join("."));
        var latStr = data.get([cluster.contextName, nodeName, "lat"].join("."));
        console.log(`cluster: ${cluster.contextName}; node: ${nodeName}; lat: ${latStr}; lon: ${lonStr}`);
        this.locations.push([+lonStr, +latStr]);
        this.clusterLabels.push(cluster.contextName);
      });

    } catch {
      // not found, geolocation not available
      console.log(`geolocation data not available for ${cluster.contextName}`);
    }

  }

  onClick(clusterLabel: string): void {
    console.log("onClick() called for ", clusterLabel);
    this.hoverText = `Activate ${clusterLabel}`;
    clusterStore.setActive(clusterLabel);
  }
}

class HoverText extends React.Component<{ text: string }> {
  
  shouldComponentUpdate(prevProps: any, prevState: any) {
    if (prevProps.text != this.props.text) return true;
    return false;
  }
  
  render() {
    console.log("rendering hover text");

    return <div className="hovercluster" id="hoverCluster">{this.props.text}</div>
  }
}
