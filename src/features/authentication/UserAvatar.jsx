import { useState } from "react";
import styled, { css } from "styled-components";
import { HiOutlineUser } from "react-icons/hi2";
import { useUser } from "./useUser";

const StyledUserAvatar = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  font-weight: 500;
  font-size: 1.4rem;
  color: var(--color-grey-600);
  min-width: 0;
  span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

const avatarSize = css`
  width: 3.6rem;
  height: 3.6rem;
  flex: 0 0 3.6rem;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  outline: 2px solid var(--color-grey-100);
`;
const Avatar = styled.img`
  ${avatarSize}
  display: block;
  object-fit: cover;
  object-position: center;
`;
const AvatarFallback = styled.div`
  ${avatarSize}
  display: grid;
  place-items: center;
  background: var(--color-grey-100);
  svg { width: 2.2rem; height: 2.2rem; }
`;
const DEFAULT_AVATAR = "/default-user.jpg";

function UserAvatar() {
  const { user } = useUser();
  const metadata = user?.user_metadata ?? {};
  const fullName = metadata.fullName || metadata.full_name || metadata.name || "User";
  const source = typeof metadata.avatar === "string" && metadata.avatar.trim() ? metadata.avatar.trim() : DEFAULT_AVATAR;
  const [failedSources, setFailedSources] = useState(() => new Set());
  const displaySource = failedSources.has(source) ? DEFAULT_AVATAR : source;
  const label = `Avatar of ${fullName}`;

  return (
    <StyledUserAvatar>
      {failedSources.has(displaySource) ? <AvatarFallback role="img" aria-label={label}><HiOutlineUser aria-hidden="true" /></AvatarFallback> : <Avatar
        src={displaySource}
        alt={label}
        onError={() => setFailedSources(previous => new Set([...previous, displaySource]))}
      />}
      <span title={fullName}>{fullName}</span>
    </StyledUserAvatar>
  );
}

export default UserAvatar;
