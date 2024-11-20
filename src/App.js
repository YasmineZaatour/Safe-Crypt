import './App.css';
import SignIn from "./Components/SignIn";
import SignUp from "./Components/SignUp";
import ProtectedPage from './Components/ProtectedPage';

function App() {
  return (
    <div className="App">
      <SignIn />
      <SignUp />
      <ProtectedPage />

    </div>

  );
}

export default App;
