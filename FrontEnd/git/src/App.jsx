import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchPage from "./Component/gitSearchUsers";
import RepositoryList from "./Component/RepositoryList";
import RepositoryDetails from "./Component/RepositoryDetails";
import FollowersList from "./Component/FollowersList";
import { store } from "../React/store";
import { Provider } from 'react-redux'

function App() {
  return (
   <Provider store={store}>
 <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/repos" element={<RepositoryList />} />
        <Route path="/repos/:repoName" element={<RepositoryDetails />} />
        <Route path="/followers" element={<FollowersList />} />
      </Routes>
    </Router>

   </Provider>
  );
}

export default App;
