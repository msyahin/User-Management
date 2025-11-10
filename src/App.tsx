import { ModalManagerProvider } from "./components/modal/use-modal-manager";
import { modals } from "./components/modal/registry";
import UsersPage from "./pages/user-management";

function App() {
  return (
    <ModalManagerProvider modals={modals}>
      <UsersPage />
    </ModalManagerProvider>
  )
}

export default App
