import { Input } from "@/components/ui/Input";
import { isPlaceSearchAvailable } from "@/modules/apple-place-search";

import { SearchablePicker } from "./SearchablePicker";

interface LocationPickerProps {
  name: string;
  address: string;
  onChange: (value: { name: string; address: string }) => void;
}

export const LocationPicker = ({
  name,
  address,
  onChange,
}: LocationPickerProps) => {
  // TODO: When adding Android support, wire in Google Places (or Mapbox) inside
  // modules/apple-place-search so isPlaceSearchAvailable() returns true on Android too.
  if (!isPlaceSearchAvailable()) {
    return (
      <>
        <Input
          label="Location"
          placeholder="e.g. Joe's Pizza"
          value={name}
          onChangeText={(text) => onChange({ name: text, address })}
        />
        <Input
          label="Address"
          placeholder="123 Main St, ..."
          value={address}
          onChangeText={(text) => onChange({ name, address: text })}
        />
      </>
    );
  }

  return <SearchablePicker name={name} address={address} onChange={onChange} />;
};
