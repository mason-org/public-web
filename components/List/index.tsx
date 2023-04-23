import { HTMLAttributes, ReactNode } from "react"

import styles from "./index.module.css"

type ListProps = HTMLAttributes<HTMLOListElement | HTMLUListElement> & {
  as: "ol" | "ul"
  children: ReactNode
}

export function List({ children, as: As, ...rest }: ListProps) {
  return (
    <As className={styles.container} {...rest}>
      {children}
    </As>
  )
}

type ListItemProps = {
  children: ReactNode
}

export function ListItem({ children }: ListItemProps) {
  return <li>{children}</li>
}
