import { Pill } from "./Pill";

interface ChipProps {
  selected: boolean;
  label: string;
  onPress: () => void;
}

export const Chip = ({ selected, label, onPress }: ChipProps) => {
  return (
    <Pill
      variant={selected ? "primary" : "secondary"}
      label={label}
      onPress={onPress}
    />
  );
};
