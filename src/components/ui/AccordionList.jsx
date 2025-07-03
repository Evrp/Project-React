import React, { useState } from "react";
import "./AccordionList.css";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

const DEFAULT_TAB_OPTIONS = ["Option 1", "Option 2", "Option 3"];

const AccordionList = ({ items }) => {
    const [openIndex, setOpenIndex] = useState(null);
    const [selectedTabs, setSelectedTabs] = useState({});
    const [showTabsKey, setShowTabsKey] = useState(null);

    // เก็บค่าที่เลือกไว้แสดงด้านบนสุด
    const [selectedLabels, setSelectedLabels] = useState([]);

    const handleToggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    const handleToggleTabs = (itemIdx, genreIdx = 0) => {
        const key = `${itemIdx}-${genreIdx}`;
        setShowTabsKey(prevKey => (prevKey === key ? null : key));
    };
    const handleTabSelect = (itemIdx, genreIdx, tabIdx, label) => {
        const key = `${itemIdx}-${genreIdx}`;
        setSelectedTabs((prev) => ({ ...prev, [key]: tabIdx }));
        setSelectedLabels((prev) => {
            // ถ้ากดซ้ำที่ filter ให้ลบออก
            const exists = prev.some(sel => sel.key === key && sel.label === label);
            if (exists) return prev.filter(sel => !(sel.key === key && sel.label === label));
            return [...prev, { key, label }];
        });
    };

    // ลบ filter ที่เลือก
    const handleRemoveLabel = (key, label) => {
        setSelectedLabels((prev) => prev.filter(sel => !(sel.key === key && sel.label === label)));
    };

    return (
        <div className="accordion-list">
            {/* แสดง filter ที่เลือกด้านบนสุด */}

            {items.map((item, idx) => {
                // ถ้ามี genres ให้วนลูป genres
                if (item.genres && Array.isArray(item.genres) && item.genres.length > 0) {
                    return (
                        <div className="accordion-item" key={idx}>
                            <button
                                className={`accordion-header${openIndex === idx ? " open" : ""}`}
                                onClick={() => handleToggle(idx)}
                                aria-expanded={openIndex === idx}
                            >

                                {/* filter chips */}
                                {selectedLabels.filter(sel => sel.key.startsWith(`${idx}-`)).length > 0 ? (
                                    <span className="accordion-header-chips">
                                        {selectedLabels.filter(sel => sel.key.startsWith(`${idx}-`)).map(sel => (
                                            <span className="accordion-filter-chip" key={sel.key}>
                                                {sel.label}
                                                <button className="accordion-filter-remove" onClick={e => { e.stopPropagation(); handleRemoveLabel(sel.key, sel.label); }} aria-label="ลบตัวเลือก">×</button>
                                            </span>
                                        ))}
                                    </span>
                                ) : (
                                    <span className="accordion-title">Select genres</span>
                                )}
                                <span className="arrow" style={{ marginLeft: 'auto',paddingTop: '8.2px' }}>{openIndex === idx ? <FaChevronDown /> : <FaChevronRight />}</span>
                            </button>
                            {openIndex === idx && (
                                <div className="accordion-content">
                                    {item.genres.map((genre, genreIdx) => (
                                        <div className="accordion-content-title-with-tabs" key={genreIdx}>
                                            <button
                                                className={`accordion-tab-toggle${showTabsKey === `${idx}-${genreIdx}` ? " selected" : ""}`}
                                                onClick={() => handleToggleTabs(idx, genreIdx)}
                                                aria-label={showTabsKey === `${idx}-${genreIdx}` ? "ซ่อนแทบ" : "แสดงแทบ"}
                                                aria-pressed={showTabsKey === `${idx}-${genreIdx}`}
                                                type="button"
                                            >
                                                <span className="accordion-content-title">{genre.title}</span>
                                                {showTabsKey === `${idx}-${genreIdx}` ? <FaChevronDown /> : <FaChevronRight />}
                                            </button>
                                            {showTabsKey === `${idx}-${genreIdx}` && (
                                                <div className="accordion-tabs-wrapper">
                                                    <div className="accordion-tabs">
                                                        {(genre.tabs || DEFAULT_TAB_OPTIONS).map((tab, tabIdx) => {
                                                            const isSelected = selectedLabels.some(sel => sel.key === `${idx}-${genreIdx}` && sel.label === tab);
                                                            return (
                                                                <button
                                                                    key={tab}
                                                                    className={`accordion-tab${isSelected ? " selected" : ""}`}
                                                                    onClick={() => handleTabSelect(idx, genreIdx, tabIdx, tab)}
                                                                    type="button"
                                                                >
                                                                    {tab}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                } else {
                    // กรณีไม่มี genres
                    const tabOptions = item.tabs && Array.isArray(item.tabs) && item.tabs.length > 0 ? item.tabs : DEFAULT_TAB_OPTIONS;
                    return (
                        <div className="accordion-item" key={idx}>
                            <button
                                className={`accordion-header${openIndex === idx ? " open" : ""}`}
                                onClick={() => handleToggle(idx)}
                                aria-expanded={openIndex === idx}
                            >
                                <span className="accordion-title">{item.title}</span>
                                {/* filter chips */}
                                {selectedLabels.filter(sel => sel.key.startsWith(`${idx}-`)).length > 0 && (
                                    <span className="accordion-header-chips">
                                        {selectedLabels.filter(sel => sel.key.startsWith(`${idx}-`)).map(sel => (
                                            <span className="accordion-filter-chip" key={sel.key}>
                                                {sel.label}
                                                <button className="accordion-filter-remove" onClick={e => { e.stopPropagation(); handleRemoveLabel(sel.key, sel.label); }} aria-label="ลบตัวเลือก">×</button>
                                            </span>
                                        ))}
                                    </span>
                                )}
                                <span className="arrow" style={{ marginLeft: 'auto' }}>{openIndex === idx ? <FaChevronDown /> : <FaChevronRight />}</span>
                            </button>
                            {openIndex === idx && (
                                <div className="accordion-content">
                                    <div className="accordion-content-title-with-tabs">
                                        <button
                                            className={`accordion-tab-toggle${showTabsKey === `${idx}-0` ? " selected" : ""}`}
                                            onClick={() => handleToggleTabs(idx, 0)}
                                            aria-label={showTabsKey === `${idx}-0` ? "ซ่อนแทบ" : "แสดงแทบ"}
                                            aria-pressed={showTabsKey === `${idx}-0`}
                                            type="button"
                                        >
                                            <span className="accordion-content-title">{item.title}</span>
                                            {showTabsKey === `${idx}-0` ? <FaChevronDown /> : <FaChevronRight />}
                                        </button>
                                        {showTabsKey === `${idx}-0` && (
                                            <div className="accordion-tabs-wrapper">
                                                <div className="accordion-tabs">
                                                    {tabOptions.map((tab, tabIdx) => {
                                                        const isSelected = selectedLabels.some(sel => sel.key === `${idx}-0` && sel.label === tab);
                                                        return (
                                                            <button
                                                                key={tab}
                                                                className={`accordion-tab${isSelected ? " selected" : ""}`}
                                                                onClick={() => handleTabSelect(idx, 0, tabIdx, tab)}
                                                                type="button"
                                                            >
                                                                {tab}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }
            })}
        </div>
    );
};

export default AccordionList;
