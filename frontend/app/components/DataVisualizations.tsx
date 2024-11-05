"use client";

import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "chart.js/auto";

interface DataVisualizationsProps {
  tracks: any[];
}

export default function DataVisualizations({ tracks }: DataVisualizationsProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !tracks.length) return;

    console.log("Tracks passed to visualization:", tracks);

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Take only first 5 tracks for better visibility
    const displayTracks = tracks.slice(0, 5);
    console.log("Display tracks with features:", displayTracks);

    const datasets = displayTracks.map((track, index) => {
      const dataset = {
        label: track.name,
        data: [
          track.danceability || 0,
          track.energy || 0,
          track.valence || 0,
          track.tempo ? track.tempo / 200 : 0,
          track.instrumentalness || 0
        ],
        borderColor: `hsl(${(index * 360) / displayTracks.length}, 70%, 50%)`,
        backgroundColor: `hsla(${(index * 360) / displayTracks.length}, 70%, 50%, 0.1)`,
        borderWidth: 2,
        opacity: 0.3,
        fill: true,
        pointBackgroundColor: `hsl(${(index * 360) / displayTracks.length}, 70%, 50%)`,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: `hsl(${(index * 360) / displayTracks.length}, 70%, 50%)`,
      };
      console.log("Created dataset:", dataset);
      return dataset;
    });

    chartInstance.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Danceability", "Energy", "Valence", "Tempo", "Instrumentalness"],
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 1,
            ticks: {
              display: false // This will hide the scale numbers
            }
          }
        },
        plugins: {
          legend: {
            onHover: (event, legendItem) => {
              if (chartInstance.current) {
                const index = legendItem.datasetIndex;
                const datasets = chartInstance.current.data.datasets;
                
                // Set opacity for all datasets low
                datasets.forEach((dataset: any, i: number) => {
                  dataset.borderColor = dataset.borderColor.replace('rgba', 'hsla').replace(/[\d.]+\)$/g, '0.3)');
                  dataset.backgroundColor = dataset.backgroundColor.replace('rgba', 'hsla').replace(/[\d.]+\)$/g, '0.1)');
                });
                
                // Highlight hovered dataset
                if (index !== undefined && index >= 0) {
                  const dataset = datasets[index] as { 
                    borderColor: string; 
                    backgroundColor: string; 
                  };
                  dataset.borderColor = dataset.borderColor.replace(/[\d.]+\)$/g, '1)');
                  dataset.backgroundColor = dataset.backgroundColor.replace(/[\d.]+\)$/g, '0.3)');
                }
                
                chartInstance.current.update();
              }
            },
            onLeave: () => {
              if (chartInstance.current) {
                // Reset all datasets to original opacity
                chartInstance.current.data.datasets.forEach((dataset: any) => {
                  dataset.borderColor = dataset.borderColor.replace(/[\d.]+\)$/g, '0.3)');
                  dataset.backgroundColor = dataset.backgroundColor.replace(/[\d.]+\)$/g, '0.1)');
                });
                chartInstance.current.update();
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.r;
                const metric = context.chart.data.labels?.[context.dataIndex];
                return `${label}: ${metric} - ${(value * 100).toFixed(0)}%`;
              }
            }
          }
        },
        elements: {
          line: {
            borderWidth: 2
          }
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [tracks]);

  return (
    <div className="bg-card-bg border border-card-border rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Track Analysis</h3>
      <div style={{ height: "400px" }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}