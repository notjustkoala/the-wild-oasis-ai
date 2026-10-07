import { NavLink } from "react-router-dom";
import styled from "styled-components";
// import { IconName } from "react-icons/hi2";
import {
  HiOutlineCalendarDays,
  HiOutlineCog6Tooth,
  HiOutlineHome,
  HiOutlineHomeModern,
  HiOutlineUsers,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import { useUser } from "../features/authentication/useUser";
import { useApprovalRequests } from "../features/approvals/useApprovalRequests";

const Badge = styled.span`margin-left:auto;background:var(--color-brand-100);color:var(--color-brand-700);border-radius:2rem;padding:.1rem .7rem;font-size:1.2rem;`;

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  @media (max-width: 70rem) {
    flex-direction: row;
    overflow-x: auto;
    & > li { flex-shrink: 0; }
  }
`;

const StyledNavLink = styled(NavLink)`
  &:link,
  &:visited {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    color: var(--color-grey-600);
    font-size: 1.6rem;
    font-weight: 500;
    padding: 1.2rem 2.4rem;
    transition: all 0.3s;
  }

  /* This works because react-router places the active class on the active NavLink */
  &:hover,
  &:active,
  &.active:link,
  &.active:visited {
    color: var(--color-grey-800);
    background-color: var(--color-grey-50);
    border-radius: var(--border-radius-sm);
  }

  & svg {
    width: 2.4rem;
    height: 2.4rem;
    color: var(--color-grey-400);
    flex-shrink: 0;
    transition: all 0.3s;
  }

  &:hover svg,
  &:active svg,
  &.active:link svg,
  &.active:visited svg {
    color: var(--color-brand-600);
  }
`;

export default function MainNav() {
  const { user } = useUser();
  const role = user?.app_metadata?.role;
  const isAdmin = role === "admin";
  const { data } = useApprovalRequests(isAdmin ? "inbox" : "mine", "pending");
  const count = isAdmin ? data?.pendingCount : data?.unreadCount || data?.pendingCount;
  return (
    <nav>
      <NavList>
        {role === "admin" || role === "staff" ? <li>
          <StyledNavLink to={isAdmin ? "./approvals" : "./my-requests"}>
            <HiOutlineClipboardDocumentCheck />
            <span>{isAdmin ? "Approvals" : "Request"}</span>
            {count ? <Badge role="status" aria-label={`${count} ${!isAdmin && data?.unreadCount ? "unread results" : "pending requests"}`}>{count}</Badge> : null}
          </StyledNavLink>
        </li> : null}
        <li>
          <StyledNavLink to="./dashboard">
            <HiOutlineHome />
            <span>Home</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="./bookings">
            <HiOutlineCalendarDays />
            <span>Bookings</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="./cabins">
            <HiOutlineHomeModern />
            <span>Cabins</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="./users">
            <HiOutlineUsers />
            <span>Users</span>
          </StyledNavLink>
        </li>
        <li>
          <StyledNavLink to="./settings">
            <HiOutlineCog6Tooth />
            <span>Settings</span>
          </StyledNavLink>
        </li>
      </NavList>
    </nav>
  );
}
