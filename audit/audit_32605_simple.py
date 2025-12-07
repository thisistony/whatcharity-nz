#!/usr/bin/env python3

import requests
import json
import sys
import re
from decimal import Decimal

CHARITY_ID = 32605
API_BASE = 'http://localhost:8000/api'
PDF_URL = 'https://register.charities.govt.nz/Document/DownloadPdf?pdfType=AnnualReturnSummary&relatedId=5a3707e0-bf0e-f011-bb41-0022480ffcd1&isPublic=true'

def format_currency(value):
    """Format value as NZ currency"""
    if isinstance(value, str):
        # Remove common formatting
        value = re.sub(r'[$,\s%]', '', value)
        try:
            value = float(value)
        except:
            return value
    if isinstance(value, (int, float)):
        return f"${value:,.0f}"
    return str(value)

def fetch_financial_data(charity_id):
    """Fetch financial data from API"""
    try:
        url = f'{API_BASE}/financial?id={charity_id}'
        print(f"Fetching: {url}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        results = data.get('d') or data.get('value') or []
        if results:
            return results[0]
        return None
    except Exception as e:
        print(f"Error fetching financial data: {e}")
        return None

def fetch_charity_info(charity_id):
    """Fetch charity basic information"""
    try:
        url = f'{API_BASE}/charity?id={charity_id}'
        print(f"Fetching: {url}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        results = data.get('d') or data.get('value') or []
        if results:
            return results[0]
        return None
    except Exception as e:
        print(f"Error fetching charity info: {e}")
        return None

def clean_value(val):
    """Convert currency string to number"""
    if not val:
        return 0
    if isinstance(val, (int, float)):
        return val
    return float(re.sub(r'[$,\s%]', '', str(val))) or 0

def run_audit():
    print("=" * 70)
    print(f"AUDIT: Charity ID {CHARITY_ID}")
    print("=" * 70)
    print()

    # Fetch data
    print("[1/2] Fetching charity information...")
    charity_info = fetch_charity_info(CHARITY_ID)

    print("[2/2] Fetching financial data...")
    financial_data = fetch_financial_data(CHARITY_ID)

    if not financial_data:
        print("\n❌ ERROR: Could not fetch financial data from API")
        print(f"\nPDF URL for manual verification:")
        print(PDF_URL)
        sys.exit(1)

    print("\n" + "=" * 70)
    print("FINANCIAL DATA EXTRACTED FROM LOCALHOST")
    print("=" * 70)
    print()

    # Basic info
    if charity_info:
        print(f"Charity Name: {charity_info.get('Name', 'N/A')}")
        print(f"Registration Number: {charity_info.get('CharityRegistrationNumber', 'N/A')}")
        print(f"Date Registered: {charity_info.get('DateRegistered', 'N/A')}")
    print()

    # Main figures
    print("MAIN FINANCIAL FIGURES:")
    print("-" * 70)

    total_income = financial_data.get('TotalGrossIncome', 0)
    total_expenditure = financial_data.get('TotalExpenditure', 0)
    net_surplus = financial_data.get('NetSurplusDeficitForTheYear', 0)
    total_assets = financial_data.get('TotalAssets', 0)
    year_ended = financial_data.get('YearEnded', 'N/A')

    print(f"Year Ended: {year_ended}")
    print(f"Total Income: {format_currency(total_income)}")
    print(f"Total Expenditure: {format_currency(total_expenditure)}")
    print(f"Net Surplus/Deficit: {format_currency(net_surplus)}")
    print(f"Total Assets: {format_currency(total_assets)}")
    print()

    # Expenditure breakdown
    print("EXPENDITURE BREAKDOWN:")
    print("-" * 70)
    exp_categories = [
        ('SalariesAndWagesExpenditure', 'Salaries & Wages'),
        ('FundraisingExpenditure', 'Fundraising'),
        ('ServiceProvisionExpenditure', 'Service Provision (Charitable Programs)'),
        ('GrantsDonationsExpenditure', 'Grants & Donations (Within NZ)'),
        ('TradingExpenditure', 'Trading Operations'),
        ('VolunteerExpenditure', 'Volunteer Expenses'),
        ('OtherExpenditure', 'Other Expenditure'),
        ('OverseasExpenditure', 'Overseas Expenditure'),
    ]

    exp_total = 0
    for key, label in exp_categories:
        value = financial_data.get(key, 0)
        if value:
            print(f"{label:40} {format_currency(value):>15}")
            exp_total += value

    print("-" * 70)
    print(f"{'TOTAL EXPENDITURE':40} {format_currency(total_expenditure):>15}")
    print()

    # Income breakdown
    print("INCOME BREAKDOWN:")
    print("-" * 70)
    inc_categories = [
        ('DonationsKohaBequestsFundraisingIncome', 'Donations, Koha, Bequests'),
        ('GeneralGrantsIncome', 'General Grants'),
        ('CapitalGrantsIncome', 'Capital Grants'),
        ('GovernmentServiceDeliveryGrantsIncome', 'Government Service Delivery Grants'),
        ('NonGovernmentServiceDeliveryGrantsIncome', 'Non-Government Service Delivery Grants'),
        ('MembershipFeesSubscriptionsIncome', 'Membership Fees'),
        ('CommercialActivitiesIncome', 'Commercial Activities'),
        ('InterestDividendsInvestmentRevenueIncome', 'Interest, Dividends & Investments'),
        ('OtherIncome', 'Other Revenue'),
    ]

    inc_total = 0
    for key, label in inc_categories:
        value = financial_data.get(key, 0)
        if value:
            print(f"{label:40} {format_currency(value):>15}")
            inc_total += value

    print("-" * 70)
    print(f"{'TOTAL INCOME':40} {format_currency(total_income):>15}")
    print()

    # Balance sheet
    print("BALANCE SHEET ITEMS:")
    print("-" * 70)

    current_assets = financial_data.get('CurrentAssets', 0)
    fixed_assets = financial_data.get('FixedAssets', 0)
    other_assets = financial_data.get('OtherAssets', 0)
    current_liabilities = financial_data.get('CurrentLiabilities', 0)
    non_current_liabilities = financial_data.get('NonCurrentLiabilities', 0)
    total_liabilities = financial_data.get('TotalLiabilities', 0)
    total_equity = financial_data.get('TotalEquity', 0)

    if current_assets or fixed_assets or other_assets:
        print(f"Current Assets: {format_currency(current_assets)}")
        print(f"Fixed Assets: {format_currency(fixed_assets)}")
        print(f"Other Assets: {format_currency(other_assets)}")
        print()

    print(f"Current Liabilities: {format_currency(current_liabilities)}")
    print(f"Non-Current Liabilities: {format_currency(non_current_liabilities)}")
    print(f"Total Liabilities: {format_currency(total_liabilities)}")
    print(f"Total Equity: {format_currency(total_equity)}")
    print()

    # Key metrics
    print("KEY METRICS:")
    print("-" * 70)

    if total_expenditure > 0:
        salaries = financial_data.get('SalariesAndWagesExpenditure', 0)
        staff_ratio = (salaries / total_expenditure * 100) if total_expenditure > 0 else 0
        non_salary_ratio = 100 - staff_ratio
        print(f"Staff Cost Ratio: {staff_ratio:.1f}%")
        print(f"Non-Salary Expenditure Ratio: {non_salary_ratio:.1f}%")

    overseas = financial_data.get('OverseasExpenditure', 0)
    if overseas and total_expenditure > 0:
        overseas_ratio = (overseas / total_expenditure * 100)
        print(f"Overseas Spending Ratio: {overseas_ratio:.1f}%")
    print()

    # People
    if financial_data.get('VolunteerCount') or financial_data.get('EmployeeCount'):
        print("PEOPLE & OPERATIONS:")
        print("-" * 70)
        if financial_data.get('VolunteerCount'):
            print(f"Total Volunteers: {financial_data.get('VolunteerCount')}")
        if financial_data.get('VolunteerHours'):
            print(f"Volunteer Hours (per year): {financial_data.get('VolunteerHours')}")
        if financial_data.get('EmployeeCount'):
            print(f"Employees: {financial_data.get('EmployeeCount')}")
        if financial_data.get('EmployeeHours'):
            print(f"Employee Hours (per week): {financial_data.get('EmployeeHours')}")
        print()

    print("=" * 70)
    print("MANUAL PDF VERIFICATION REQUIRED")
    print("=" * 70)
    print()
    print("Please visit the following PDF link to verify all figures:")
    print(PDF_URL)
    print()
    print("Compare each value above with the PDF to identify any discrepancies.")
    print()

    # Print raw JSON for reference
    print("=" * 70)
    print("RAW FINANCIAL DATA (JSON)")
    print("=" * 70)
    print(json.dumps(financial_data, indent=2, default=str))

if __name__ == '__main__':
    run_audit()
