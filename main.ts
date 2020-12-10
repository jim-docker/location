import { LensMainExtension } from "@k8slens/extensions";
import { locationPreferencesStore } from "./components/location-store";

export default class MainExtension extends LensMainExtension {

  async onActivate(): Promise<void> {
    console.log("location main activated");
    await locationPreferencesStore.loadExtension(this);
  }

  onDeactivate(): void {
    console.log("location main deactivated");
  }
}
