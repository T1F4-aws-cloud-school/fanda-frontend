import Router from './routes/Router';
import { SignupProvider } from './context/SignupContext';

function App() {
  return (
    <SignupProvider>
      <Router />
    </SignupProvider>
  );
}

export default App;