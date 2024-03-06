import React from "react"
import { NavLink, NavLinkProps } from "react-router-dom"

const MenuLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  (props, ref) => (
    <NavLink
      ref={ref}
      {...props}
      className={({ isActive }) =>
        `${props.className} ${isActive && 'Mui-selected'}`
      }
    />
  ),
)
MenuLink.displayName = 'NavLink'

export default MenuLink;