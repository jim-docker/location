import { Component, K8sApi } from "@k8slens/extensions";
import React from "react";
import { TheMap } from "./the-map"
export class NodeDetailsItem extends React.Component<Component.KubeObjectDetailsProps<K8sApi.Node>> {

  render() {
    return (
      <div>
        <Component.DrawerTitle title="Node Map" />
        <TheMap height="360px" />
      </div>
    )
  }
}