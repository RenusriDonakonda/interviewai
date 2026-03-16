import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const LineChart = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Performance",
        data: data.values,
        borderColor: "#6366F1",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        tension: 0.4
      }
    ]
  };

  const options = {
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { ticks: { color: "#A9B1D6" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "#A9B1D6" }, grid: { color: "rgba(255,255,255,0.05)" } }
    }
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;
