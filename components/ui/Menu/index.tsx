import { Children, isValidElement, type ReactNode } from "react";
import * as DropdownMenu from "zeego/dropdown-menu";

interface MenuProps {
  children: ReactNode;
}

const MenuRoot = ({ children }: MenuProps) => {
  const childArray = Children.toArray(children);
  const trigger = childArray.find(
    (child) => isValidElement(child) && child.type === DropdownMenu.Trigger,
  );
  const content = childArray.filter(
    (child) => !(isValidElement(child) && child.type === DropdownMenu.Trigger),
  );

  return (
    <DropdownMenu.Root>
      {trigger}
      <DropdownMenu.Content>{content}</DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export const Menu = Object.assign(MenuRoot, {
  Trigger: DropdownMenu.Trigger,
  Item: DropdownMenu.Item,
  ItemTitle: DropdownMenu.ItemTitle,
  ItemSubtitle: DropdownMenu.ItemSubtitle,
  ItemIcon: DropdownMenu.ItemIcon,
  ItemIndicator: DropdownMenu.ItemIndicator,
  CheckboxItem: DropdownMenu.CheckboxItem,
  Separator: DropdownMenu.Separator,
  Group: DropdownMenu.Group,
  Label: DropdownMenu.Label,
  Sub: DropdownMenu.Sub,
  SubTrigger: DropdownMenu.SubTrigger,
  SubContent: DropdownMenu.SubContent,
});
