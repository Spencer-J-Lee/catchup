import { requireOptionalNativeModule } from "expo";
import { Platform } from "react-native";

export interface PlaceSearchResult {
  name: string;
  address: string;
}

interface ApplePlaceSearchNativeModule {
  search: (query: string) => Promise<PlaceSearchResult[]>;
}

const nativeModule =
  requireOptionalNativeModule<ApplePlaceSearchNativeModule>("ApplePlaceSearch");

export const isPlaceSearchAvailable = (): boolean => {
  return Platform.OS === "ios" && nativeModule != null;
};

export const searchPlaces = async (
  query: string,
): Promise<PlaceSearchResult[]> => {
  if (!nativeModule) {
    // TODO: swap in Google Places (or Mapbox/Nominatim) here for Android/web parity.
    return [];
  }

  const trimmed = query.trim();
  if (trimmed.length === 0) return [];
  return nativeModule.search(trimmed);
};
