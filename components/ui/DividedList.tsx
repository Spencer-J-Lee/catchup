import React from "react";

import { Divider } from "@/components/ui/Divider";

interface DividedListProps {
  children: React.ReactNode;
}

export const DividedList = ({ children }: DividedListProps) => {
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <>
      {items.map((child, index) => (
        <React.Fragment key={index}>
          {index > 0 ? <Divider className="my-2" /> : null}
          {child}
        </React.Fragment>
      ))}
    </>
  );
};
