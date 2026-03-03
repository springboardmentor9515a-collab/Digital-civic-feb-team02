import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PetitionList from "./pages/PetitionList";
import PetitionDetail from "./pages/PetitionDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/petitions" element={<PetitionList />} />
        <Route path="/petitions/:id" element={<PetitionDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
