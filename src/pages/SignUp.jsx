"use client"

import { useState } from "react"
import "./SignUp.css"
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();

  // 뒤로가기 클릭 핸들러
  const handleBack = () => {
    navigate("/login");
  };

  // 개별 약관 상태
  const [terms, setTerms] = useState({
    privacyPolicy: false,
    personalInfo: false,
    termsOfUse: false,
  })

  // 전체 동의 상태
  const allChecked = Object.values(terms).every(Boolean)

  // 전체 동의 토글
  const handleAllCheck = (e) => {
    const checked = e.target.checked
    setTerms({
      privacyPolicy: checked,
      personalInfo: checked,
      termsOfUse: checked,
    })
  }

  // 개별 동의 토글
  const handleCheck = (e) => {
    const { name, checked } = e.target
    setTerms(prev => ({
      ...prev,
      [name]: checked,
    }))
  }

  // 다음 버튼 클릭 핸들러
  const handleNext = () => {
    if (!allChecked) return
    console.log("다음 단계로 이동")
    // TODO: 페이지 이동 로직
  }

  return (
    <div className="signup-container">
      <button className="back-button" onClick={handleBack}>
      {"<"}
      </button>
      <h1 className="title">
        세끼통살 이용을 위해{'\n'}
        이용약관에 동의해 주세요
      </h1>

      <label className="checkbox all-check">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={handleAllCheck}
        />
        <span>이용약관 전체 동의</span>
      </label>

      <div className="checkbox-group">
        <label className="checkbox">
          <input
            type="checkbox"
            name="privacyPolicy"
            checked={terms.privacyPolicy}
            onChange={handleCheck}
          />
          <span>(필수) 개인정보처리방침을 읽고 숙지하였습니다</span>
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            name="personalInfo"
            checked={terms.personalInfo}
            onChange={handleCheck}
          />
          <span>(필수) 개인정보 수집 및 이용 동의</span>
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            name="termsOfUse"
            checked={terms.termsOfUse}
            onChange={handleCheck}
          />
          <span>(필수) 이용약관 동의</span>
        </label>
      </div>

      <button
        className="next-button"
        onClick={handleNext}
        disabled={!allChecked}
      >
        다음
      </button>
    </div>
  )
}