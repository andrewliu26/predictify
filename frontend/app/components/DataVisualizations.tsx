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
        borderColor: `hsl(${(index * 360) / displayTracks.length}, 80%, 60%)`,
        backgroundColor: `hsla(${(index * 360) / displayTracks.length}, 80%, 60%, 0.15)`,
        borderWidth: 2.5,
        opacity: 0.5,
        fill: true,
        pointBackgroundColor: `hsl(${(index * 360) / displayTracks.length}, 80%, 60%)`,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: `hsl(${(index * 360) / displayTracks.length}, 80%, 60%)`,
        pointRadius: 4,
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
              display: false
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.2)',
            },
            angleLines: {
              color: 'rgba(255, 255, 255, 0.2)',
            },
            pointLabels: {
              color: 'rgba(255, 255, 255, 0.9)',
              font: {
                size: 14,
                weight: 'bold'
              }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.9)',
              font: {
                size: 13
              }
            },
            onHover: (event, legendItem) => {
              if (chartInstance.current) {
                const index = legendItem.datasetIndex;
                const datasets = chartInstance.current.data.datasets;
                
                // Set opacity for all datasets low
                datasets.forEach((dataset: any, i: number) => {
                  dataset.borderColor = dataset.borderColor.replace('rgba', 'hsla').replace(/[\d.]+\)$/g, '0.4)');
                  dataset.backgroundColor = dataset.backgroundColor.replace('rgba', 'hsla').replace(/[\d.]+\)$/g, '0.15)');
                });
                
                // Highlight hovered dataset
                if (index !== undefined && index >= 0) {
                  const dataset = datasets[index] as { 
                    borderColor: string; 
                    backgroundColor: string; 
                  };
                  dataset.borderColor = dataset.borderColor.replace(/[\d.]+\)$/g, '1)');
                  dataset.backgroundColor = dataset.backgroundColor.replace(/[\d.]+\)$/g, '0.4)');
                }
                
                chartInstance.current.update();
              }
            },
            onLeave: () => {
              if (chartInstance.current) {
                // Reset all datasets to original opacity
                chartInstance.current.data.datasets.forEach((dataset: any) => {
                  dataset.borderColor = dataset.borderColor.replace(/[\d.]+\)$/g, '0.5)');
                  dataset.backgroundColor = dataset.backgroundColor.replace(/[\d.]+\)$/g, '0.15)');
                });
                chartInstance.current.update();
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'rgba(255, 255, 255, 0.95)',
            bodyColor: 'rgba(255, 255, 255, 0.95)',
            padding: 12,
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
            borderWidth: 2.5
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
    <div>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--highlight-text)" }}>Top Tracks Analysis</h2>
        <div className="bg-card-bg border border-card-border rounded-lg p-6 shadow-sm">
        <div style={{ height: "400px" }}>
            <canvas ref={chartRef} />
        </div>
        </div>
    </div>
  );
}