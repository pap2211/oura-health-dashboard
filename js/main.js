/**
 * Main Application Script
 * Handles UI interactions and data display
 */

class OuraDashboard {
    constructor() {
        this.selectedDate = new Date().toISOString().split('T')[0];
        this.currentData = null;
        this.trendData = null;
        
        this.initializeApp();
    }

    /**
     * Initialize the application
     */
    initializeApp() {
        console.log('Initializing Oura Dashboard...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check if user has API token
        if (window.ouraAPI.hasToken()) {
            this.showDashboard();
            this.loadInitialData();
        } else {
            this.showTokenSetup();
        }
        
        // Set today's date as default
        this.setSelectedDate(this.selectedDate);
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Token setup
        document.getElementById('save-token').addEventListener('click', () => {
            this.handleTokenSave();
        });

        document.getElementById('api-token').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleTokenSave();
            }
        });

        // Date navigation
        document.getElementById('prev-day').addEventListener('click', () => {
            this.navigateDate(-1);
        });

        document.getElementById('next-day').addEventListener('click', () => {
            this.navigateDate(1);
        });

        document.getElementById('selected-date').addEventListener('change', (e) => {
            this.setSelectedDate(e.target.value);
            this.loadDataForDate(this.selectedDate);
        });

        // Retry button
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.loadDataForDate(this.selectedDate);
        });
    }

    /**
     * Handle API token saving
     */
    async handleTokenSave() {
        const tokenInput = document.getElementById('api-token');
        const token = tokenInput.value.trim();

        if (!token) {
            alert('Please enter your Oura API token');
            return;
        }

        try {
            // Store the token
            window.ouraAPI.storeToken(token);
            
            // Test the connection
            this.showLoading();
            await window.ouraAPI.testConnection();
            
            // Success - show dashboard
            tokenInput.value = ''; // Clear the input for security
            this.showDashboard();
            this.loadInitialData();
            
        } catch (error) {
            this.showError(`Invalid API token: ${error.message}`);
            window.ouraAPI.clearToken();
        }
    }

    /**
     * Load initial data (today's data + 7-day trends)
     */
    async loadInitialData() {
        try {
            this.showLoading();
            
            // Load today's data
            await this.loadDataForDate(this.selectedDate);
            
            // Load trend data
            this.trendData = await window.ouraAPI.getTrendData(7);
            window.ouraCharts.createTrendsChart(this.trendData);
            
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError(`Failed to load data: ${error.message}`);
        }
    }

    /**
     * Load data for a specific date
     */
    async loadDataForDate(date) {
        try {
            console.log(`Loading data for date: ${date}`);
            
            this.showLoading();
            this.currentData = await window.ouraAPI.getAllDataForDate(date);
            
            this.displayHealthMetrics(this.currentData);
            this.hideLoading();
            
        } catch (error) {
            console.error(`Error loading data for ${date}:`, error);
            this.showError(`Failed to load data for ${date}: ${error.message}`);
        }
    }

    /**
     * Display health metrics in the UI with circular progress
     */
    displayHealthMetrics(data) {
        console.log('Displaying health metrics:', data);

        // Sleep data
        if (data.sleep) {
            this.updateScoreWithProgress('sleep-score', 'sleep-progress', data.sleep.score || 0);
            this.updateElement('sleep-duration', this.formatDuration(data.sleep.total_sleep_duration));
            this.updateElement('sleep-efficiency', data.sleep.efficiency ? `${data.sleep.efficiency}%` : '--');
            this.updateElement('sleep-latency', data.sleep.latency ? `${Math.round(data.sleep.latency / 60)}m` : '--');
        } else {
            this.updateScoreWithProgress('sleep-score', 'sleep-progress', 0);
            this.updateElement('sleep-duration', '--');
            this.updateElement('sleep-efficiency', '--');
            this.updateElement('sleep-latency', '--');
        }

        // Readiness data
        if (data.readiness) {
            this.updateScoreWithProgress('readiness-score', 'readiness-progress', data.readiness.score || 0);
            
            // Find HRV balance and recovery index from contributors
            const contributors = data.readiness.contributors || {};
            this.updateElement('hrv-balance', contributors.hrv_balance || '--');
            this.updateElement('recovery-index', contributors.recovery_index || '--');
        } else {
            this.updateScoreWithProgress('readiness-score', 'readiness-progress', 0);
            this.updateElement('hrv-balance', '--');
            this.updateElement('recovery-index', '--');
        }

        // Activity data
        if (data.activity) {
            this.updateScoreWithProgress('activity-score', 'activity-progress', data.activity.score || 0);
            this.updateElement('steps', this.formatNumber(data.activity.steps));
            this.updateElement('calories', this.formatNumber(data.activity.total_calories));
            this.updateElement('active-calories', this.formatNumber(data.activity.active_calories));
        } else {
            this.updateScoreWithProgress('activity-score', 'activity-progress', 0);
            this.updateElement('steps', '--');
            this.updateElement('calories', '--');
            this.updateElement('active-calories', '--');
        }

        // HRV data (from readiness)
        if (data.readiness) {
            const contributors = data.readiness.contributors || {};
            this.updateScoreWithProgress('hrv-score', 'hrv-progress', contributors.hrv_balance || 0);
            this.updateElement('resting-hr', contributors.resting_heart_rate || '--');
            this.updateElement('hrv-ms', contributors.hrv_balance ? `${contributors.hrv_balance}ms` : '--');
        } else {
            this.updateScoreWithProgress('hrv-score', 'hrv-progress', 0);
            this.updateElement('resting-hr', '--');
            this.updateElement('hrv-ms', '--');
        }

        // Show charts section
        document.getElementById('charts-section').style.display = 'block';

        // Add fade-in animation
        document.getElementById('dashboard').classList.add('fade-in');
    }

    /**
     * Update score with circular progress animation
     */
    updateScoreWithProgress(scoreElementId, progressElementId, score) {
        const scoreElement = document.getElementById(scoreElementId);
        const progressElement = document.getElementById(progressElementId);
        
        if (scoreElement && progressElement) {
            // Update score text
            scoreElement.textContent = score || '--';
            
            // Calculate progress for circular animation (circumference = 2 * π * r = 2 * π * 52 ≈ 327)
            const circumference = 327;
            const progress = Math.max(0, Math.min(100, score)) / 100;
            const strokeDasharray = `${circumference * progress} ${circumference}`;
            
            // Animate the progress ring
            setTimeout(() => {
                progressElement.style.strokeDasharray = strokeDasharray;
            }, 100);
        }
    }

    /**
     * Navigate date by offset
     */
    navigateDate(offset) {
        const currentDate = new Date(this.selectedDate);
        currentDate.setDate(currentDate.getDate() + offset);
        
        const newDate = currentDate.toISOString().split('T')[0];
        this.setSelectedDate(newDate);
        this.loadDataForDate(this.selectedDate);
    }

    /**
     * Set the selected date and update UI
     */
    setSelectedDate(date) {
        this.selectedDate = date;
        document.getElementById('selected-date').value = date;
        
        // Update date display
        const dateObj = new Date(date);
        const today = new Date().toISOString().split('T')[0];
        
        let displayText;
        if (date === today) {
            displayText = 'Today';
        } else {
            displayText = dateObj.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
            });
        }
        
        document.getElementById('date-display').textContent = displayText;
    }

    /**
     * Utility functions
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || '--';
        }
    }

    formatDuration(seconds) {
        if (!seconds) return '--';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    formatNumber(num) {
        if (!num) return '--';
        return num.toLocaleString();
    }

    /**
     * UI State Management
     */
    showTokenSetup() {
        document.getElementById('token-setup').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('date-navigation').style.display = 'none';
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('token-setup').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('date-navigation').style.display = 'block';
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'none';
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('error').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error').style.display = 'block';
        document.getElementById('loading').style.display = 'none';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ouraDashboard = new OuraDashboard();
});