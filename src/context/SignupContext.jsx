import { createContext, useContext, useState } from "react";

const SignupContext = createContext();

export const SignupProvider = ({ children }) => {
  const [form, setForm] = useState({
    username: "",
    nickname: "",
    password: "",
  });

  return (
    <SignupContext.Provider value={{ form, setForm }}>
      {children}
    </SignupContext.Provider>
  );
};

export const useSignup = () => useContext(SignupContext);
