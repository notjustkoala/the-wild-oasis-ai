import { fireEvent, render, screen } from "@testing-library/react";
import UserAvatar from "../src/features/authentication/UserAvatar";
const auth = vi.hoisted(() => ({ user: { user_metadata: {} } as { user_metadata: { fullName?: string; avatar?: string } } }));
vi.mock("../src/features/authentication/useUser", () => ({ useUser: () => ({ user: auth.user }) }));
it("uses the root default image from nested booking routes when no avatar exists", () => {
  auth.user = { user_metadata: {} };
  render(<UserAvatar />);
  expect(screen.getByRole("img")).toHaveAttribute("src", "/default-user.jpg");
  expect(screen.getByRole("img")).toHaveAttribute("alt", "Avatar of User");
});
it("falls back from a broken upload to the default and then a bounded icon", () => {
  auth.user = { user_metadata: { fullName: "Synthetic User", avatar: "/broken-avatar.jpg" } };
  render(<UserAvatar />);
  fireEvent.error(screen.getByRole("img"));
  expect(screen.getByRole("img")).toHaveAttribute("src", "/default-user.jpg");
  fireEvent.error(screen.getByRole("img"));
  expect(screen.getByRole("img")).not.toHaveAttribute("src");
  expect(screen.getByRole("img").querySelector("svg")).toBeInTheDocument();
});
