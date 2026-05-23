import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { Menu } from "@/components/ui/Menu";
import { useThemedColors } from "@/hooks/use-themed-colors";

interface HeaderMenuProps {
  onDelete: () => void;
}

export const HeaderMenu = ({ onDelete }: HeaderMenuProps) => {
  const colors = useThemedColors();

  return (
    <Menu>
      <Menu.Trigger>
        <Pressable
          hitSlop={12}
          className="p-2"
          accessibilityLabel="More options"
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color={colors.fgDefault}
          />
        </Pressable>
      </Menu.Trigger>

      <Menu.Item key="delete" destructive onSelect={onDelete}>
        <Menu.ItemTitle>Delete friend</Menu.ItemTitle>
        <Menu.ItemIcon ios={{ name: "trash" }} />
      </Menu.Item>
    </Menu>
  );
};
