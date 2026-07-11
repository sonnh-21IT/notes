import '@/styles/public/mdx/tabs.css'
import { Children, cloneElement, useState } from 'react'

function Tabs({ children }) {
  const tabs = Children.toArray(children).filter(Boolean)
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="tabs">
      <div className="tab-list" role="tablist" aria-label="Content tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab.props.title || index}
            type="button"
            className={`tab-trigger${activeIndex === index ? ' active' : ''}`}
            onClick={() => setActiveIndex(index)}
            role="tab"
            aria-selected={activeIndex === index}
          >
            {tab.props.title || `Tab ${index + 1}`}
          </button>
        ))}
      </div>
      <div className="tab-panel">
        {cloneElement(tabs[activeIndex], {
          active: true,
        })}
      </div>
    </div>
  )
}

function Tab({ children }) {
  return <div className="tab-content">{children}</div>
}

export { Tabs, Tab }
export default Tabs
