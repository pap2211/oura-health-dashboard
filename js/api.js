/**
 * Oura API Service
 * Handles all API communications with Oura Cloud API v2
 */

class OuraAPI {
    constructor() {
        // Use our local proxy instead of direct API calls
        this.baseURL = '/api/oura';
        this.token = this.getStoredToken();
    }

    /**
     * Get stored API token from localStorage
     */
    getStoredToken() {
        return localStorage.getItem('oura_api_token');
    }

    /**
     * Store API token in localStorage
     */
    storeToken(token) {
        localStorage.setItem('oura_api_token', token);
        this.token = token;
    }

    /**
     * Remove stored token
     */
    clearToken() {
        localStorage.removeItem('oura_api_token');
        this.token = null;
    }

    /**
     * Check if token is available
     */
    hasToken() {
        return !!this.token;
    }

    /**
     * Get authorization headers
     */
    getHeaders() {
        if (!this.token) {
            throw new Error('No API token available');
        }

        return {
            'X-Oura-Token': this.token,  // Use custom header for proxy
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
    }

    /**
     * Make API request
     */
    async makeRequest(endpoint, params = {}) {
        try {
            // Build the URL for our local proxy
            let url = `${this.baseURL}${endpoint}`;
            
            // Add query parameters
            if (Object.keys(params).length > 0) {
                const queryParams = new URLSearchParams();
                Object.keys(params).forEach(key => {
                    if (params[key] !== null && params[key] !== undefined) {
                        queryParams.append(key, params[key]);
                    }
                });
                const queryString = queryParams.toString();
                if (queryString) {
                    url += `?${queryString}`;
                }
            }

            console.log(`Making request to proxy: ${url}`);
            console.log('Headers:', this.getHeaders());

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders(),
                mode: 'cors'
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response body:', errorText);
                
                if (response.status === 401) {
                    throw new Error('Invalid API token. Please check your token and try again.');
                } else if (response.status === 429) {
                    throw new Error('API rate limit exceeded. Please wait a moment and try again.');
                } else {
                    throw new Error(`API request failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
                }
            }

            const data = await response.json();
            console.log(`API Response:`, data);
            
            return data;

        } catch (error) {
            console.error('API request error details:', error);
            
            // Check if it's a network error
            if (error.message === 'Failed to fetch') {
                throw new Error('Network error: Unable to connect to proxy server. Make sure the server is running.');
            }
            
            throw error;
        }
    }

    /**
     * Get personal information
     */
    async getPersonalInfo() {
        return await this.makeRequest('/personal_info');
    }

    /**
     * Get sleep data for a specific date range
     */
    async getSleepData(startDate, endDate) {
        return await this.makeRequest('/daily_sleep', {
            start_date: startDate,
            end_date: endDate
        });
    }

    /**
     * Get readiness data for a specific date range
     */
    async getReadinessData(startDate, endDate) {
        return await this.makeRequest('/daily_readiness', {
            start_date: startDate,
            end_date: endDate
        });
    }

    /**
     * Get activity data for a specific date range
     */
    async getActivityData(startDate, endDate) {
        return await this.makeRequest('/daily_activity', {
            start_date: startDate,
            end_date: endDate
        });
    }

    /**
     * Get HRV data for a specific date range
     */
    async getHRVData(startDate, endDate) {
        try {
            return await this.makeRequest('/heartrate', {
                start_datetime: `${startDate}T00:00:00`,
                end_datetime: `${endDate}T23:59:59`
            });
        } catch (error) {
            // HRV endpoint might not be available for all users
            console.warn('HRV data not available:', error.message);
            return { data: [] };
        }
    }

    /**
     * Get all health data for a specific date
     */
    async getAllDataForDate(date) {
        try {
            console.log(`Fetching all data for date: ${date}`);

            const [sleepData, readinessData, activityData] = await Promise.all([
                this.getSleepData(date, date),
                this.getReadinessData(date, date),
                this.getActivityData(date, date)
            ]);

            return {
                sleep: sleepData.data?.[0] || null,
                readiness: readinessData.data?.[0] || null,
                activity: activityData.data?.[0] || null
            };

        } catch (error) {
            console.error('Error fetching all data for date:', error);
            throw error;
        }
    }

    /**
     * Get trend data for the last N days
     */
    async getTrendData(days = 7) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - (days - 1));

            const formatDate = (date) => date.toISOString().split('T')[0];

            console.log(`Fetching trend data for ${days} days: ${formatDate(startDate)} to ${formatDate(endDate)}`);

            const [sleepData, readinessData, activityData] = await Promise.all([
                this.getSleepData(formatDate(startDate), formatDate(endDate)),
                this.getReadinessData(formatDate(startDate), formatDate(endDate)),
                this.getActivityData(formatDate(startDate), formatDate(endDate))
            ]);

            // Organize data by date
            const trendData = {};
            
            // Process sleep data
            sleepData.data?.forEach(item => {
                if (!trendData[item.day]) trendData[item.day] = {};
                trendData[item.day].sleep = item;
            });

            // Process readiness data
            readinessData.data?.forEach(item => {
                if (!trendData[item.day]) trendData[item.day] = {};
                trendData[item.day].readiness = item;
            });

            // Process activity data
            activityData.data?.forEach(item => {
                if (!trendData[item.day]) trendData[item.day] = {};
                trendData[item.day].activity = item;
            });

            return trendData;

        } catch (error) {
            console.error('Error fetching trend data:', error);
            throw error;
        }
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const personalInfo = await this.getPersonalInfo();
            console.log('API connection successful:', personalInfo);
            return true;
        } catch (error) {
            console.error('API connection failed:', error);
            throw error;
        }
    }
}

// Create global instance
window.ouraAPI = new OuraAPI();