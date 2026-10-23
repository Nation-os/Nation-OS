import NationWorkspace from "../../components/nation-workspace";

export default function WorkspaceLayout({ children }) {
  return (
    <>
      <NationWorkspace />
      {children}
    </>
  );
}
