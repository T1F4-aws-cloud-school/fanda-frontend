import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "../pages/Login"
import SignUp from "../pages/SignUp"
import PrivacyPolicy from "../pages/PrivacyPolicy"
import PersonalInfoConsent from "../pages/PersonalInfoConsent";
import UserTerms from "../pages/UserTerms";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/terms/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms/personal" element={<PersonalInfoConsent />} />
        <Route path="/terms/use" element={<UserTerms />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Router