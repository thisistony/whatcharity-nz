# NZ Charity Explorer

A web application for exploring financial transparency of New Zealand charities. Search for any registered charity in New Zealand and view detailed financial information, expenditure breakdowns, and insights.

## Features

### Search & Discovery
- Real-time search for NZ charities by name
- Displays registered charities only
- Shows charity registration number and date

### Financial Information
The app displays comprehensive financial data including:

**Key Financial Metrics:**
- Total Income
- Total Expenditure
- Net Surplus/Deficit
- Total Assets

**Expenditure Breakdown:**
- Salaries & Wages
- Service Provision (Charitable Programs)
- Grants Paid Within NZ
- Trading Operations Costs
- Other Expenditure

**Income Sources:**
- Donations & Koha
- Government Grants & Contracts
- Service & Trading Income
- Investment Income
- Other Income Sources

**Asset Composition:**
- Cash & Bank Balances
- Investments
- Land & Buildings
- Other Assets
- Total Liabilities
- Net Equity

### Key Insights

The app calculates and displays useful insights:

1. **Program Efficiency** - Percentage spent on charitable programs vs total expenditure
2. **Staff Cost Ratio** - Salaries & wages as percentage of total expenditure
3. **Overseas Spending** - Percentage of funds spent overseas
4. **Funding Independence** - Reliance on government funding vs other sources

## How to Use

### Installation

1. Clone or download this repository
2. No build process required - pure HTML, CSS, and JavaScript

### Running the Application

Simply open `index.html` in a modern web browser:

```bash
open index.html
```

Or use a local web server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (with http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

### Using the App

1. **Search for a Charity:**
   - Type the charity name in the search box
   - Results will appear as you type (minimum 2 characters)
   - Click on a charity from the dropdown to view details

2. **View Financial Data:**
   - The app displays the most recent filed annual return
   - All amounts are formatted (K = thousands, M = millions)
   - Visual bars show percentage breakdowns
   - Color-coded indicators show surplus (green) or deficit (red)

3. **Interpret Insights:**
   - **Program Efficiency**: Higher percentages indicate more spending on charitable activities
   - **Staff Cost Ratio**: Shows what portion goes to salaries
   - **Funding Independence**: Higher values mean less reliance on government funding
   - **Overseas Spending**: Shows international vs domestic focus

## Data Source

All data is sourced in real-time from the [New Zealand Charities Services OData API](https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data).

The API provides:
- Charity registration information
- Annual financial returns
- Officer information
- Activities and beneficiaries

## Technical Details

### Technologies Used
- Pure HTML5, CSS3, and JavaScript (ES6+)
- No frameworks or dependencies
- Responsive design for mobile and desktop
- Real-time API integration with OData

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses Fetch API for HTTP requests

### API Endpoints Used
- `Organisations` - Charity information
- `AnnualReturn` - Financial data

### CORS Note
The NZ Charities OData API supports CORS, so the app can make direct requests from the browser without a backend server.

## Features Breakdown

### Expenditure Analysis
Helps users understand where charities spend their money:
- **Service Provision** shows direct charitable program costs
- **Grants Paid** shows money distributed to other organizations
- Combined, these show the charity's direct impact

### Income Diversity
Shows funding sources:
- Diversified income (multiple sources) can indicate financial stability
- High government reliance may indicate vulnerability to policy changes
- High donation reliance shows community support

### Financial Health Indicators
- **Net Surplus/Deficit** shows if the charity is financially sustainable
- **Total Assets** indicates reserves and long-term viability
- **Asset Composition** shows liquidity vs long-term investments

## Limitations

- Only shows filed annual returns (some charities may be delayed)
- Financial data is self-reported by charities
- Historical trends require manual comparison
- Some charities may not have recent financial data
- Overseas spending percentage may not be available for all charities

## Privacy & Disclaimer

This tool displays publicly available information from the NZ Charities Register. All data is already publicly accessible through the official register.

**Disclaimer**: This tool is for informational purposes only. Users should verify all information with the [official Charities Register](https://www.charities.govt.nz). Financial data is self-reported by charities and may be subject to audit or correction.

## Future Enhancements

Potential features for future versions:
- Year-over-year comparison charts
- Export data to CSV/PDF
- Compare multiple charities side-by-side
- Historical trend visualization
- Advanced filtering (by activity type, region, size)
- Email alerts for new annual returns
- Charity ratings and benchmarking

## Contributing

Feel free to fork this project and submit pull requests for improvements!

## License

This project is open source and available for educational and personal use.

---

**Data Source**: [Charities Services NZ Open Data](https://www.charities.govt.nz/charities-in-new-zealand/the-charities-register/open-data)

**Built with**: HTML, CSS, JavaScript
