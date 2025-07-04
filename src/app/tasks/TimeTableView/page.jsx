"use client";

import { useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { Dropdown } from "primereact/dropdown";
import "primereact/resources/themes/lara-light-blue/theme.css";

const dummyData = {
    "Grade 6": {
        "6A": {
            Monday: ["Math", "English", "Science", "History", "PE", "ICT", "Sinhala", "Art"],
            Tuesday: ["Science", "Math", "English", "ICT", "Art", "History", "Drama", "PE"],
            Wednesday: ["Math", "Science", "Sinhala", "PE", "ICT", "English", "History", "Music"],
            Thursday: ["Drama", "Math", "Art", "Sinhala", "English", "Science", "History", "ICT"],
            Friday: ["Science", "Math", "Drama", "History", "ICT", "PE", "Art", "Sinhala"]
        },
        "6B": {
            Monday: ["Science", "Math", "English", "ICT", "History", "Drama", "Sinhala", "Art"],
            Tuesday: ["PE", "Sinhala", "Math", "Science", "English", "History", "ICT", "Art"],
            Wednesday: ["Math", "ICT", "Sinhala", "PE", "Art", "Science", "English", "History"],
            Thursday: ["Drama", "English", "Science", "Art", "Sinhala", "History", "ICT", "Math"],
            Friday: ["Science", "Math", "English", "History", "PE", "Sinhala", "ICT", "Art"]
        }
    },
    "Grade 7": {
        "7A": {
            Monday: ["Math", "English", "ICT", "History", "Science", "Art", "Sinhala", "PE"],
            Tuesday: ["Science", "Math", "English", "Drama", "Sinhala", "PE", "ICT", "History"],
            Wednesday: ["Drama", "Sinhala", "Math", "Science", "English", "History", "ICT", "Art"],
            Thursday: ["Math", "Science", "History", "Sinhala", "English", "Art", "ICT", "PE"],
            Friday: ["Math", "Art", "Sinhala", "Science", "PE", "Drama", "English", "ICT"]
        }
    }
};

const allSubjects = [
    "Math", "English", "Science", "History", "PE", "ICT",
    "Sinhala", "Art", "Music", "Drama"
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function GradeTimetableViewer() {
    const grades = Object.keys(dummyData);
    const [activeIndex, setActiveIndex] = useState(0);
    const [timetableData, setTimetableData] = useState(JSON.parse(JSON.stringify(dummyData)));
    const [editClasses, setEditClasses] = useState({});

    const handleEditClick = (grade, className) => {
        setEditClasses((prev) => ({ ...prev, [`${grade}-${className}`]: true }));
    };

    const handleSaveClick = (grade, className) => {
        setEditClasses((prev) => ({ ...prev, [`${grade}-${className}`]: false }));
        console.log("Saved", grade, className, timetableData[grade][className]);
    };

    const handleSubjectChange = (grade, className, day, periodIndex, value) => {
        const newData = { ...timetableData };
        newData[grade][className][day][periodIndex] = value;
        setTimetableData(newData);
    };

    return (
        <div className="min-h-screen flex flex-col text-black">
            <div className="sticky top-0 z-50 bg-white shadow">
                <h1 className="text-2xl font-bold text-center py-4">Weekly Timetable Viewer</h1>

                <TabView
                    activeIndex={activeIndex}
                    onTabChange={(e) => setActiveIndex(e.index)}
                    panelContainerClassName="hidden"
                >
                    {grades.map((grade, index) => (
                        <TabPanel
                            key={grade}
                            header={
                                <span
                                    className={`font-medium ${
                                        activeIndex === index
                                            ? "text-blue-600 font-bold underline"
                                            : "text-gray-700"
                                    }`}
                                >
                  {grade}
                </span>
                            }
                        />
                    ))}
                </TabView>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50">
                {Object.entries(timetableData[grades[activeIndex]]).map(([className, schedule]) => {
                    const isEditing = editClasses[`${grades[activeIndex]}-${className}`];

                    return (
                        <div
                            key={className}
                            className="mb-8 border rounded-lg shadow bg-white overflow-x-auto"
                        >
                            <div className="p-3 border-b bg-gray-100 sticky top-0 z-10 flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Class {className}</h3>
                                {!isEditing ? (
                                    <button
                                        className="text-sm px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        onClick={() => handleEditClick(grades[activeIndex], className)}
                                    >
                                        Edit
                                    </button>
                                ) : (
                                    <button
                                        className="text-sm px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                        onClick={() => handleSaveClick(grades[activeIndex], className)}
                                    >
                                        Save
                                    </button>
                                )}
                            </div>

                            <table className="table-auto w-full border border-gray-300">
                                <thead>
                                <tr className="bg-gray-200 text-center">
                                    <th className="border px-4 py-2 w-28">Period</th>
                                    {days.map((day) => (
                                        <th key={day} className="border px-4 py-2">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {Array.from({ length: 8 }).map((_, periodIndex) => (
                                    <tr key={periodIndex} className="text-center">
                                        <td className="border px-4 py-2 font-medium bg-gray-100">
                                            Period {periodIndex + 1}
                                        </td>
                                        {days.map((day) => (
                                            <td key={day} className="border px-2 py-1">
                                                {isEditing ? (
                                                    <Dropdown
                                                        value={schedule[day][periodIndex]}
                                                        options={allSubjects}
                                                        onChange={(e) =>
                                                            handleSubjectChange(
                                                                grades[activeIndex],
                                                                className,
                                                                day,
                                                                periodIndex,
                                                                e.value
                                                            )
                                                        }
                                                        className="w-full text-sm"
                                                        placeholder="Select"
                                                    />
                                                ) : (
                                                    schedule[day][periodIndex]
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
