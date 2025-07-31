import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "../pages/Home"
import Login from "../pages/Login"
import SignUp from "../pages/Signup/SignUp.jsx"
import PrivacyPolicy from "../pages/Signup/PrivacyPolicy.jsx"
import PersonalInfoConsent from "../pages/Signup/PersonalInfoConsent.jsx";
import UserTerms from "../pages/Signup/UserTerms.jsx";
import NamedInput from "../pages/Signup/NameIdInput.jsx";
import PasswordInput from "../pages/Signup/PasswordInput.jsx";
import SignUpComplete from "../pages/Signup/SignUpComplete.jsx";
import Detail from "../pages/Detail/Detail.jsx";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/terms/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms/personal" element={<PersonalInfoConsent />} />
        <Route path="/terms/use" element={<UserTerms />} />
        <Route path="/signup/name" element={<NamedInput />} />
        <Route path="/signup/password" element={<PasswordInput />} />
        <Route path="/signup/complete" element={<SignUpComplete />} />
        <Route path="/product/detail" element={<Detail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Router