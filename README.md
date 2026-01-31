# Oura Health Dashboard

A simple, mobile-responsive web application that connects to your Oura Ring data and displays your health metrics in an intuitive dashboard.

## Features

- **Oura API Integration**: Secure connection to your personal Oura Ring data
- **Health Metrics Display**: View Sleep, Readiness, Activity, and HRV scores
- **Data Visualization**: 7-day trend charts using Chart.js
- **Date Navigation**: Browse historical data with easy date selection
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Real-time Data**: Fetch and display your latest health metrics

## Getting Started

### Prerequisites

1. **Oura Ring**: You need an active Oura Ring and account
2. **Oura API Token**: Personal Access Token from your Oura account

### Setup Instructions

1. **Get Your Oura API Token**:
   - Go to [Oura Personal Access Tokens](https://cloud.ouraring.com/personal-access-tokens)
   - Create a new token with a descriptive name
   - Copy the generated token (you'll need this for the app)

2. **Run the Application**:
   - Open `index.html` in your web browser
   - Enter your Oura API token when prompted
   - Start exploring your health data!

### Local Development

For local development with a simple HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Project Structure

```
oura-dashboard/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Custom styles and responsive design
├── js/
│   ├── api.js         # Oura API service layer
│   ├── charts.js      # Chart.js visualization logic
│   └── main.js        # Main application logic and UI management
└── README.md          # This file
```

## API Endpoints Used

This application uses the following Oura API v2 endpoints:

- `GET /v2/usercollection/personal_info` - Basic profile information
- `GET /v2/usercollection/daily_sleep` - Sleep data and scores
- `GET /v2/usercollection/daily_readiness` - Readiness scores and factors
- `GET /v2/usercollection/daily_activity` - Activity metrics and scores

## Health Metrics Displayed

### Sleep Score
- Overall sleep quality score (0-100)
- Sleep duration, efficiency, and latency
- Breakdown of sleep contributors

### Readiness Score  
- Daily readiness score (0-100)
- HRV balance and recovery index
- Recovery recommendations

### Activity Score
- Activity score based on movement (0-100)
- Steps, total calories, and active calories
- Daily activity goals and progress

### Heart Rate Variability
- HRV trends and analysis
- Resting heart rate
- Recovery indicators

## Privacy & Security

- **Local Storage**: Your API token is stored securely in your browser's local storage
- **No Data Collection**: This app doesn't collect, store, or transmit your health data
- **Direct API Connection**: Data is fetched directly from Oura's secure API
- **Client-Side Only**: All processing happens in your browser

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Requirements**: ES6+ JavaScript support, Fetch API

## Troubleshooting

### API Token Issues
- Ensure your token is copied correctly (no extra spaces)
- Verify the token hasn't expired
- Check that you have an active Oura membership

### Data Not Loading
- Check your internet connection
- Verify your Oura Ring has synced recent data
- Some metrics may not be available for all users

### Browser Issues
- Try refreshing the page
- Clear browser cache and localStorage
- Ensure JavaScript is enabled

## Future Enhancements

This basic dashboard provides a foundation for more advanced features:

- **AI Integration**: Add OpenAI API for health insights and recommendations
- **Goal Setting**: Personal health goal tracking and progress
- **Data Export**: Export health data to CSV or PDF reports
- **Advanced Charts**: More detailed visualizations and correlations
- **Mobile App**: Convert to React Native for native mobile experience

## Contributing

This is a learning project, but suggestions and improvements are welcome! Feel free to:

- Report bugs or issues
- Suggest new features
- Submit pull requests
- Share your own enhancements

## License

This project is open source and available under the MIT License.

## Support

For Oura API-related questions, refer to the [Oura Developer Documentation](https://developer.ouraring.com/).

For app-specific issues, please check the browser console for error messages and troubleshooting information.