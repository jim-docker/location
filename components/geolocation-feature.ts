import { ClusterFeature, Store, K8sApi } from "@k8slens/extensions";
import * as path from "path";

export class GeolocationFeature extends ClusterFeature.Feature {

  async install(cluster: Store.Cluster): Promise<void> {

    super.applyResources(cluster, path.join(__dirname, "../resources/"));
  }

  async upgrade(cluster: Store.Cluster): Promise<void> {
    return this.install(cluster);
  }

  async updateStatus(cluster: Store.Cluster): Promise<ClusterFeature.FeatureStatus> {
    try {
      this.status.canUpgrade = false;
      const daemonsetApi = K8sApi.forCluster(cluster, K8sApi.DaemonSet);
      const daemonset = await daemonsetApi.get({name: "geolocator", namespace: "kube-system"});
      if (daemonset?.kind) {
        this.status.installed = true;
      } else {
        this.status.installed = false;
      }
    } catch(e) {
      if (e?.error?.code === 404) {
        this.status.installed = false;
      }
    }

    return this.status;
  }

  async uninstall(cluster: Store.Cluster): Promise<void> {
    const configMapApi = K8sApi.forCluster(cluster, K8sApi.ConfigMap);
    await configMapApi.delete({name: "geolocations", namespace: "default"});

    const daemonsetApi = K8sApi.forCluster(cluster, K8sApi.DaemonSet);
    await daemonsetApi.delete({name: "geolocator", namespace: "kube-system"});
  }
}