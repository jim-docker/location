import { Component, K8sApi } from "@k8slens/extensions";
import React from "react";
import { TheMap } from "./the-map"

export class NodeDetailsItem extends React.Component<Component.KubeObjectDetailsProps<K8sApi.Node>> {

  state: {
    position: [lon: number, lat: number];
  } = {
    position: [0, 0]
  };

  private points: [lon: number, lat: number][] = [];
  private pods: K8sApi.Pod[] =[];
  
  async componentDidMount() {
    console.log("getting pods for node...");
    this.pods = await K8sApi.podsApi.list();
    console.log("...got pods for node");
    this.pods = this.pods.filter(pod => pod.getNodeName() === this.props.object.getName());

    // get the node's position
    this.setState({position: [-80.577277, 43.468069]});

    // show the pod count on the map circle by adding the same number of points (ugh hackweek afterall)
    this.points = [];
    this.pods.forEach(pod => this.points.push(this.state.position));
  }

  render() {
    console.log("rendering node details");
    return (
      <div>
        <Component.DrawerTitle title="Node Map" />
        {this.points.length > 0 && <TheMap height="360px" points={this.points}/>}
      </div>
    )
  }
}