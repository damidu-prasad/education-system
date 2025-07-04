"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { TabView, TabPanel } from "primereact/tabview";
import "../../../styles/TimetableConfiguration.css";

const TimetableConfiguration = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [timetableData, setTimetableData] = useState(null);
    const [gradesList, setGradesList] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [gradeCounts, setGradeCounts] = useState([]);
    const [selectedMedium, setSelectedMedium] = useState(null);
    const [classCount, setClassCount] = useState(0);
    const [classNames, setClassNames] = useState([]);

    const days = ["Time", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const generateTimeSlots = () => {
        const slots = [];
        let currentTime = new Date();
        currentTime.setHours(7, 45, 0, 0);

        for (let i = 0; i < 9; i++) {
            if (i === 4) {
                slots.push("Interval");
                currentTime.setMinutes(currentTime.getMinutes() + 20);
            } else {
                const start = currentTime.toTimeString().slice(0, 5);
                currentTime.setMinutes(currentTime.getMinutes() + 40);
                const end = currentTime.toTimeString().slice(0, 5);
                slots.push(`${start} - ${end}`);
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    useEffect(() => {
        const savedData = sessionStorage.getItem("timetableData");
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setTimetableData(parsed);
            setShowPopup(true);

            const count = parseInt(parsed.gradesCount);
            const grades = Array.from({ length: count }, (_, i) => `Grade ${String(i + 1).padStart(2, "0")}`);
            setGradesList(grades);
        }
    }, []);

    useEffect(() => {
        axios.get("http://127.0.0.1:8080/education/api/timetable/subjects")
            .then((response) => {
                const subjectNames = response.data.map((subject) => ({
                    label: subject.name,
                    value: subject.id,
                })).sort((a, b) => a.label.localeCompare(b.label));
                setSubjects(subjectNames);
            })
            .catch((error) => {
                console.error("Error fetching subjects:", error);
            });
    }, []);

    const handleSubjectChange = (classDayKey, timeSlot, value) => {
        setSelectedSubjects((prev) => ({
            ...prev,
            [classDayKey]: {
                ...prev[classDayKey],
                [timeSlot]: value,
            },
        }));
    };

    const handleLoadPopup = () => {
        const savedData = sessionStorage.getItem("timetableData");
        if (savedData) {
            setTimetableData(JSON.parse(savedData));
            setShowPopup(true);
        } else {
            alert("No timetable data found in session!");
        }
    };

    const handleGradeChange = (e) => {
        const gradeName = e.value;
        setSelectedGrade(gradeName);
        setSelectedMedium(null);
        setClassCount(0);
        setClassNames([]);

        const gradeNumber = parseInt(gradeName.split(" ")[1]);

        if (timetableData && timetableData.gradeLanguageCounts) {
            const counts = timetableData.selectedLanguages.map((medium, index) => ({
                medium,
                count: timetableData.gradeLanguageCounts[`${gradeNumber}-${index}`] || 0,
            }));
            setGradeCounts(counts);

            // Generate class names
            let total = 0;
            const names = [];
            timetableData.selectedLanguages.forEach((medium, index) => {
                const count = timetableData.gradeLanguageCounts[`${gradeNumber}-${index}`] || 0;
                for (let i = 0; i < count; i++) {
                    names.push({ medium, name: String.fromCharCode(65 + total) });
                    total++;
                }
            });
            setClassNames(names);
        }
    };

    const handleMediumChange = (e) => {
        const medium = e.value;
        setSelectedMedium(medium);

        const mediumIndex = timetableData.selectedLanguages.indexOf(medium);
        const gradeNumber = parseInt(selectedGrade.split(" ")[1]);
        const count = timetableData.gradeLanguageCounts[`${gradeNumber}-${mediumIndex}`] || 0;
        setClassCount(count);
    };

    const buildPayload = () => {
        return {
            timetableMeta: {
                gradesCount: timetableData.gradesCount,
                selectedLanguages: timetableData.selectedLanguages,
                gradeLanguageCounts: timetableData.gradeLanguageCounts
            },
            grade: selectedGrade,
            medium: selectedMedium,
            classes: classNames
                .filter(c => c.medium === selectedMedium)
                .map(c => {
                    const timetable = {};
                    timeSlots.forEach(time => {
                        if (time === "Interval") return;
                        days.slice(1).forEach((day, dayIndex) => {
                            const key = `${classNames.findIndex(cls => cls.name === c.name)}-${dayIndex}`;
                            if (!timetable[time]) timetable[time] = {};
                            timetable[time][day] = selectedSubjects[key]?.[time] || null;
                        });
                    });
                    return {
                        name: c.name,
                        medium: c.medium,
                        timetable,
                    };
                })
        };
    };

    const handleSaveToBackend = async () => {
        const payload = buildPayload();
        console.log('Sending payload to backend:', payload);

        try {
            const response = await axios.post(
                "http://127.0.0.1:8080/education/api/timetable/save",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log('Response from backend:', response);
            alert("Timetable saved successfully!");
        } catch (error) {
            console.error("Error saving timetable:", error);
            alert("Failed to save timetable.");
        }
    };

    return (
        <div className="timetable-container text-sm">
            <div className="container1">
                <div className="title flex items-center h-1rem justify-between">
                    <div className="w-full text-center">
                        <h1 className="text-2xl font-semibold">Time Table Setup</h1>
                    </div>
                </div>

                <div className="grade-section mb-4 mt-4">
                    <label htmlFor="grade" className="block font-medium mb-2">Grade:</label>
                    <Dropdown
                        value={selectedGrade}
                        options={gradesList}
                        id="grade"
                        onChange={handleGradeChange}
                        className="p-dropdown w-full md:w-60"
                        placeholder="Select Grade"
                    />

                    {gradeCounts.length > 0 && (
                        <div className="mt-4 grade-section mb-4 ms-6">
                            <label htmlFor="medium" className="block font-medium mb-2">Medium:</label>
                            <Dropdown
                                value={selectedMedium}
                                options={gradeCounts.map(gc => ({ label: gc.medium, value: gc.medium }))}
                                onChange={handleMediumChange}
                                placeholder="Select Medium"
                                className="p-dropdown w-full md:w-60"
                            />
                        </div>
                    )}
                </div>

                {classNames.length > 0 && selectedMedium && (
                    <div className="mt-6">
                        <TabView>
                            {classNames
                                .filter(c => c.medium === selectedMedium)
                                .map((c, index) => (
                                    <TabPanel header={`Class ${c.name}`} key={index}>
                                        <table className="timetable">
                                            <thead>
                                            <tr>
                                                {days.map((day, index) => (
                                                    <th key={index} className="table-headers">{day}</th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {timeSlots.map((time, rowIndex) =>
                                                time === "Interval" ? (
                                                    <tr key={rowIndex} className="fifth-row">
                                                        <td className="timeslot">{time}</td>
                                                        <td colSpan={5} className="interval-cell">Interval</td>
                                                    </tr>
                                                ) : (
                                                    <tr key={rowIndex}>
                                                        <td className="timeslot">{time}</td>
                                                        {days.slice(1).map((_, dayIndex) => {
                                                            const key = `${index}-${dayIndex}`;
                                                            return (
                                                                <td key={dayIndex} className="dayslots">
                                                                    <Dropdown
                                                                        value={selectedSubjects[key]?.[time]}
                                                                        onChange={(e) =>
                                                                            handleSubjectChange(key, time, e.value)
                                                                        }
                                                                        options={subjects}
                                                                        optionLabel="label"
                                                                        placeholder="Select Subject"
                                                                        className="w-full md:w-14rem"
                                                                    />
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                )
                                            )}
                                            </tbody>
                                        </table>
                                    </TabPanel>
                                ))}
                        </TabView>

                        <div className="flex justify-end mt-6">
                            <button
                                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                onClick={handleSaveToBackend}
                            >
                                Save Timetable
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showPopup && timetableData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto relative">
                        <h2 className="text-2xl font-bold mb-6">Loaded Timetable Data</h2>
                        <div className="max-h-[70vh] overflow-y-auto pr-2">
                            <p><strong>Grades Count:</strong> {timetableData.gradesCount}</p>
                            <p className="mb-4"><strong>Mediums:</strong> {timetableData.selectedLanguages.join(", ")}</p>
                            {(() => {
                                const { gradeLanguageCounts, selectedLanguages } = timetableData;
                                const grades = Array.from({ length: parseInt(timetableData.gradesCount) }, (_, i) => i + 1);
                                let overallTotal = 0;

                                return (
                                    <div className="space-y-8">
                                        {grades.map((grade) => {
                                            let gradeTotal = 0;

                                            return (
                                                <div key={grade}>
                                                    <h3 className="text-xl font-semibold mb-2">Grade {String(grade).padStart(2, "0")}</h3>
                                                    <table className="w-full border text-center border-collapse mb-2">
                                                        <thead className="bg-gray-100">
                                                        <tr>
                                                            {selectedLanguages.map((lang, index) => (
                                                                <th key={index} className="border px-4 py-2">{lang}</th>
                                                            ))}
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        <tr>
                                                            {selectedLanguages.map((_, index) => {
                                                                const count = Number(gradeLanguageCounts[`${grade}-${index}`] || 0);
                                                                gradeTotal += count;
                                                                return (
                                                                    <td key={index} className="border px-4 py-2">{count}</td>
                                                                );
                                                            })}
                                                        </tr>
                                                        <tr className="bg-gray-50 font-semibold">
                                                            <td colSpan={selectedLanguages.length} className="border px-4 py-2 text-right">
                                                                Total for Grade {String(grade).padStart(2, "0")}: {gradeTotal}
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                    {(() => {
                                                        overallTotal += gradeTotal;
                                                        return null;
                                                    })()}
                                                </div>
                                            );
                                        })}
                                        <div className="text-right font-bold text-lg border-t pt-4">
                                            Total Classes Across All Grades: {overallTotal}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="pt-4 flex justify-end sticky bottom-0 bg-white">
                            <button
                                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={() => setShowPopup(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimetableConfiguration;
