import classNames from "classnames";
import { Text, TextProps } from "react-native";

interface LabelProps extends TextProps {
  children: React.ReactNode;
  className?: string;
}

export const Label = ({ children, className, ...props }: LabelProps) => {
  return (
    <Text
      className={classNames(
        "text-sm font-medium text-muted dark:text-muted-dk",
        className,
      )}
      {...props}
    >
      {children}
    </Text>
  );
};
