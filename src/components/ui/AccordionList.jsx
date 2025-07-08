import React, { useState, useRef, useEffect } from "react";
import "./AccordionList.css";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const DEFAULT_TAB_OPTIONS = ["Option 1", "Option 2", "Option 3"];

const AccordionList = ({ items }) => {
    const [openIndex, setOpenIndex] = useState(null);
    const [selectedTabs, setSelectedTabs] = useState({});
    const [showTabsKey, setShowTabsKey] = useState(null);
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const containerRef = useRef(null);
    const chipsRefs = useRef({});

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

    // ปิด tab group และ accordion-content เมื่อคลิกนอก accordion-list
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowTabsKey(null);
                setOpenIndex(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchInitialFilters = async () => {
            const email = localStorage.getItem("userEmail");
            if (!email) return;
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/api/filters/${encodeURIComponent(email)}`);
                if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูล filter ได้");
                const data = await res.json();
                if (data && data.genres && data.subGenres) {
                    // Map genres/subGenres to selectedLabels
                    const newSelectedLabels = [];
                    items.forEach((item, itemIdx) => {
                        if (item.genres && Array.isArray(item.genres)) {
                            item.genres.forEach((genre, genreIdx) => {
                                if (data.subGenres[genre.title]) {
                                    data.subGenres[genre.title].forEach(sub => {
                                        newSelectedLabels.push({ key: `${itemIdx}-${genreIdx}`, label: sub });
                                    });
                                }
                            });
                        } else if (item.tabs && Array.isArray(item.tabs)) {
                            // For items without genres, match by item title if possible
                            if (data.subGenres[item.title]) {
                                data.subGenres[item.title].forEach(sub => {
                                    newSelectedLabels.push({ key: `${itemIdx}-0`, label: sub });
                                });
                            }
                        }
                    });
                    setSelectedLabels(newSelectedLabels);
                }
            } catch (err) {
                setError("เกิดข้อผิดพลาดในการโหลด filter");
            }
            setLoading(false);
        };
        fetchInitialFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    return (
        <div className="accordion-list theme-bg" ref={containerRef}>
            <ToastContainer />
            {loading && (
                <div className="accordion-loading-overlay theme-overlay">
                    <div className="accordion-spinner theme-spinner">
                        <div className="spinner-dot theme-spinner-dot"></div>
                        <div className="spinner-dot theme-spinner-dot"></div>
                        <div className="spinner-dot theme-spinner-dot"></div>
                    </div>
                    <div className="accordion-loading-text theme-text">กำลังบันทึกข้อมูล กรุณารอสักครู่...</div>
                </div>
            )}
            {/* แสดง filter ที่เลือกด้านบนสุด */}

            {items.map((item, idx) => {
                // ถ้ามี genres ให้วนลูป genres
                if (item.genres && Array.isArray(item.genres) && item.genres.length > 0) {
                    return (
                        <div className="accordion-item theme-card" key={idx}>
                            <button
                                className={`accordion-header theme-header${openIndex === idx ? " open" : ""}`}
                                onClick={() => handleToggle(idx)}
                                aria-expanded={openIndex === idx}
                            >
                                {/* filter chips */}
                                {selectedLabels.filter(sel => sel.key.startsWith(`${idx}-`)).length > 0 ? (
                                    <span
                                        className="accordion-header-chips theme-chips"
                                        ref={el => { chipsRefs.current[idx] = el; }}
                                    >
                                        {selectedLabels.filter(sel => sel.key.startsWith(`${idx}-`)).map(sel => (
                                            <span className="accordion-filter-chip theme-chip" key={sel.key + sel.label}>
                                                {sel.label}
                                                <span
                                                    className="accordion-filter-remove theme-chip-remove"
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={e => { e.stopPropagation(); handleRemoveLabel(sel.key, sel.label); }}
                                                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); handleRemoveLabel(sel.key, sel.label); } }}
                                                    aria-label="ลบตัวเลือก"
                                                >×</span>
                                            </span>
                                        ))}
                                    </span>
                                ) : (
                                    <span className="accordion-title theme-title">Select genres</span>
                                )}
                                <span className="arrow theme-arrow" style={{ marginLeft: 'auto', paddingTop: '8.2px' }}>{openIndex === idx ? <FaChevronDown /> : <FaChevronRight />}</span>
                            </button>
                            {openIndex === idx && (
                                <div className="accordion-content theme-content">
                                    {item.genres.map((genre, genreIdx) => (
                                        <div
                                            className="accordion-content-title-with-tabs"
                                            key={genreIdx}
                                            onMouseEnter={() => handleToggleTabs(idx, genreIdx)}
                                            onMouseLeave={() => showTabsKey === `${idx}-${genreIdx}` && setShowTabsKey(null)}
                                        >
                                            <button
                                                className={`accordion-tab-toggle theme-tab-toggle${showTabsKey === `${idx}-${genreIdx}` ? " selected" : ""}`}
                                                aria-label={showTabsKey === `${idx}-${genreIdx}` ? "ซ่อนแทบ" : "แสดงแทบ"}
                                                aria-pressed={showTabsKey === `${idx}-${genreIdx}`}
                                                type="button"
                                            >
                                                <span className="accordion-content-title theme-content-title">{genre.title}</span>
                                                {showTabsKey === `${idx}-${genreIdx}` ? <FaChevronDown /> : <FaChevronRight />}
                                            </button>
                                            {showTabsKey === `${idx}-${genreIdx}` && (
                                                <div className="accordion-tabs-wrapper theme-tabs-wrapper">
                                                    <div className="accordion-tabs theme-tabs">
                                                        {(genre.tabs || DEFAULT_TAB_OPTIONS).map((tab, tabIdx) => {
                                                            const isSelected = selectedLabels.some(sel => sel.key === `${idx}-${genreIdx}` && sel.label === tab);
                                                            return (
                                                                <button
                                                                    key={tab}
                                                                    className={`accordion-tab theme-tab${isSelected ? " selected" : ""}`}
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
                        <div className="accordion-item theme-card" key={idx}>
                            <button
                                className={`accordion-header theme-header${openIndex === idx ? " open" : ""}`}
                                onClick={() => handleToggle(idx)}
                                aria-expanded={openIndex === idx}
                            >
                                <span className="accordion-title theme-title">{item.title}</span>
                                {/* filter chips */}
                                {selectedLabels.filter(sel => sel.key.startsWith(`${idx}-`)).length > 0 && (
                                    <span className="accordion-header-chips theme-chips">
                                        {selectedLabels.filter(sel => sel.key.startsWith(`${idx}-`)).map(sel => (
                                            <span className="accordion-filter-chip theme-chip" key={sel.key}>
                                                {sel.label}
                                                <span
                                                    className="accordion-filter-remove theme-chip-remove"
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={e => { e.stopPropagation(); handleRemoveLabel(sel.key, sel.label); }}
                                                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); handleRemoveLabel(sel.key, sel.label); } }}
                                                    aria-label="ลบตัวเลือก"
                                                >×</span>
                                            </span>
                                        ))}
                                    </span>
                                )}
                                <span className="arrow theme-arrow" style={{ marginLeft: 'auto' }}>{openIndex === idx ? <FaChevronDown /> : <FaChevronRight />}</span>
                            </button>
                            {openIndex === idx && (
                                <div className="accordion-content theme-content">
                                    <div
                                        className="accordion-content-title-with-tabs"
                                        onMouseEnter={() => handleToggleTabs(idx, 0)}
                                        onMouseLeave={() => showTabsKey === `${idx}-0` && setShowTabsKey(null)}
                                    >
                                        <button
                                            className={`accordion-tab-toggle theme-tab-toggle${showTabsKey === `${idx}-0` ? " selected" : ""}`}
                                            aria-label={showTabsKey === `${idx}-0` ? "ซ่อนแทบ" : "แสดงแทบ"}
                                            aria-pressed={showTabsKey === `${idx}-0`}
                                            type="button"
                                        >
                                            <span className="accordion-content-title theme-content-title">{item.title}</span>
                                            {showTabsKey === `${idx}-0` ? <FaChevronDown /> : <FaChevronRight />}
                                        </button>
                                        {showTabsKey === `${idx}-0` && (
                                            <div className="accordion-tabs-wrapper theme-tabs-wrapper">
                                                <div className="accordion-tabs theme-tabs">
                                                    {tabOptions.map((tab, tabIdx) => {
                                                        const isSelected = selectedLabels.some(sel => sel.key === `${idx}-0` && sel.label === tab);
                                                        return (
                                                            <button
                                                                key={tab}
                                                                className={`accordion-tab theme-tab${isSelected ? " selected" : ""}`}
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

            {/* ปุ่มส่งข้อมูลไป API */}
            <div className="submit-genres theme-submit">
                <button
                    className="submit-genres-button theme-submit-btn"
                    onClick={async () => {
                        setLoading(true);
                        setError("");
                        // Map selectedLabels to subGenres object
                        const subGenresObj = {};
                        selectedLabels.forEach(sel => {
                            const [itemIdx, genreIdx] = sel.key.split("-");
                            if (items[itemIdx] && items[itemIdx].genres && items[itemIdx].genres[genreIdx]) {
                                const genreTitle = items[itemIdx].genres[genreIdx].title;
                                if (!subGenresObj[genreTitle]) subGenresObj[genreTitle] = [];
                                if (!subGenresObj[genreTitle].includes(sel.label)) subGenresObj[genreTitle].push(sel.label);
                            }
                        });
                        const selectedGenres = Object.keys(subGenresObj);
                        const email = localStorage.getItem("userEmail");
                        // Validation
                        if (!email) {
                            setError("ไม่พบอีเมลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
                            setLoading(false);
                            return;
                        }
                        if (!Array.isArray(selectedGenres) || selectedGenres.length === 0) {
                            setError("กรุณาเลือกอย่างน้อย 1 หมวดหมู่");
                            setLoading(false);
                            return;
                        }
                        if (typeof subGenresObj !== "object" || Object.keys(subGenresObj).length === 0) {
                            setError("กรุณาเลือก sub-genre อย่างน้อย 1 รายการ");
                            setLoading(false);
                            return;
                        }
                        console.log("Selected Genres:", selectedGenres);
                        console.log("Sub Genres Object:", subGenresObj);
                        try {
                            // เรียกลบ EventMatch ก่อน
                            await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/api/delete-all-events-match`, {
                                method: "DELETE"
                            });
                            // แล้วค่อยบันทึก genres/subGenres
                            const response = await fetch(
                                `${import.meta.env.VITE_APP_API_BASE_URL}/api/update-genres`,
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        email,
                                        genres: selectedGenres,
                                        subGenres: subGenresObj,
                                        updatedAt: new Date().toISOString(),
                                    }),
                                },
                            );
                            // เรียก webhook ต่อ
                            const startwebhook = async () => {
                                try {
                                    if (email) {
                                        const response = await fetch(
                                            `${import.meta.env.VITE_APP_MAKE_WEBHOOK_MATCH_URL}`,
                                            {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ email }),
                                            }
                                        );
                                        if (response.ok) {
                                            console.log("Webhook started successfully");
                                        } else {
                                            console.error("Error starting webhook");
                                        }
                                    }
                                } catch (error) {
                                    console.error("Error starting webhook:", error);
                                }
                            };
                            await startwebhook();
                            if (response.ok) {
                                toast.success("บันทึกการเลือกสำเร็จ");
                            } else {
                                const errText = await response.text();
                                setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + errText);
                                toast.error("บันทึกข้อมูลล้มเหลว");
                            }
                        } catch (err) {
                            setError("เกิดข้อผิดพลาดขณะเชื่อมต่อเซิร์ฟเวอร์");
                            toast.error("เกิดข้อผิดพลาดขณะเชื่อมต่อเซิร์ฟเวอร์");
                        }
                        setLoading(false);
                    }}
                    disabled={loading}
                >
                    {loading ? "กำลังบันทึก..." : "บันทึกการเลือกทั้งหมด"}
                </button>
                <button
                    className="clear-genres-button theme-clear-btn"
                    style={{ marginLeft: 8 }}
                    onClick={async () => {
                        setLoading(true);
                        setError("");
                        setSelectedLabels([]);
                        const email = localStorage.getItem("userEmail");
                        try {
                            const response = await fetch(
                                `${import.meta.env.VITE_APP_API_BASE_URL}/api/update-genres`,
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        email,
                                        genres: [],
                                        subGenres: {},
                                        updatedAt: new Date().toISOString(),
                                    }),
                                }
                            );
                            if (response.ok) {
                                toast.success("ลบตัวเลือกทั้งหมดสำเร็จ");
                            } else {
                                setError("เกิดข้อผิดพลาดในการลบข้อมูล");
                                toast.error("ลบข้อมูลล้มเหลว");
                            }
                        } catch (err) {
                            setError("เกิดข้อผิดพลาดขณะเชื่อมต่อเซิร์ฟเวอร์");
                            toast.error("เกิดข้อผิดพลาดขณะเชื่อมต่อเซิร์ฟเวอร์");
                        }
                        setLoading(false);
                    }}
                    disabled={loading}
                >
                    {loading ? "..." : "ลบทั้งหมด"}
                </button>
                {error && <div className="error-message theme-error">{error}</div>}
            </div>
        </div>
    );
};

export default AccordionList;
