import "./Terms.css";
import { useNavigate, useLocation } from "react-router-dom";

export default function PersonalInfoConsent() {
  const navigate = useNavigate();
  const location = useLocation();

  const isStandalone = location.pathname === "/terms/personal";

  return (
  <div className="terms-container">
    <div className="terms-header">
      {isStandalone && (
        <button className="back-button" onClick={() => navigate(-1)}>
          {"<"}
        </button>
      )}
      <h1 className="terms-title">개인정보처리동의서</h1>
    </div>
      <section className="terms-section">
        <h2>제1조(개인정보 수집 및 이용 목적)</h2>
        <p>
          이용자가 제공한 모든 정보는 다음의 목적을 위해 활용하며, 목적 이외의 용도로는 사용되지 않습니다.
          {"\n"}서비스 제공
        </p>
      </section>

      <section className="terms-section">
        <h2>제2조(개인정보 수집 및 이용 항목)</h2>
        <p>
          회사는 개인정보 수집 목적을 위하여 다음과 같은 정보를 수집합니다.
          {"\n"}성명, 전화번호 및 이메일
        </p>
      </section>

      <section className="terms-section">
        <h2>제3조(개인정보 보유 및 이용 기간)</h2>
        <p>
          수집한 개인정보는 수집·이용 동의일로부터 개인정보 수집·이용 목적을 달성할 때까지 보관 및 이용합니다.
          {"\n"}개인정보 보유기간의 경과, 처리목적의 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
        </p>
      </section>

      <section className="terms-section">
        <h2>제4조(동의 거부 관리)</h2>
        <p>
          귀하는 본 안내에 따른 개인정보 수집·이용에 대하여 동의를 거부할 권리가 있습니다.
          {"\n"}다만, 귀하가 개인정보 동의를 거부하시는 경우에 서비스 이용 제한의 불이익이 발생할 수 있음을 알려드립니다.
          {"\n\n"}본인은 위의 동의서 내용을 충분히 숙지하였으며, 위와 같이 개인정보를 수집·이용하는데 동의합니다.
        </p>
      </section>
    </div>
  );
}
