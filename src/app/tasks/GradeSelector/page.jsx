"use client";

import { useState, useEffect } from "react";
import { Button } from 'primereact/button';



export default function GradeClassManager() {
    const [gradesCount, setGradesCount] = useState("13");
    const [languageCount, setLanguageCount] = useState(0);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [generateTable, setGenerateTable] = useState(false);
    const [gradeLanguageCounts, setGradeLanguageCounts] = useState({});
    const [streams, setStreams] = useState([]);
    const [gradeStreamSelections, setGradeStreamSelections] = useState({});

    const grades = Array.from({ length: Number(gradesCount) || 0 }, (_, i) => i + 1);

    const [languages, setLanguages] = useState([]);

    useEffect(() => {
        async function fetchLanguages() {
            try {
                const response = await fetch("http://localhost:8080/education/api/timetable/Language");
                const data = await response.json();
                setLanguages(data);
            } catch (error) {
                console.error("Failed to fetch languages:", error);
            }
        }

        fetchLanguages();
    }, []);
    useEffect(() => {
        async function fetchStreams() {
            try {
                const response = await fetch("http://localhost:8080/education/api/timetable/streams");
                const data = await response.json();
                setStreams(data);
            } catch (error) {
                console.error("Failed to fetch streams:", error);
            }
        }

        fetchStreams();
    }, []);

    const handleLanguageCountChange = (e) => {
        const count = parseInt(e.target.value, 10);
        setLanguageCount(count);
        setSelectedLanguages(new Array(count).fill(""));
    };

    const handleLanguageSelection = (e, index) => {
        const newLanguages = [...selectedLanguages];
        newLanguages[index] = e.target.value;
        setSelectedLanguages(newLanguages);
    };


    const handleGenerateTable = () => {
        const initialCounts = {};
        grades.forEach((grade) => {
            selectedLanguages.forEach((_, langIndex) => {
                initialCounts[`${grade}-${langIndex}`] = 0;
            });
        });
        setGradeLanguageCounts(initialCounts);
        setGenerateTable(true);
    };

    const handleCountChange = (grade, langIndex, value) => {
        setGradeLanguageCounts((prev) => ({
            ...prev,
            [`${grade}-${langIndex}`]: value,
        }));
    };

    const handleStreamSelection = (grade, streamId) => {
        setGradeStreamSelections((prev) => ({
            ...prev,
            [grade]: streamId,
        }));
    };

    const handleSaveAndRedirect = () => {
        const dataToSave = {
            gradesCount,
            selectedLanguages,
            gradeLanguageCounts,
            gradeStreamSelections,
        };
        sessionStorage.setItem("timetableData", JSON.stringify(dataToSave));
        window.location.href = "http://localhost:3000/tasks/TimetableConfiguration";
    };

    return (
        <div className="min-h-screen flex flex-col items-center text-center text-black p-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-6">Time Table Scheduler</h1>
            </div>

            <div className="flex justify-between mb-6 w-full gap-4">
                {/* Grade Count Selector */}
                <div className="flex-1 grid grid-cols-2">
                    <label className="block font-medium mb-2 mt-4">
                        Enter Grades Count:
                    </label>
                    <input
                        type="number"
                        className="w-full border text-end border-gray-300 rounded mb-2 mt-2"
                        value={gradesCount}
                        onChange={(e) => setGradesCount(e.target.value)}
                    />
                </div>

                {/* Language Count Selector */}
                <div className="flex-1 grid grid-cols-2">
                    <label className="block font-medium mb-2 mt-4">
                        Number of Mediums:
                    </label>
                    <input
                        type="number"
                        className="w-full p-1 border text-end border-gray-300 rounded mb-2 mt-2"
                        value={languageCount}
                        onChange={handleLanguageCountChange}
                    />
                </div>

                {/* Buttons */}
                <div className="flex-1 flex gap-2 flex-row items-center justify-end">
                    <Button
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mb-2"
                        onClick={handleGenerateTable}
                    >
                        Generate Table
                    </Button>

                    {generateTable && (
                        <Button
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mb-2"
                            onClick={handleSaveAndRedirect}
                        >
                            Save & Next
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            {generateTable && (
                <div className="w-full flex justify-center overflow-x-auto">
                    <table className="table-fixed border-collapse mb-6">
                        <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-4 py-2 w-32">Grade</th>
                            {Array.from({ length: languageCount }).map((_, index) => (
                                <th key={index} className="border px-4 py-2">
                                    <select
                                        value={selectedLanguages[index]}
                                        onChange={(e) => handleLanguageSelection(e, index)}
                                        className="p-2 border rounded"
                                    >
                                        <option value="">Select Language</option>
                                        {languages.map((lang) => (
                                            <option key={lang.id} value={lang.name}>
                                                {lang.name}
                                            </option>
                                        ))}
                                    </select>

                                </th>
                            ))}
                            <th className="border px-4 py-2 w-48">Stream</th>
                        </tr>
                        </thead>

                        <tbody>
                        {grades.map((grade) => (
                            <tr key={grade}>
                                <td className="border px-4 py-2 text-center">Grade {grade}</td>

                                {selectedLanguages.map((language, index) => (
                                    <td key={index} className="border px-4 py-2 text-center">
                                        {language && (
                                            <input
                                                type="number"
                                                className="w-12 p-1 border rounded text-center"
                                                value={gradeLanguageCounts[`${grade}-${index}`] ?? 0}
                                                onChange={(e) =>
                                                    handleCountChange(
                                                        grade,
                                                        index,
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        )}
                                    </td>
                                ))}

                                <td className="border px-4 py-2 text-center">
                                    <select
                                        value={gradeStreamSelections[grade] || ""}
                                        onChange={(e) => handleStreamSelection(grade, e.target.value)}
                                        className="p-2 border rounded"
                                    >
                                        <option value="">Select Stream</option>
                                        {streams.map((stream) => (
                                            <option key={stream.id} value={stream.id}>
                                                {stream.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
