import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "../pages/Login"
import SignUp from "../pages/SignUp"
import PrivacyPolicy from "../pages/PrivacyPolicy"
import PersonalInfoConsent from "../pages/PersonalInfoConsent";
import UserTerms from "../pages/UserTerms";
import NamedInput from "../pages/NameIdInput";
import PasswordInput from "../pages/PasswordInput";
import SignUpComplete from "../pages/SignUpComplete.jsx";
import Detail from "../pages/Detail/Detail.jsx";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
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