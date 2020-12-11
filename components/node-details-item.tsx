import { Component, K8sApi, Store } from "@k8slens/extensions";
import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { TheMap } from "./the-map"

const clusterStore = Store.clusterStore

@observer
export class NodeDetailsItem extends React.Component<Component.KubeObjectDetailsProps<K8sApi.Node>> {
  @observable private position: [lon: number, lat: number] = [0.0, 0.0];
  @observable private points: [lon: number, lat: number][] = [];
  @observable private pods: K8sApi.Pod[] =[];
  
  async componentDidMount() {
    await this.UpdateMap();
  }

  async componentDidUpdate(prevProps: any) {
    const { object: node } = this.props;
    const { object: prevNode } = prevProps;

    if (node.getName() === prevNode.getName()) {
      return;
    }
    await this.UpdateMap();
  }

  async UpdateMap() {
    const { object: node } = this.props;

    console.log("getting pods for node...");
    this.pods = await K8sApi.podsApi.list();
    console.log("...got pods for node");
    this.pods = this.pods.filter(pod => pod.getNodeName() === this.props.object.getName());

    // get the node's position
    try {
      var cluster = clusterStore.getById(clusterStore.activeClusterId);
      var clusterName = cluster.contextName;
      const configMap = await K8sApi.configMapApi.get({name: "geolocations", namespace: "default"});
      var nodeName = node.getName();
      var data = observable.map(configMap.data);
      var lonStr = data.get([clusterName, nodeName, "lon"].join("."));
      var latStr = data.get([clusterName, nodeName, "lat"].join("."));
      console.log(`cluster: ${clusterName}; node: ${nodeName}; lat: ${latStr}; lon: ${lonStr}`);
      this.position = [+lonStr, +latStr];
    } catch {
      // not found, geolocation not available
      console.log(`geolocation data not available for ${clusterName}`);
    }

    // show the pod count on the map circle by adding the same number of points (ugh hackweek afterall)
    var points: [lon: number, lat: number][] = [];
    this.pods.forEach(pod => points.push(this.position));
    this.points = points;
  }

  render() {
    console.log("rendering node details");
    return (
      <div>
        <Component.DrawerTitle title="Node Map" />
        {this.points.length > 0 && <TheMap height="360px" points={this.points} isLonLat={true} />}
      </div>
    )
  }
}