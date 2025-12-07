#!/usr/bin/env python3
"""
Comprehensive Audit for Charity ID 32605
Compares API data with what the website displays
"""

import requests
import json
import sys
from decimal import Decimal

CHARITY_ID = 32605
API_BASE = 'http://localhost:8000/api'

def fetch_data(endpoint, charity_id):
    """Fetch data from localhost API"""
    try:
        url = f'{API_BASE}/{endpoint}?id={charity_id}'
        response = requests.get(url, timeout=10)
        if response.status_code == 404:
            return None
        response.raise_for_status()
        data = response.json()
        results = data.get('d') or data.get('value') or [data]
        if isinstance(results, list) and len(results) > 0:
            return results[0]
        return results
    except Exception as e:
        print(f"Error fetching {endpoint}: {e}")
        return None

def format_currency(val):
    """Format as currency"""
    if val is None or val == 0:
        return '$0'
    return f"${val:,.0f}" if isinstance(val, (int, float)) else str(val)

def run_comprehensive_audit():
    print("\n" + "=" * 80)
    print(f"COMPREHENSIVE AUDIT REPORT: CHARITY ID {CHARITY_ID}")
    print("=" * 80 + "\n")

    # Fetch financial data
    print("Fetching data from API...")
    financial = fetch_data('financial', CHARITY_ID)

    if not financial:
        print("ERROR: Could not fetch financial data")
        sys.exit(1)

    print("✓ Data retrieved\n")

    # Extract year
    year_ended = financial.get('YearEnded', 'Unknown')
    print(f"Charity: ID {CHARITY_ID}")
    print(f"Year Ended: {year_ended}")
    print(f"Reporting Tier: {financial.get('ReportingTierId', 'Unknown')}")
    print(f"Status Code: {financial.get('Status', 'Unknown')}")
    print(f"Annual Return ID: {financial.get('NoticeofChangeAnnualReturnId', 'N/A')}")
    print()

    # Main Financial Summary
    print("=" * 80)
    print("MAIN FINANCIAL FIGURES - API DATA")
    print("=" * 80)
    print(f"Total Gross Income:        {format_currency(financial.get('TotalGrossIncome'))}")
    print(f"Total Expenditure:         {format_currency(financial.get('TotalExpenditure'))}")
    print(f"Net Surplus/Deficit:       {format_currency(financial.get('NetSurplusDeficitForTheYear'))}")
    print(f"Total Assets:              {format_currency(financial.get('TotalAssets'))}")
    print(f"Total Liabilities:         {format_currency(financial.get('TotalLiabilities'))}")
    print(f"Total Equity:              {format_currency(financial.get('TotalEquity'))}")
    print()

    # EXPENDITURE DETAIL
    print("=" * 80)
    print("DETAILED EXPENDITURE BREAKDOWN - API DATA")
    print("=" * 80)

    expenditure_items = {
        'SalariesAndWages': 'Salaries & Wages',
        'FundRaisingExpenses': 'Fundraising Expenses',
        'CostOfServiceProvision': 'Cost of Service Provision',
        'GrantsOrDonationsPaid': 'Grants or Donations Paid',
        'CostOfTradingOperations': 'Cost of Trading Operations',
        'VolunteerRelatedExpenses': 'Volunteer Related Expenses',
        'OtherOpeatingExpenses': 'Other Operating Expenses',
        'Depreciation': 'Depreciation',
        'InterestPaid': 'Interest Paid',
        'AllOtherExpenditure': 'All Other Expenditure',
    }

    total_exp = 0
    for key, label in expenditure_items.items():
        value = financial.get(key)
        if value is not None:
            print(f"{label:35} {format_currency(value):>15}")
            if key != 'AllOtherExpenditure':  # Don't double-count
                total_exp += (value or 0)

    total_from_api = financial.get('TotalExpenditure', 0) or 0
    print("-" * 80)
    print(f"{'TOTAL EXPENDITURE (from API)':35} {format_currency(total_from_api):>15}")
    if total_exp > 0 and total_from_api > 0:
        if total_exp != total_from_api:
            print(f"⚠️  WARNING: Sum of items ({format_currency(total_exp)}) ≠ Total ({format_currency(total_from_api)})")
    print()

    # INCOME DETAIL
    print("=" * 80)
    print("DETAILED INCOME BREAKDOWN - API DATA")
    print("=" * 80)

    income_items = {
        'DonationsKoha': 'Donations & Koha',
        'GeneralGrantsReceived': 'General Grants',
        'CapitalGrantsAndDonations': 'Capital Grants & Donations',
        'GovernmentServiceDeliveryGrantsContracts': 'Government Service Delivery Grants',
        'NonGovernmentServiceDeliveryGrantsContracts': 'Non-Government Service Delivery Grants',
        'MembershipFees': 'Membership Fees',
        'ServiceTradingIncome': 'Service Trading Income',
        'RevenueFromCommercialActivities': 'Revenue from Commercial Activities',
        'NewZealandDividends': 'NZ Dividends',
        'InterestOfDividendsReceived': 'Interest/Dividends Received',
        'OtherInvestmentIncome': 'Other Investment Income',
        'AllOtherIncome': 'All Other Income',
    }

    total_inc = 0
    for key, label in income_items.items():
        value = financial.get(key)
        if value is not None:
            print(f"{label:35} {format_currency(value):>15}")
            if key != 'AllOtherIncome':  # Don't double-count
                total_inc += (value or 0)

    total_income_api = financial.get('TotalGrossIncome', 0) or 0
    print("-" * 80)
    print(f"{'TOTAL INCOME (from API)':35} {format_currency(total_income_api):>15}")
    if total_inc > 0 and total_income_api > 0:
        if total_inc != total_income_api:
            print(f"⚠️  WARNING: Sum of items ({format_currency(total_inc)}) ≠ Total ({format_currency(total_income_api)})")
    print()

    # BALANCE SHEET
    print("=" * 80)
    print("BALANCE SHEET - API DATA")
    print("=" * 80)

    print("ASSETS:")
    assets_items = {
        'CashAndBankBalances': 'Cash & Bank Balances',
        'CashOnHand': 'Cash on Hand',
        'Investments': 'Investments',
        'Land': 'Land',
        'Buildings': 'Buildings',
        'Vehicles': 'Vehicles',
        'ComputersAndOfficeEquipment': 'Computers & Office Equipment',
        'AllOtherFixedAssets': 'All Other Fixed Assets',
        'MoneyHeldOnBehalfOfOthers': 'Money Held on Behalf of Others',
    }

    for key, label in assets_items.items():
        value = financial.get(key)
        if value is not None:
            print(f"  {label:35} {format_currency(value):>15}")

    print("\nLIABILITIES:")
    liab_items = {
        'CurrentLiabilities': 'Current Liabilities',
        'NonCurrentLiabilities': 'Non-Current Liabilities',
        'AllCurrentLiabilities': 'All Current Liabilities',
        'AllNonCurrentLiabilities': 'All Non-Current Liabilities',
    }

    for key, label in liab_items.items():
        value = financial.get(key)
        if value is not None:
            print(f"  {label:35} {format_currency(value):>15}")

    print()

    # PEOPLE & OPERATIONS
    print("=" * 80)
    print("PEOPLE & OPERATIONS - API DATA")
    print("=" * 80)

    people_data = {
        'NumberOfFulltimeEmployees': 'Full-time Employees',
        'NumberOfParttimeEmployees': 'Part-time Employees',
        'AvgAllPaidHoursPerWeek': 'Avg Paid Hours per Week',
        'AvgNoVolunteersPerWeek': 'Avg Volunteers per Week',
        'AvgAllVolunteerHoursPerWeek': 'Avg Volunteer Hours per Week',
    }

    for key, label in people_data.items():
        value = financial.get(key)
        if value is not None:
            print(f"{label:35} {value}")

    print()

    # IMPORTANT NOTES
    print("=" * 80)
    print("AUDIT NOTES")
    print("=" * 80)

    tier = financial.get('ReportingTierId')
    status = financial.get('Status')

    print(f"\nReporting Tier: {tier}")
    if tier == 4:
        print("  → Tier 4 charities have minimal reporting requirements")

    print(f"\nStatus Code: {status}")
    if status == 10:
        print("  → Status 10 = Registered but may have minimal financial data")

    certifying_officer = financial.get('CertifyingOfficerName')
    if certifying_officer:
        print(f"\nCertifying Officer: {certifying_officer}")

    certified = financial.get('IsCertifiedToBeCorrect')
    if certified:
        print(f"Certified as Correct: Yes")

    # Check if mostly zeros
    if total_income_api == 0 and total_from_api == 0:
        print("\n⚠️  WARNING: All financial figures are ZERO")
        print("   This charity appears to have filed a minimal/dormant return")
        print("   Total Income: $0")
        print("   Total Expenditure: $0")

    # Display URL for manual PDF verification
    print("\n" + "=" * 80)
    print("PDF VERIFICATION")
    print("=" * 80)

    pdf_id = financial.get('NoticeofChangeAnnualReturnId')
    if pdf_id:
        pdf_url = f"https://register.charities.govt.nz/Document/DownloadPdf?pdfType=AnnualReturnSummary&relatedId={pdf_id}&isPublic=true"
        print(f"\nPDF Link: {pdf_url}")
        print("\nPlease visit the PDF above to manually verify that your website")
        print("displays the EXACT SAME financial figures as shown in the official PDF.")
        print("\nKey items to verify:")
        print(f"  ✓ Total Income: {format_currency(total_income_api)}")
        print(f"  ✓ Total Expenditure: {format_currency(total_from_api)}")
        print(f"  ✓ Net Surplus/Deficit: {format_currency(financial.get('NetSurplusDeficitForTheYear'))}")
        print(f"  ✓ Total Assets: {format_currency(financial.get('TotalAssets'))}")
        print(f"  ✓ All expenditure breakdowns")
        print(f"  ✓ All income breakdowns")
        print()

    # Show full JSON for reference
    print("=" * 80)
    print("FULL API RESPONSE (JSON)")
    print("=" * 80 + "\n")
    print(json.dumps(financial, indent=2, default=str))

if __name__ == '__main__':
    run_comprehensive_audit()
