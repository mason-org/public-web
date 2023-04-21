import { HTMLAttributes, ReactNode } from "react";
import styles from "./index.module.css";

type ListProps = {
  as: "ol" | "ul";
  children: ReactNode;
} & HTMLAttributes<HTMLOListElement | HTMLUListElement>;

export const List = ({ children, as: As, ...rest }: ListProps) => (
  <As className={styles["container"]} {...rest}>
    {children}
  </As>
);

type ListItemProps = {
  children: ReactNode;
};

export const ListItem = ({ children }: ListItemProps) => <li>{children}</li>;
