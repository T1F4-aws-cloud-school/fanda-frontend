import Router from './routes/Router';
import { SignupProvider } from './context/SignupContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <SignupProvider>
        <Router />
      </SignupProvider>
    </AuthProvider>
  );
}

export default App;