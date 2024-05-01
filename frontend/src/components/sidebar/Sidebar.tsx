import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";

export default function Sidebar() {
  return (
    <div>
      <LogoutButton />
      <Conversations />
      <SearchInput />
      <div className="divider px-3"></div>
    </div>
  );
}
