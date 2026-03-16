import React from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const RadarChart = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Skills",
        data: data.values,
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "#A855F7",
        pointBackgroundColor: "#3B82F6"
      }
    ]
  };

  const options = {
    plugins: {
      legend: { display: false }
    },
    scales: {
      r: {
        grid: { color: "rgba(255,255,255,0.08)" },
        angleLines: { color: "rgba(255,255,255,0.08)" },
        pointLabels: { color: "#A9B1D6" },
        ticks: { color: "#A9B1D6", backdropColor: "transparent" }
      }
    }
  };

  return <Radar data={chartData} options={options} />;
};

export default RadarChart;
