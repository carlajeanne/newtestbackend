import React, { useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Dog } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';



const Dashboard = () => {
    // Dummy data for 4 weeks (1 month)
    const weekData = [
        {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [
                {
                    label: 'Happiness',
                    data: [10, 15, 12, 18, 6, 20, 14],
                    backgroundColor: '#F1D04B',
                },
                {
                    label: 'Relaxed',
                    data: [5, 3, 8, 2, 14, 3, 5],
                    backgroundColor: '#4B5563',
                },
                {
                    label: 'Anger',
                    data: [2, 19, 2, 5, 2, 15, 4],
                    backgroundColor: '#FF4B4B',
                },
                {
                    label: 'Fear',
                    data: [1, 12, 18, 4, 3, 2, 6],
                    backgroundColor: '#000000',
                },
            ],
        },
        {
            labels: ['Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14'],
            datasets: [
                {
                    label: 'Happiness',
                    data: [8, 10, 7, 14, 11, 16, 12],
                    backgroundColor: '#F1D04B',
                },
                {
                    label: 'Relaxed',
                    data: [4, 2, 6, 1, 3, 2, 4],
                    backgroundColor: '#4B5563',
                },
                {
                    label: 'Anger',
                    data: [3, 9, 4, 6, 2, 12, 5],
                    backgroundColor: '#FF4B4B',
                },
                {
                    label: 'Fear',
                    data: [2, 10, 16, 5, 3, 1, 7],
                    backgroundColor: '#000000',
                },
            ],
        },
        {
            labels: ['Day 15', 'Day 16', 'Day 17', 'Day 18', 'Day 19', 'Day 20', 'Day 21'],
            datasets: [
                {
                    label: 'Happiness',
                    data: [13, 11, 9, 10, 15, 18, 14],
                    backgroundColor: '#F1D04B',
                },
                {
                    label: 'Relaxed',
                    data: [3, 4, 5, 2, 6, 1, 4],
                    backgroundColor: '#4B5563',
                },
                {
                    label: 'Anger',
                    data: [4, 7, 5, 6, 9, 8, 3],
                    backgroundColor: '#FF4B4B',
                },
                {
                    label: 'Fear',
                    data: [6, 10, 8, 9, 7, 6, 5],
                    backgroundColor: '#000000',
                },
            ],
        },
        {
            labels: ['Day 22', 'Day 23', 'Day 24', 'Day 25', 'Day 26', 'Day 27', 'Day 28'],
            datasets: [
                {
                    label: 'Happiness',
                    data: [9, 13, 15, 12, 17, 14, 10],
                    backgroundColor: '#F1D04B',
                },
                {
                    label: 'Relaxed',
                    data: [2, 4, 3, 5, 3, 4, 2],
                    backgroundColor: '#4B5563',
                },
                {
                    label: 'Anger',
                    data: [6, 13, 7, 5, 6, 9, 4],
                    backgroundColor: '#FF4B4B',
                },
                {
                    label: 'Fear',
                    data: [7, 9, 8, 6, 4, 5, 3],
                    backgroundColor: '#000000',
                },
            ],
        },

    {
        labels: ['Day 29', 'Day 30', 'Day 31'],
        datasets: [
            {
                label: 'Happiness',
                data: [9, 13, 15, 12, 17, 14, 10],
                backgroundColor: '#F1D04B',
            },
            {
                label: 'Relaxed',
                data: [2, 4, 3, 5, 3, 4, 2],
                backgroundColor: '#4B5563',
            },
            {
                label: 'Anger',
                data: [6, 8, 7, 5, 6, 18, 4],
                backgroundColor: '#FF4B4B',
            },
            {
                label: 'Fear',
                data: [7, 9, 8, 6, 4, 5, 3],
                backgroundColor: '#000000',
            },
        ],
    },
];


    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false,
                },
                beginAtZero: true,
            },
            y: {
                grid: {
                    display: false,
                },
                beginAtZero: true,
                max: 24,
                ticks: {
                    stepSize: 1, 
                    callback: (value) => `${value} hr`, 
                },
                
            },
        },
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    const [selectedWeek, setSelectedWeek] = useState(0); 
    const [selectedDay, setSelectedDay] = useState(0); 

    // Calculate top 3 emotions for the selected day
    const getTop3Emotions = (weekIndex, dayIndex) => {
        const emotions = weekData[weekIndex].datasets.map((dataset) => ({
            label: dataset.label,
            value: dataset.data[dayIndex],
        }));

        // Sort by value and take the top 3
        const top3 = emotions.sort((a, b) => b.value - a.value).slice(0, 3);

        return {
            labels: top3.map((emotion) => emotion.label),
            datasets: [
                {
                    data: top3.map((emotion) => emotion.value),
                    backgroundColor: top3.map((emotion) =>
                        weekData[weekIndex].datasets.find((dataset) => dataset.label === emotion.label).backgroundColor
                    ),
                },
            ],
        };
    };

    const pieData = getTop3Emotions(selectedWeek, selectedDay);

    const pieOptions = {
        responsive: true,
    maintainAspectRatio: false,
    cutout: '60%', // Increases the hole in the center (makes it look more like petals)
    elements: {
        arc: {
            borderWidth: 4, // Gives a soft outline
            borderColor: '#ffffff', // White border to separate segments
            spacing: 10, // Adds space between segments to make it look like petals
        },
    },
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                padding: 20,
                color: '#444', // Soft text color
            },
        },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const emotion = tooltipItem.raw;
                        const label = pieData.labels[tooltipItem.dataIndex];
                        return `${label}: ${emotion}`;
                    },
                },
            },
            centerText: {
                display: true,
                text: pieData.labels[0], // Or any dynamic text you'd like
              },
        },
    };

    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw(chart, args, options) {
            if (options.display && options.text) {
                const { width } = chart;
                const { height } = chart;
                const ctx = chart.ctx;
          
                ctx.restore();
                
                // Set color dynamically based on the emotion
                let color;
                switch (options.text) {
                    case 'Happiness':
                        color = '#F1D04B';  // Yellow
                        break;
                    case 'Anger':
                        color = '#FF4B4B';  // Red
                        break;
                    case 'Relaxed':
                        color = '#4B5563';  // Gray
                        break;
                    case 'Fear':
                        color = '#000000';  // Black
                        break;
                    default:
                        color = '#FFC702';  // Default color
                        break;
                }
    
                const fontSize = options.fontSize || 30;
                ctx.font = `${fontSize}px Akronim`;  // You can adjust the font family here
                ctx.fillStyle = color;  // Apply the color dynamically
                ctx.textBaseline = 'middle';
                
                const text = options.text;
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 2;
          
                ctx.fillText(text, textX, textY);
                ctx.save();
                
            }
        }
    };
    

      ChartJS.register(ArcElement, Tooltip, Legend, centerTextPlugin);
      
    // Prepare data for the line graph (Monthly Emotions)
    const getMonthlyEmotionData = () => {
        const monthlySums = {};

        weekData.forEach((week) => {
            week.datasets.forEach((dataset) => {
                if (!monthlySums[dataset.label]) {
                    monthlySums[dataset.label] = Array(week.labels.length).fill(0);
                }
                dataset.data.forEach((value, index) => {
                    monthlySums[dataset.label][index] = (monthlySums[dataset.label][index] || 0) + value;
                });
            });
        });
        

        return {
            labels: Array.from({ length: 5 }, (_, i) => `Week ${i + 1}`),
            datasets: Object.entries(monthlySums).map(([emotion, values], index) => {
                const baseColor = weekData[0].datasets[index]?.backgroundColor || '#000';
                return {
                    label: emotion,
                    data: values,
                    borderColor: baseColor,
                    backgroundColor: `${baseColor}33`, // semi-transparent for mountain effect
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                };
            }),
        };
    };

    const lineData = getMonthlyEmotionData();

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    boxWidth: 12,
                    padding: 15,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#555',
                    font: {
                        weight: '500',
                    },
                },
            },
            y: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#555',
                    font: {
                        weight: '500',
                    },
                },
            },
        },
        elements: {
            line: {
                borderWidth: 3,
            },
            point: {
                radius: 3,
                hoverRadius: 5,
            },
        },
    };
    

    return (
        <div className="h-full flex flex-col items-center justify-center bg-very-bright-pastel-orange p-5">
            {/* Logo Section */}
            <div className="flex justify-center mt-20">
                <img src="/public/logo.png" alt="Logo" className="w-1/4 h-auto sm:w-1/6 md:w-1/8 lg:w-1/10" />
            </div>
            
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                    <Dog color="#F1D04B" size={20} />
                    <span className="text-sm text-yellow-500">Happiness</span>
                </div>
                <div className="flex items-center gap-2">
                    <Dog color="#FF4B4B" size={20} />
                    <span className="text-sm text-red-500">Anger</span>
                </div>
                <div className="flex items-center gap-2">
                    <Dog color="#4B5563" size={20} />
                    <span className="text-sm text-gray-700">Relaxed</span>
                </div>
                <div className="flex items-center gap-2">
                    <Dog color="#000000" size={20} />
                    <span className="text-sm text-black-700">Fear</span>
                </div>
            </div>
    
            {/* Dashboard Content */}
            <div className="flex flex-col md:flex-row w-full gap-7 mt-8">
                {/* Week Dropdown */}
                <div className="bar-container flex-grow max-w-full mx-auto p-4 bg-white shadow-lg rounded-lg">
                    <h2 className="text-xl font-bold text-center mb-4">Select Week</h2>
                    <select
                        className="block w-full p-2 mb-4 text-center border rounded-md"
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    >
                        <option value={0}>Week 1 (Day 1 to Day 7)</option>
                        <option value={1}>Week 2 (Day 8 to Day 14)</option>
                        <option value={2}>Week 3 (Day 15 to Day 21)</option>
                        <option value={3}>Week 4 (Day 22 to Day 28)</option>
                        <option value={4}>Week 5 (Day 29 to Day 31)</option>
                    </select>
    
                    {/* Bar Graph */}
                    <h2 className="text-2xl font-bold text-center mb-4">Dog Emotion History</h2>
                    <div className="h-[400px] w-full">
                        <Bar
                            data={weekData[selectedWeek]}
                            options={{
                                ...options,
                                elements: {
                                    bar: {
                                        borderRadius: 5, // Adjust this value for more or less rounding
                                    },
                                },
                                onClick: (_, elements) => {
                                    if (elements.length > 0) {
                                        const clickedIndex = elements[0].index;
                                        setSelectedDay(clickedIndex); // Update the selected day
                                    }
                                },
                            }}
                        />
                    </div>
    
                    <p className="text-center text-gray-500 mt-2">
                        Click a bar to view the top 3 emotions for that day.
                    </p>
                </div>
    
                {/* Pie Chart */}
                <div className="w-full max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
                    <h2 className="text-2xl font-bold text-center mb-7 mt-7">Top 3 Emotions</h2>
                    <p className="text-center text-sm mb-5">
                        <span className="font-semibold">{weekData[selectedWeek].labels[selectedDay]}</span>
                    </p>
                    <div style={{ height: '400px', width: '100%' }}>
                        <Doughnut data={pieData} options={pieOptions} />
                    </div>
                </div>
            </div>
    
            {/* Line Graph */}
            <div className="w-full max-w-4xl mx-auto mt-8 p-4 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-4">Top Emotions Over the Month</h2>
                <div style={{ height: '400px', width: '100%' }}>
                    <Line data={lineData} options={lineOptions} />
                </div>
            </div>
        </div>
    );
    
};

export default Dashboard;
