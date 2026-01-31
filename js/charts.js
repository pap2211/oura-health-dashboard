/**
 * Charts Module
 * Handles Chart.js visualization for Oura health data
 */

class OuraCharts {
    constructor() {
        this.chart = null;
        this.chartCanvas = document.getElementById('trends-chart');
    }

    /**
     * Initialize or update the trends chart
     */
    createTrendsChart(trendData) {
        try {
            // Destroy existing chart if it exists
            if (this.chart) {
                this.chart.destroy();
            }

            // Prepare data for the chart
            const chartData = this.prepareTrendData(trendData);

            const ctx = this.chartCanvas.getContext('2d');
            
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [
                        {
                            label: 'Sleep Score',
                            data: chartData.sleepScores,
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            pointBackgroundColor: '#6366f1',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2
                        },
                        {
                            label: 'Readiness Score',
                            data: chartData.readinessScores,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            pointBackgroundColor: '#10b981',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2
                        },
                        {
                            label: 'Activity Score',
                            data: chartData.activityScores,
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            pointBackgroundColor: '#f59e0b',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        title: {
                            display: false
                        },
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#ffffff',
                                font: {
                                    size: 12,
                                    weight: '400'
                                },
                                usePointStyle: true,
                                pointStyle: 'circle',
                                padding: 20
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(22, 33, 62, 0.9)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#374151',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                color: 'rgba(55, 65, 81, 0.5)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#a1a1aa',
                                font: {
                                    size: 11
                                }
                            },
                            title: {
                                display: true,
                                text: 'Score',
                                color: '#a1a1aa',
                                font: {
                                    size: 12,
                                    weight: '400'
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(55, 65, 81, 0.3)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#a1a1aa',
                                font: {
                                    size: 11
                                }
                            },
                            title: {
                                display: true,
                                text: 'Date',
                                color: '#a1a1aa',
                                font: {
                                    size: 12,
                                    weight: '400'
                                }
                            }
                        }
                    }
                }
            });

            console.log('Trends chart created successfully');

        } catch (error) {
            console.error('Error creating trends chart:', error);
        }
    }

    /**
     * Prepare trend data for Chart.js
     */
    prepareTrendData(trendData) {
        const labels = [];
        const sleepScores = [];
        const readinessScores = [];
        const activityScores = [];

        // Sort dates and extract data
        const sortedDates = Object.keys(trendData).sort();

        sortedDates.forEach(date => {
            const dayData = trendData[date];
            
            // Format date for display (e.g., "Jan 15")
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            
            labels.push(formattedDate);

            // Extract scores with fallbacks
            sleepScores.push(dayData.sleep?.score || null);
            readinessScores.push(dayData.readiness?.score || null);
            activityScores.push(dayData.activity?.score || null);
        });

        return {
            labels,
            sleepScores,
            readinessScores,
            activityScores
        };
    }

    /**
     * Update chart with new data
     */
    updateChart(trendData) {
        if (this.chart) {
            const chartData = this.prepareTrendData(trendData);
            
            this.chart.data.labels = chartData.labels;
            this.chart.data.datasets[0].data = chartData.sleepScores;
            this.chart.data.datasets[1].data = chartData.readinessScores;
            this.chart.data.datasets[2].data = chartData.activityScores;
            
            this.chart.update();
        }
    }

    /**
     * Clear the chart
     */
    clearChart() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

// Create global instance
window.ouraCharts = new OuraCharts();