import { Store } from "@k8slens/extensions";
import { observable, toJS } from "mobx";

export type LocationPreferencesModel = {
  clustering: boolean;
};

export class LocationPreferencesStore extends Store.ExtensionStore<LocationPreferencesModel> {

  @observable  clustering = false;

  private constructor() {
    super({
      configName: "location-preferences-store",
      defaults: {
        clustering: false
      }
    });
  }

  protected fromStore({ clustering }: LocationPreferencesModel): void {
    this.clustering = clustering;
  }

  toJSON(): LocationPreferencesModel {
    return toJS({
      clustering: this.clustering
    }, {
      recurseEverything: true
    });
  }
}

export const locationPreferencesStore = LocationPreferencesStore.getInstance<LocationPreferencesStore>();