const TabNavigation = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="tab-navigation">
      <div className="tab-buttons">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TabNavigation
