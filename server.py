#!/usr/bin/env python3
"""
Simple proxy server for NZ Charities OData API
Handles CORS issues by proxying requests from the frontend
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.request
import urllib.parse
import json
from urllib.error import HTTPError, URLError


class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers to allow browser access
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # Handle API proxy requests
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            # Serve static files
            super().do_GET()

    def handle_api_request(self):
        try:
            # Extract the query parameters from the path
            # Path format: /api/search?q=searchterm or /api/organisation?id=123 or /api/financial?id=123

            if self.path.startswith('/api/search'):
                self.handle_search()
            elif self.path.startswith('/api/organisation'):
                self.handle_organisation()
            elif self.path.startswith('/api/financial'):
                self.handle_financial()
            elif self.path.startswith('/api/officers'):
                self.handle_officers()
            elif self.path.startswith('/api/groupfinancial'):
                self.handle_groupfinancial()
            elif self.path.startswith('/api/groupinfo'):
                self.handle_groupinfo()
            elif self.path.startswith('/api/group'):
                self.handle_group()
            elif self.path.startswith('/api/historical'):
                self.handle_historical()
            elif self.path.startswith('/api/documents'):
                self.handle_documents()
            else:
                self.send_error(404, "API endpoint not found")

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = json.dumps({'error': str(e)})
            self.wfile.write(error_response.encode())

    def handle_search(self):
        # Parse query parameters
        query_string = self.path.split('?', 1)[1] if '?' in self.path else ''
        params = urllib.parse.parse_qs(query_string)
        search_query = params.get('q', [''])[0]

        if not search_query or len(search_query) < 2:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Query too short'}).encode())
            return

        # Build OData query
        lower_query = search_query.lower()
        # OData requires single quotes to be escaped as two single quotes
        odata_escaped = lower_query.replace("'", "''")
        # URL encode the entire filter value to handle spaces and special characters
        encoded_query = urllib.parse.quote(odata_escaped)
        odata_url = f"https://www.odata.charities.govt.nz/Organisations?$filter=substringof('{encoded_query}',tolower(Name))%20and%20RegistrationStatus%20eq%20'Registered'&$top=10&$format=json&$select=OrganisationId,Name,CharityRegistrationNumber,DateRegistered,MainActivityId"

        self.proxy_request(odata_url)

    def handle_organisation(self):
        query_string = self.path.split('?', 1)[1] if '?' in self.path else ''
        params = urllib.parse.parse_qs(query_string)
        org_id = params.get('id', [''])[0]

        if not org_id:
            self.send_error(400, "Missing organisation ID")
            return

        odata_url = f"https://www.odata.charities.govt.nz/Organisations({org_id})?$format=json"
        self.proxy_request(odata_url)

    def handle_financial(self):
        query_string = self.path.split('?', 1)[1] if '?' in self.path else ''
        params = urllib.parse.parse_qs(query_string)
        org_id = params.get('id', [''])[0]

        if not org_id:
            self.send_error(400, "Missing organisation ID")
            return

        odata_url = f"https://www.odata.charities.govt.nz/AnnualReturn?$filter=OrganisationId%20eq%20{org_id}&$orderby=YearEnded%20desc&$top=1&$format=json"
        self.proxy_request(odata_url)

    def handle_officers(self):
        query_string = self.path.split('?', 1)[1] if '?' in self.path else ''
        params = urllib.parse.parse_qs(query_string)
        org_id = params.get('id', [''])[0]

        if not org_id:
            self.send_error(400, "Missing organisation ID")
            return

        odata_url = f"https://www.odata.charities.govt.nz/vOfficerOrganisations?$filter=OrganisationId%20eq%20{org_id}&$top=20&$format=json"
        self.proxy_request(odata_url)

    def handle_group(self):
        query_string = self.path.split('?', 1)[1] if '?' in self.path else ''
        params = urllib.parse.parse_qs(query_string)
        group_id = params.get('groupId', [''])[0]

        if not group_id:
            self.send_error(400, "Missing group ID")
            return

        odata_url = f"https://www.odata.charities.govt.nz/Organisations?$filter=GroupId%20eq%20{group_id}&$select=OrganisationId,Name,CharityRegistrationNumber,GroupId,RegistrationStatus,DateRegistered&$orderby=Name&$format=json"
        self.proxy_request(odata_url)

    def handle_groupfinancial(self):
        query_string = self.path.split('?', 1)[1] if '?' in self.path else ''
        params = urllib.parse.parse_qs(query_string)
        group_id = params.get('groupId', [''])[0]

        if not group_id:
            self.send_error(400, "Missing group ID")
            return

        odata_url = f"https://www.odata.charities.govt.nz/Groups({group_id})/AnnualReturn?$orderby=YearEnded%20desc&$top=1&$format=json"
        self.proxy_request(odata_url)

    def handle_groupinfo(self):
        query_string = self.path.split('?', 1)[1] if '?' in self.path else ''
        params = urllib.parse.parse_qs(query_string)
        group_id = params.get('groupId', [''])[0]

        if not group_id:
            self.send_error(400, "Missing group ID")
            return

        odata_url = f"https://www.odata.charities.govt.nz/Groups({group_id})?$format=json"
        self.proxy_request(odata_url)

    def handle_historical(self):
        query_string = self.path.split('?', 1)[1] if '?' in self.path else ''
        params = urllib.parse.parse_qs(query_string)
        org_id = params.get('id', [''])[0]

        if not org_id:
            self.send_error(400, "Missing organisation ID")
            return

        odata_url = f"https://www.odata.charities.govt.nz/AnnualReturn?$filter=OrganisationId%20eq%20{org_id}&$orderby=YearEnded%20desc&$format=json"
        self.proxy_request(odata_url)

    def handle_documents(self):
        query_string = self.path.split('?', 1)[1] if '?' in self.path else ''
        params = urllib.parse.parse_qs(query_string)
        org_id = params.get('id', [''])[0]

        if not org_id:
            self.send_error(400, "Missing organisation ID")
            return

        # Use the Charities Register document endpoint instead of OData
        register_url = f"https://register.charities.govt.nz/Document/GetDocuments?organisationId={org_id}"
        self.proxy_request(register_url)

    def proxy_request(self, url):
        try:
            # Create a Request object with proper headers
            req = urllib.request.Request(url)
            req.add_header('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            req.add_header('Accept', 'application/json')
            with urllib.request.urlopen(req, timeout=10) as response:
                data = response.read()

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(data)

        except HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = json.dumps({'error': f'API error: {e.code}'})
            self.wfile.write(error_response.encode())

        except URLError as e:
            self.send_response(503)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = json.dumps({'error': 'Could not connect to API'})
            self.wfile.write(error_response.encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = json.dumps({'error': str(e)})
            self.wfile.write(error_response.encode())


def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, CORSRequestHandler)
    print(f'Starting server on http://localhost:{port}')
    print('Press Ctrl+C to stop the server')
    httpd.serve_forever()


if __name__ == '__main__':
    run_server()
