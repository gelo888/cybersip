"""
Seed script for the Cybersecurity Sales Intelligence Platform.

Populates the database with:
  - 3 regions (APJ, EMEA, Americas)
  - Segment labels and territories (from sample_territories.json)
  - Industries
  - ~150 companies with a realistic size distribution
    (≈40 % SMB, ≈25 % Mid-Market, ≈25 % Enterprise, ≈10 % Government)
  - Company ↔ industry links
  - Contacts across Enterprise, Mid-Market, and Government companies
  - 6 pipeline stages
  - Sample engagements across stages
  - Product categories & products
  - Contracts with line items
  - Competitors with strengths/weaknesses
  - Competitor intel records (competitor presence at companies)

Run:  python prisma/seed.py          (standalone)
"""

import asyncio
import json
import random
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

from prisma import Json, Prisma

random.seed(42)

# ── Region & Territory definitions ────────────────────────────────────

REGIONS = [
    {
        "name": "Asia-Pacific & Japan",
        "code": "APJ",
        "territories": [
            {"name": "Japan", "description": "Japan market"},
            {"name": "ANZ", "description": "Australia & New Zealand"},
            {"name": "Southeast Asia", "description": "Singapore, Malaysia, Thailand, Indonesia, Philippines, Vietnam"},
            {"name": "India & South Asia", "description": "India, Sri Lanka, Bangladesh"},
            {"name": "Greater China", "description": "China, Hong Kong, Taiwan"},
            {"name": "South Korea", "description": "South Korea market"},
        ],
    },
    {
        "name": "Europe, Middle East & Africa",
        "code": "EMEA",
        "territories": [
            {"name": "UK & Ireland", "description": "United Kingdom and Ireland"},
            {"name": "DACH", "description": "Germany, Austria, Switzerland"},
            {"name": "Nordics", "description": "Sweden, Norway, Finland, Denmark"},
            {"name": "France & Benelux", "description": "France, Belgium, Netherlands, Luxembourg"},
            {"name": "Southern Europe", "description": "Italy, Spain, Portugal, Greece"},
            {"name": "Middle East", "description": "UAE, Saudi Arabia, Israel, Qatar"},
            {"name": "Africa", "description": "South Africa, Nigeria, Kenya, Egypt"},
        ],
    },
    {
        "name": "Americas",
        "code": "Americas",
        "territories": [
            {"name": "US East", "description": "US Eastern seaboard & Southeast"},
            {"name": "US West", "description": "US Western states & Mountain"},
            {"name": "US Central", "description": "US Midwest & Central"},
            {"name": "US Federal", "description": "US Federal Government accounts"},
            {"name": "Canada", "description": "Canada market"},
            {"name": "Latin America", "description": "Brazil, Mexico, Colombia, Argentina, Chile"},
        ],
    },
]

# ── Industries ────────────────────────────────────────────────────────

INDUSTRIES = [
    {"name": "Banking & Financial Services", "sector": "Financial Services"},
    {"name": "Insurance", "sector": "Financial Services"},
    {"name": "Healthcare & Life Sciences", "sector": "Healthcare"},
    {"name": "Pharmaceuticals", "sector": "Healthcare"},
    {"name": "Technology", "sector": "Technology"},
    {"name": "Telecommunications", "sector": "Technology"},
    {"name": "Energy & Utilities", "sector": "Energy"},
    {"name": "Oil & Gas", "sector": "Energy"},
    {"name": "Manufacturing", "sector": "Industrials"},
    {"name": "Aerospace & Defense", "sector": "Industrials"},
    {"name": "Retail & E-Commerce", "sector": "Consumer"},
    {"name": "Media & Entertainment", "sector": "Consumer"},
    {"name": "Government & Public Sector", "sector": "Government"},
    {"name": "Education", "sector": "Government"},
    {"name": "Transportation & Logistics", "sector": "Industrials"},
    {"name": "Professional Services", "sector": "Services"},
]

# ── Companies ─────────────────────────────────────────────────────────
# Tuple: (name, status, size, employees, revenue, website, ticker, country, territory, industry_idx)
#
# Size distribution targets per region (~50 each):
#   SMB ≈ 20   |  Mid_Market ≈ 13  |  Enterprise ≈ 13  |  Government ≈ 4

COMPANIES_APJ = [
    # ── Enterprise ────────────────────────────────────────────────────
    ("NTT Data Corporation", "active_client", "Enterprise", 19500, "$30B+", "https://www.nttdata.com", "NTDTY", "Japan", "Japan", 4),
    ("Mitsubishi UFJ Financial", "prospect", "Enterprise", 33000, "$50B+", "https://www.mufg.jp", "MUFG", "Japan", "Japan", 0),
    ("Commonwealth Bank of Australia", "active_client", "Enterprise", 53000, "$20B+", "https://www.commbank.com.au", "CBA", "Australia", "ANZ", 0),
    ("Telstra Corporation", "active_client", "Enterprise", 29000, "$18B+", "https://www.telstra.com.au", "TLSYY", "Australia", "ANZ", 5),
    ("DBS Group Holdings", "active_client", "Enterprise", 36000, "$14B+", "https://www.dbs.com", "DBSDY", "Singapore", "Southeast Asia", 0),
    ("Tata Consultancy Services", "active_client", "Enterprise", 15800, "$28B+", "https://www.tcs.com", "TCS", "India", "India & South Asia", 4),
    ("Infosys Limited", "active_client", "Enterprise", 12400, "$18B+", "https://www.infosys.com", "INFY", "India", "India & South Asia", 4),
    ("HDFC Bank", "prospect", "Enterprise", 17700, "$22B+", "https://www.hdfcbank.com", "HDB", "India", "India & South Asia", 0),
    ("Samsung Electronics", "active_client", "Enterprise", 26700, "$200B+", "https://www.samsung.com", "SSNLF", "South Korea", "South Korea", 4),
    ("TSMC", "prospect", "Enterprise", 7300, "$70B+", "https://www.tsmc.com", "TSM", "Taiwan", "Greater China", 8),
    ("SK Hynix", "prospect", "Enterprise", 5200, "$35B+", "https://www.skhynix.com", "HXSCF", "South Korea", "South Korea", 4),
    ("PT Telkom Indonesia", "prospect", "Enterprise", 25000, "$8B+", "https://www.telkom.co.id", "TLK", "Indonesia", "Southeast Asia", 5),
    # ── Mid-Market ────────────────────────────────────────────────────
    ("Rakuten Group", "previous_client", "Mid_Market", 1800, "$15B+", "https://www.rakuten.com", "RKUNY", "Japan", "Japan", 10),
    ("Grab Holdings", "prospect", "Mid_Market", 850, "$1.4B+", "https://www.grab.com", "GRAB", "Singapore", "Southeast Asia", 4),
    ("Cathay Financial Holdings", "prospect", "Mid_Market", 1200, "$8B+", "https://www.cathayholdings.com", None, "Taiwan", "Greater China", 1),
    ("KB Financial Group", "prospect", "Mid_Market", 1400, "$12B+", "https://www.kbfg.com", "KB", "South Korea", "South Korea", 0),
    ("Bangkok Bank", "prospect", "Mid_Market", 950, "$4B+", "https://www.bangkokbank.com", "BKKLY", "Thailand", "Southeast Asia", 0),
    ("Xero Limited", "active_client", "Mid_Market", 530, "$750M", "https://www.xero.com", "XRO", "New Zealand", "ANZ", 4),
    ("Canva Pty Ltd", "prospect", "Mid_Market", 380, "$500M", "https://www.canva.com", None, "Australia", "ANZ", 4),
    ("Razor Group Asia", "prospect", "Mid_Market", 290, "$120M", "https://www.razor-group.com", None, "Singapore", "Southeast Asia", 10),
    ("OYO Rooms", "lost", "Mid_Market", 450, "$300M", "https://www.oyorooms.com", None, "India", "India & South Asia", 15),
    ("Freshworks", "active_client", "Mid_Market", 620, "$600M", "https://www.freshworks.com", "FRSH", "India", "India & South Asia", 4),
    ("Coupang Inc.", "prospect", "Mid_Market", 1100, "$600M", "https://www.coupang.com", "CPNG", "South Korea", "South Korea", 10),
    # ── SMB ───────────────────────────────────────────────────────────
    ("Sakura IT Solutions", "prospect", "SMB", 35, "$4M", None, None, "Japan", "Japan", 4),
    ("Tokyo Cyber Defense", "active_client", "SMB", 22, "$2.5M", None, None, "Japan", "Japan", 4),
    ("Mount Fuji Manufacturing", "prospect", "SMB", 85, "$12M", None, None, "Japan", "Japan", 8),
    ("Coral Bay Medical Group", "prospect", "SMB", 45, "$8M", None, None, "Australia", "ANZ", 2),
    ("Southern Cross Legal", "active_client", "SMB", 28, "$5M", None, None, "Australia", "ANZ", 15),
    ("Outback Energy Solutions", "prospect", "SMB", 60, "$15M", None, None, "Australia", "ANZ", 6),
    ("Kiwi Cloud Services", "prospect", "SMB", 18, "$2M", None, None, "New Zealand", "ANZ", 4),
    ("LionCity Fintech", "active_client", "SMB", 42, "$6M", None, None, "Singapore", "Southeast Asia", 0),
    ("Marina Bay Analytics", "prospect", "SMB", 15, "$1.5M", None, None, "Singapore", "Southeast Asia", 4),
    ("Thai Silk Exports", "prospect", "SMB", 110, "$18M", None, None, "Thailand", "Southeast Asia", 10),
    ("Jakarta Digital Solutions", "prospect", "SMB", 55, "$5M", None, None, "Indonesia", "Southeast Asia", 4),
    ("Hanoi Logistics Co.", "prospect", "SMB", 90, "$10M", None, None, "Vietnam", "Southeast Asia", 14),
    ("Mumbai MedTech", "prospect", "SMB", 38, "$4M", None, None, "India", "India & South Asia", 2),
    ("Bengaluru Data Labs", "active_client", "SMB", 25, "$3M", None, None, "India", "India & South Asia", 4),
    ("Pune Legal Associates", "prospect", "SMB", 14, "$1.2M", None, None, "India", "India & South Asia", 15),
    ("Delhi Insurance Brokers", "prospect", "SMB", 30, "$3.5M", None, None, "India", "India & South Asia", 1),
    ("Shenzhen IoT Works", "prospect", "SMB", 48, "$6M", None, None, "China", "Greater China", 4),
    ("Taipei Precision Parts", "lost", "SMB", 75, "$9M", None, None, "Taiwan", "Greater China", 8),
    ("Seoul Gaming Studio", "prospect", "SMB", 20, "$2.5M", None, None, "South Korea", "South Korea", 11),
    ("Busan Shipping Co.", "prospect", "SMB", 65, "$8M", None, None, "South Korea", "South Korea", 14),
    # ── Government ────────────────────────────────────────────────────
    ("Australian Cyber Security Centre", "active_client", "Government", 350, None, "https://www.cyber.gov.au", None, "Australia", "ANZ", 12),
    ("Cyber Security Agency of Singapore", "prospect", "Government", 280, None, "https://www.csa.gov.sg", None, "Singapore", "Southeast Asia", 12),
    ("India CERT-In", "prospect", "Government", 420, None, "https://www.cert-in.org.in", None, "India", "India & South Asia", 12),
    ("Korea Internet & Security Agency", "prospect", "Government", 510, None, "https://www.kisa.or.kr", None, "South Korea", "South Korea", 12),
]

COMPANIES_EMEA = [
    # ── Enterprise ────────────────────────────────────────────────────
    ("HSBC Holdings", "active_client", "Enterprise", 22000, "$55B+", "https://www.hsbc.com", "HSBC", "United Kingdom", "UK & Ireland", 0),
    ("BAE Systems", "active_client", "Enterprise", 9300, "$25B+", "https://www.baesystems.com", "BAESY", "United Kingdom", "UK & Ireland", 9),
    ("Siemens AG", "active_client", "Enterprise", 31100, "$77B+", "https://www.siemens.com", "SIEGY", "Germany", "DACH", 8),
    ("SAP SE", "active_client", "Enterprise", 10700, "$32B+", "https://www.sap.com", "SAP", "Germany", "DACH", 4),
    ("Deutsche Bank", "prospect", "Enterprise", 8700, "$30B+", "https://www.db.com", "DB", "Germany", "DACH", 0),
    ("Ericsson", "active_client", "Enterprise", 10000, "$27B+", "https://www.ericsson.com", "ERIC", "Sweden", "Nordics", 5),
    ("TotalEnergies SE", "active_client", "Enterprise", 10000, "$200B+", "https://www.totalenergies.com", "TTE", "France", "France & Benelux", 7),
    ("Airbus SE", "prospect", "Enterprise", 13400, "$75B+", "https://www.airbus.com", "EADSY", "France", "France & Benelux", 9),
    ("ASML Holding", "prospect", "Enterprise", 4200, "$27B+", "https://www.asml.com", "ASML", "Netherlands", "France & Benelux", 4),
    ("Banco Santander", "active_client", "Enterprise", 19700, "$55B+", "https://www.santander.com", "SAN", "Spain", "Southern Europe", 0),
    ("Saudi Aramco", "prospect", "Enterprise", 70000, "$400B+", "https://www.aramco.com", "2222.SR", "Saudi Arabia", "Middle East", 7),
    ("Equinor ASA", "active_client", "Enterprise", 22000, "$105B+", "https://www.equinor.com", "EQNR", "Norway", "Nordics", 7),
    # ── Mid-Market ────────────────────────────────────────────────────
    ("Rolls-Royce Holdings", "prospect", "Mid_Market", 1800, "$17B+", "https://www.rolls-royce.com", "RYCEY", "United Kingdom", "UK & Ireland", 9),
    ("GSK plc", "prospect", "Mid_Market", 1600, "$36B+", "https://www.gsk.com", "GSK", "United Kingdom", "UK & Ireland", 3),
    ("Allianz SE", "prospect", "Mid_Market", 1590, "$150B+", "https://www.allianz.com", "ALIZY", "Germany", "DACH", 1),
    ("Zurich Insurance Group", "prospect", "Mid_Market", 560, "$72B+", "https://www.zurich.com", "ZURVY", "Switzerland", "DACH", 1),
    ("Nokia Corporation", "previous_client", "Mid_Market", 870, "$25B+", "https://www.nokia.com", "NOK", "Finland", "Nordics", 5),
    ("Maersk", "prospect", "Mid_Market", 1100, "$55B+", "https://www.maersk.com", "AMKBY", "Denmark", "Nordics", 14),
    ("ING Group", "prospect", "Mid_Market", 600, "$20B+", "https://www.ing.com", "ING", "Netherlands", "France & Benelux", 0),
    ("Enel SpA", "prospect", "Mid_Market", 560, "$95B+", "https://www.enel.com", "ENLAY", "Italy", "Southern Europe", 6),
    ("Iberdrola SA", "prospect", "Mid_Market", 420, "$48B+", "https://www.iberdrola.com", "IBDRY", "Spain", "Southern Europe", 6),
    ("Emirates NBD", "prospect", "Mid_Market", 1200, "$8B+", "https://www.emiratesnbd.com", None, "UAE", "Middle East", 0),
    ("CyberArk Software", "lost", "Mid_Market", 350, "$750M+", "https://www.cyberark.com", "CYBR", "Israel", "Middle East", 4),
    ("MTN Group", "prospect", "Mid_Market", 1700, "$10B+", "https://www.mtn.com", "MTNOY", "South Africa", "Africa", 5),
    ("Delivery Hero SE", "prospect", "Mid_Market", 480, "$9B+", "https://www.deliveryhero.com", "DHER", "Germany", "DACH", 4),
    # ── SMB ───────────────────────────────────────────────────────────
    ("Bristol Cyber Consulting", "active_client", "SMB", 18, "$2M", None, None, "United Kingdom", "UK & Ireland", 15),
    ("Edinburgh HealthTech", "prospect", "SMB", 35, "$4M", None, None, "United Kingdom", "UK & Ireland", 2),
    ("Thames Valley Insurance", "prospect", "SMB", 50, "$8M", None, None, "United Kingdom", "UK & Ireland", 1),
    ("Dublin Cloud Partners", "active_client", "SMB", 22, "$3M", None, None, "Ireland", "UK & Ireland", 4),
    ("Bavaria Precision GmbH", "prospect", "SMB", 95, "$14M", None, None, "Germany", "DACH", 8),
    ("Zurich Data Vault AG", "active_client", "SMB", 12, "$1.8M", None, None, "Switzerland", "DACH", 4),
    ("Alpine Legal Partners", "prospect", "SMB", 28, "$4.5M", None, None, "Austria", "DACH", 15),
    ("Stockholm AI Labs", "prospect", "SMB", 40, "$6M", None, None, "Sweden", "Nordics", 4),
    ("Oslo Maritime Tech", "active_client", "SMB", 55, "$9M", None, None, "Norway", "Nordics", 14),
    ("Helsinki EdTech Oy", "prospect", "SMB", 20, "$2.5M", None, None, "Finland", "Nordics", 13),
    ("Copenhagen Green Energy", "prospect", "SMB", 32, "$5M", None, None, "Denmark", "Nordics", 6),
    ("Lyon Biotech SAS", "prospect", "SMB", 45, "$7M", None, None, "France", "France & Benelux", 3),
    ("Brussels Compliance Group", "active_client", "SMB", 15, "$2M", None, None, "Belgium", "France & Benelux", 15),
    ("Rotterdam Port Logistics", "prospect", "SMB", 120, "$20M", None, None, "Netherlands", "France & Benelux", 14),
    ("Milan Fashion Digital", "prospect", "SMB", 30, "$4M", None, None, "Italy", "Southern Europe", 10),
    ("Lisbon Fintech Labs", "prospect", "SMB", 25, "$3M", None, None, "Portugal", "Southern Europe", 0),
    ("Athens Shipping Services", "lost", "SMB", 68, "$10M", None, None, "Greece", "Southern Europe", 14),
    ("Dubai Smart Retail", "active_client", "SMB", 42, "$6M", None, None, "UAE", "Middle East", 10),
    ("Tel Aviv Cyber Defense", "prospect", "SMB", 55, "$8M", None, None, "Israel", "Middle East", 4),
    ("Riyadh Digital Solutions", "prospect", "SMB", 38, "$5M", None, None, "Saudi Arabia", "Middle East", 4),
    ("Cape Town Media Group", "prospect", "SMB", 25, "$3M", None, None, "South Africa", "Africa", 11),
    ("Lagos PayTech", "prospect", "SMB", 30, "$2.5M", None, None, "Nigeria", "Africa", 0),
    ("Nairobi Cloud Services", "prospect", "SMB", 18, "$1.5M", None, None, "Kenya", "Africa", 4),
    # ── Government ────────────────────────────────────────────────────
    ("UK National Cyber Security Centre", "active_client", "Government", 950, None, "https://www.ncsc.gov.uk", None, "United Kingdom", "UK & Ireland", 12),
    ("German Federal Office for IT Security", "prospect", "Government", 1400, None, "https://www.bsi.bund.de", None, "Germany", "DACH", 12),
    ("ANSSI France", "prospect", "Government", 600, None, "https://www.ssi.gouv.fr", None, "France", "France & Benelux", 12),
    ("UAE Cyber Security Council", "prospect", "Government", 210, None, None, None, "UAE", "Middle East", 12),
]

COMPANIES_AMERICAS = [
    # ── Enterprise ────────────────────────────────────────────────────
    ("JPMorgan Chase", "active_client", "Enterprise", 31000, "$150B+", "https://www.jpmorganchase.com", "JPM", "United States", "US East", 0),
    ("Verizon Communications", "active_client", "Enterprise", 11700, "$137B+", "https://www.verizon.com", "VZ", "United States", "US East", 5),
    ("Lockheed Martin", "active_client", "Enterprise", 11600, "$66B+", "https://www.lockheedmartin.com", "LMT", "United States", "US East", 9),
    ("Duke Energy", "prospect", "Enterprise", 27600, "$28B+", "https://www.duke-energy.com", "DUK", "United States", "US East", 6),
    ("Microsoft Corporation", "active_client", "Enterprise", 22100, "$212B+", "https://www.microsoft.com", "MSFT", "United States", "US West", 4),
    ("Salesforce Inc.", "active_client", "Enterprise", 8000, "$34B+", "https://www.salesforce.com", "CRM", "United States", "US West", 4),
    ("Chevron Corporation", "active_client", "Enterprise", 43000, "$200B+", "https://www.chevron.com", "CVX", "United States", "US West", 7),
    ("Abbott Laboratories", "active_client", "Enterprise", 11400, "$40B+", "https://www.abbott.com", "ABT", "United States", "US Central", 2),
    ("Caterpillar Inc.", "prospect", "Enterprise", 11300, "$67B+", "https://www.caterpillar.com", "CAT", "United States", "US Central", 8),
    ("Royal Bank of Canada", "active_client", "Enterprise", 9200, "$40B+", "https://www.rbc.com", "RY", "Canada", "Canada", 0),
    ("Petrobras", "prospect", "Enterprise", 45000, "$90B+", "https://www.petrobras.com.br", "PBR", "Brazil", "Latin America", 7),
    ("Itaú Unibanco", "active_client", "Enterprise", 9600, "$30B+", "https://www.itau.com.br", "ITUB", "Brazil", "Latin America", 0),
    ("América Móvil", "prospect", "Enterprise", 18000, "$50B+", "https://www.americamovil.com", "AMX", "Mexico", "Latin America", 5),
    # ── Mid-Market ────────────────────────────────────────────────────
    ("Goldman Sachs", "prospect", "Mid_Market", 1900, "$47B+", "https://www.goldmansachs.com", "GS", "United States", "US East", 0),
    ("FedEx Corporation", "prospect", "Mid_Market", 1800, "$90B+", "https://www.fedex.com", "FDX", "United States", "US East", 14),
    ("Netflix Inc.", "prospect", "Mid_Market", 1300, "$33B+", "https://www.netflix.com", "NFLX", "United States", "US West", 11),
    ("Shopify Inc.", "prospect", "Mid_Market", 1100, "$7B+", "https://www.shopify.com", "SHOP", "Canada", "Canada", 4),
    ("Suncor Energy", "prospect", "Mid_Market", 1600, "$40B+", "https://www.suncor.com", "SU", "Canada", "Canada", 7),
    ("Nubank", "active_client", "Mid_Market", 800, "$1.5B+", "https://www.nu.com.br", "NU", "Brazil", "Latin America", 0),
    ("MercadoLibre", "prospect", "Mid_Market", 1500, "$14B+", "https://www.mercadolibre.com", "MELI", "Argentina", "Latin America", 10),
    ("Rappi", "prospect", "Mid_Market", 450, "$400M", "https://www.rappi.com", None, "Colombia", "Latin America", 4),
    ("Deere & Company", "prospect", "Mid_Market", 830, "$55B+", "https://www.deere.com", "DE", "United States", "US Central", 8),
    ("Eli Lilly and Company", "prospect", "Mid_Market", 430, "$34B+", "https://www.lilly.com", "LLY", "United States", "US Central", 3),
    ("Palantir Technologies", "active_client", "Mid_Market", 380, "$2.2B+", "https://www.palantir.com", "PLTR", "United States", "US West", 4),
    ("Datadog Inc.", "prospect", "Mid_Market", 520, "$2.1B+", "https://www.datadoghq.com", "DDOG", "United States", "US East", 4),
    ("CrowdStrike Holdings", "previous_client", "Mid_Market", 780, "$3B+", "https://www.crowdstrike.com", "CRWD", "United States", "US West", 4),
    # ── SMB ───────────────────────────────────────────────────────────
    ("Peachtree Wealth Advisors", "prospect", "SMB", 35, "$5M", None, None, "United States", "US East", 0),
    ("Chesapeake Medical Group", "active_client", "SMB", 80, "$12M", None, None, "United States", "US East", 2),
    ("Raleigh IT Services", "prospect", "SMB", 22, "$3M", None, None, "United States", "US East", 4),
    ("Savannah Law Partners", "prospect", "SMB", 18, "$4M", None, None, "United States", "US East", 15),
    ("Carolina Manufacturing Co.", "prospect", "SMB", 145, "$22M", None, None, "United States", "US East", 8),
    ("Bayview Insurance Agency", "active_client", "SMB", 12, "$2M", None, None, "United States", "US East", 1),
    ("Portland Green Energy", "prospect", "SMB", 40, "$7M", None, None, "United States", "US West", 6),
    ("Silicon Hills SaaS", "active_client", "SMB", 28, "$4M", None, None, "United States", "US West", 4),
    ("Sonoma Winery & Exports", "prospect", "SMB", 55, "$9M", None, None, "United States", "US West", 10),
    ("Cascade Dental Clinics", "prospect", "SMB", 30, "$5M", None, None, "United States", "US West", 2),
    ("Rocky Mountain Logistics", "lost", "SMB", 95, "$15M", None, None, "United States", "US West", 14),
    ("Desert Sun Accounting", "prospect", "SMB", 10, "$1.2M", None, None, "United States", "US West", 15),
    ("Great Lakes Plastics", "prospect", "SMB", 110, "$18M", None, None, "United States", "US Central", 8),
    ("Heartland Credit Union", "active_client", "SMB", 45, "$6M", None, None, "United States", "US Central", 0),
    ("Prairie Wind Farms", "prospect", "SMB", 25, "$8M", None, None, "United States", "US Central", 6),
    ("Midwest Family Practice", "prospect", "SMB", 18, "$3M", None, None, "United States", "US Central", 2),
    ("Ozark Media Productions", "prospect", "SMB", 15, "$2M", None, None, "United States", "US Central", 11),
    ("Toronto Compliance Solutions", "active_client", "SMB", 20, "$3M", None, None, "Canada", "Canada", 15),
    ("Vancouver Maritime Tech", "prospect", "SMB", 32, "$4.5M", None, None, "Canada", "Canada", 14),
    ("Montreal HealthData", "prospect", "SMB", 25, "$3M", None, None, "Canada", "Canada", 2),
    ("São Paulo EdTech", "prospect", "SMB", 40, "$4M", None, None, "Brazil", "Latin America", 13),
    ("Mexico City Cyber Lab", "active_client", "SMB", 15, "$1.5M", None, None, "Mexico", "Latin America", 4),
    ("Santiago RetailTech", "prospect", "SMB", 28, "$3M", None, None, "Chile", "Latin America", 10),
    # ── Government ────────────────────────────────────────────────────
    ("US Cyber Command (USCYBERCOM)", "active_client", "Government", 6200, None, "https://www.cybercom.mil", None, "United States", "US Federal", 12),
    ("US Department of Energy", "prospect", "Government", 14000, None, "https://www.energy.gov", None, "United States", "US Federal", 12),
    ("NASA", "prospect", "Government", 18000, None, "https://www.nasa.gov", None, "United States", "US Federal", 12),
    ("CISA", "active_client", "Government", 3100, None, "https://www.cisa.gov", None, "United States", "US Federal", 12),
    ("Canadian Centre for Cyber Security", "prospect", "Government", 750, None, "https://www.cyber.gc.ca", None, "Canada", "Canada", 12),
]


# ── Contacts ──────────────────────────────────────────────────────────
# Tuple: (company_name, first, last, title, seniority, role_in_deal, email)
# Contacts are linked to companies by name lookup after companies are seeded.

CONTACTS = [
    # APJ — Enterprise
    ("NTT Data Corporation", "Kenji", "Yamamoto", "CISO", "C_Suite", "decision_maker", "k.yamamoto@nttdata.com"),
    ("NTT Data Corporation", "Aiko", "Suzuki", "Security Architect", "Director", "champion", "a.suzuki@nttdata.com"),
    ("NTT Data Corporation", "Takeshi", "Ito", "VP Infrastructure", "VP", "influencer", "t.ito@nttdata.com"),
    ("Commonwealth Bank of Australia", "Liam", "Fletcher", "CISO", "C_Suite", "decision_maker", "l.fletcher@commbank.com.au"),
    ("Commonwealth Bank of Australia", "Mia", "Thompson", "Head of Security Ops", "Director", "champion", "m.thompson@commbank.com.au"),
    ("DBS Group Holdings", "Wei Lin", "Tan", "Group CISO", "C_Suite", "decision_maker", "wl.tan@dbs.com"),
    ("DBS Group Holdings", "Priya", "Menon", "VP Cyber Defense", "VP", "champion", "p.menon@dbs.com"),
    ("Tata Consultancy Services", "Rajesh", "Krishnan", "Global CISO", "C_Suite", "decision_maker", "r.krishnan@tcs.com"),
    ("Tata Consultancy Services", "Ananya", "Patel", "Director Security Engineering", "Director", "influencer", "a.patel@tcs.com"),
    ("Samsung Electronics", "Jae-won", "Kim", "VP Information Security", "VP", "decision_maker", "jw.kim@samsung.com"),
    ("Samsung Electronics", "Soo-jin", "Park", "Security Operations Manager", "Manager", "champion", "sj.park@samsung.com"),
    ("Mitsubishi UFJ Financial", "Hiroshi", "Nakamura", "CISO", "C_Suite", "decision_maker", "h.nakamura@mufg.jp"),
    ("HDFC Bank", "Vikram", "Sharma", "Head of IT Security", "VP", "decision_maker", "v.sharma@hdfcbank.com"),
    ("Telstra Corporation", "James", "O'Brien", "CISO", "C_Suite", "decision_maker", "j.obrien@telstra.com.au"),
    ("Infosys Limited", "Deepak", "Gupta", "VP Cybersecurity", "VP", "champion", "d.gupta@infosys.com"),
    # APJ — Mid-Market
    ("Grab Holdings", "Nurul", "Hassan", "Head of Security", "Director", "decision_maker", "n.hassan@grab.com"),
    ("Freshworks", "Arjun", "Reddy", "Director of IT", "Director", "champion", "a.reddy@freshworks.com"),
    ("Xero Limited", "Sophie", "Walker", "Security Lead", "Manager", "champion", "s.walker@xero.com"),
    # APJ — Government
    ("Australian Cyber Security Centre", "David", "Campbell", "Director Partnerships", "Director", "decision_maker", "d.campbell@cyber.gov.au"),
    ("Korea Internet & Security Agency", "Min-ho", "Lee", "Deputy Director", "Director", "influencer", "mh.lee@kisa.or.kr"),
    # EMEA — Enterprise
    ("HSBC Holdings", "Charlotte", "Evans", "Group CISO", "C_Suite", "decision_maker", "c.evans@hsbc.com"),
    ("HSBC Holdings", "Oliver", "Wright", "VP Security Architecture", "VP", "champion", "o.wright@hsbc.com"),
    ("HSBC Holdings", "Fatima", "Al-Rashid", "Director Threat Intelligence", "Director", "influencer", "f.alrashid@hsbc.com"),
    ("BAE Systems", "George", "Harrison", "CISO", "C_Suite", "decision_maker", "g.harrison@baesystems.com"),
    ("BAE Systems", "Emma", "Clarke", "Head of Cyber Programs", "Director", "champion", "e.clarke@baesystems.com"),
    ("Siemens AG", "Markus", "Weber", "Global CISO", "C_Suite", "decision_maker", "m.weber@siemens.com"),
    ("Siemens AG", "Laura", "Fischer", "VP IT Security", "VP", "influencer", "l.fischer@siemens.com"),
    ("SAP SE", "Thomas", "Muller", "CISO", "C_Suite", "decision_maker", "t.muller@sap.com"),
    ("SAP SE", "Anna", "Schneider", "Security Engineering Lead", "Manager", "champion", "a.schneider@sap.com"),
    ("Deutsche Bank", "Klaus", "Hoffman", "Group CISO", "C_Suite", "decision_maker", "k.hoffman@db.com"),
    ("Ericsson", "Erik", "Lindqvist", "VP Security", "VP", "decision_maker", "e.lindqvist@ericsson.com"),
    ("TotalEnergies SE", "Pierre", "Dubois", "CISO", "C_Suite", "decision_maker", "p.dubois@totalenergies.com"),
    ("Banco Santander", "Carlos", "Ruiz", "CISO", "C_Suite", "decision_maker", "c.ruiz@santander.com"),
    ("Banco Santander", "Maria", "Garcia", "Director Security Ops", "Director", "champion", "m.garcia@santander.com"),
    ("Saudi Aramco", "Ahmed", "Al-Fahad", "VP Cybersecurity", "VP", "decision_maker", "a.alfahad@aramco.com"),
    ("Equinor ASA", "Lars", "Henriksen", "CISO", "C_Suite", "decision_maker", "l.henriksen@equinor.com"),
    # EMEA — Mid-Market
    ("Rolls-Royce Holdings", "William", "Turner", "Head of Cyber", "Director", "decision_maker", "w.turner@rolls-royce.com"),
    ("Allianz SE", "Petra", "Braun", "IT Security Director", "Director", "decision_maker", "p.braun@allianz.com"),
    ("Nokia Corporation", "Mikko", "Virtanen", "CISO", "C_Suite", "blocker", "m.virtanen@nokia.com"),
    ("Maersk", "Henrik", "Andersen", "Head of IT Security", "Director", "champion", "h.andersen@maersk.com"),
    ("Emirates NBD", "Khalid", "Al-Mansoori", "VP Technology", "VP", "decision_maker", "k.almansoori@emiratesnbd.com"),
    ("MTN Group", "Thabo", "Molefe", "Group Security Lead", "Director", "champion", "t.molefe@mtn.com"),
    # EMEA — Government
    ("UK National Cyber Security Centre", "James", "Crawford", "Deputy Director", "Director", "decision_maker", "j.crawford@ncsc.gov.uk"),
    ("German Federal Office for IT Security", "Stefan", "Klein", "Head of Partnerships", "Director", "influencer", "s.klein@bsi.bund.de"),
    # Americas — Enterprise
    ("JPMorgan Chase", "Sarah", "Chen", "Global CISO", "C_Suite", "decision_maker", "s.chen@jpmorganchase.com"),
    ("JPMorgan Chase", "Marcus", "Webb", "VP Threat Detection", "VP", "champion", "m.webb@jpmorganchase.com"),
    ("JPMorgan Chase", "Rachel", "Torres", "Director Security Engineering", "Director", "influencer", "r.torres@jpmorganchase.com"),
    ("Verizon Communications", "David", "Park", "CISO", "C_Suite", "decision_maker", "d.park@verizon.com"),
    ("Verizon Communications", "Jennifer", "Liu", "VP Network Security", "VP", "champion", "j.liu@verizon.com"),
    ("Lockheed Martin", "Robert", "Mitchell", "VP Cybersecurity", "VP", "decision_maker", "r.mitchell@lockheedmartin.com"),
    ("Lockheed Martin", "Karen", "Davis", "Director Cyber Programs", "Director", "champion", "k.davis@lockheedmartin.com"),
    ("Microsoft Corporation", "Alex", "Rivera", "Deputy CISO", "VP", "decision_maker", "a.rivera@microsoft.com"),
    ("Microsoft Corporation", "Priya", "Sharma", "Principal Security Architect", "Director", "champion", "p.sharma@microsoft.com"),
    ("Salesforce Inc.", "Jordan", "Ellis", "VP Security", "VP", "decision_maker", "j.ellis@salesforce.com"),
    ("Chevron Corporation", "Michael", "Brooks", "CISO", "C_Suite", "decision_maker", "m.brooks@chevron.com"),
    ("Abbott Laboratories", "Lisa", "Nguyen", "Director IT Security", "Director", "decision_maker", "l.nguyen@abbott.com"),
    ("Royal Bank of Canada", "Patrick", "O'Connor", "CISO", "C_Suite", "decision_maker", "p.oconnor@rbc.com"),
    ("Royal Bank of Canada", "Sophie", "Laurent", "VP Security Operations", "VP", "champion", "s.laurent@rbc.com"),
    ("Itaú Unibanco", "Fernando", "Costa", "CISO", "C_Suite", "decision_maker", "f.costa@itau.com.br"),
    ("Petrobras", "Ricardo", "Oliveira", "Head of Cybersecurity", "Director", "decision_maker", "r.oliveira@petrobras.com.br"),
    ("Duke Energy", "Amanda", "Foster", "CISO", "C_Suite", "decision_maker", "a.foster@duke-energy.com"),
    ("Caterpillar Inc.", "Brian", "Kowalski", "VP IT Security", "VP", "blocker", "b.kowalski@caterpillar.com"),
    ("América Móvil", "Diego", "Hernandez", "Director Cybersecurity", "Director", "decision_maker", "d.hernandez@americamovil.com"),
    # Americas — Mid-Market
    ("Goldman Sachs", "Nathan", "Price", "VP Information Security", "VP", "decision_maker", "n.price@goldmansachs.com"),
    ("Palantir Technologies", "Emily", "Chang", "Head of Security", "Director", "champion", "e.chang@palantir.com"),
    ("Shopify Inc.", "Kenji", "Tanaka", "Security Lead", "Manager", "champion", "k.tanaka@shopify.com"),
    ("Nubank", "Camila", "Santos", "CISO", "C_Suite", "decision_maker", "c.santos@nu.com.br"),
    ("Datadog Inc.", "Ryan", "Murphy", "Director Security", "Director", "influencer", "r.murphy@datadoghq.com"),
    ("CrowdStrike Holdings", "Derek", "Hunt", "VP Engineering", "VP", "blocker", "d.hunt@crowdstrike.com"),
    # Americas — Government
    ("US Cyber Command (USCYBERCOM)", "Col. James", "Patterson", "Cyber Operations Director", "Director", "decision_maker", "j.patterson@cybercom.mil"),
    ("CISA", "Elena", "Voss", "Deputy Director Partnerships", "Director", "champion", "e.voss@cisa.gov"),
    ("NASA", "Dr. Raymond", "Lee", "Chief Information Security Officer", "C_Suite", "decision_maker", "r.lee@nasa.gov"),
]


# ── Product Categories & Products ────────────────────────────────────

PRODUCT_CATEGORIES = [
    {
        "name": "Endpoint Security",
        "products": [
            {"name": "EDR Platform", "base_price": 45000, "pricing_model": "per_seat"},
            {"name": "XDR Extended Detection", "base_price": 72000, "pricing_model": "per_seat"},
        ],
    },
    {
        "name": "Network Security",
        "products": [
            {"name": "Managed SIEM", "base_price": 120000, "pricing_model": "flat"},
            {"name": "Firewall Management", "base_price": 36000, "pricing_model": "per_site"},
        ],
    },
    {
        "name": "Offensive Security",
        "products": [
            {"name": "Penetration Testing", "base_price": 28000, "pricing_model": "custom"},
            {"name": "Red Team Assessment", "base_price": 85000, "pricing_model": "custom"},
        ],
    },
    {
        "name": "Compliance & GRC",
        "products": [
            {"name": "Compliance Audit", "base_price": 55000, "pricing_model": "flat"},
            {"name": "vCISO Service", "base_price": 96000, "pricing_model": "flat"},
        ],
    },
    {
        "name": "Cloud & Managed Detection",
        "products": [
            {"name": "SOC-as-a-Service", "base_price": 198000, "pricing_model": "flat"},
            {"name": "Cloud Workload Protection", "base_price": 92000, "pricing_model": "per_seat"},
            {"name": "Threat Intelligence Feed", "base_price": 48000, "pricing_model": "flat"},
            {"name": "Incident Response Retainer", "base_price": 125000, "pricing_model": "custom"},
        ],
    },
]

# ── Sample Contracts ─────────────────────────────────────────────────
# Tuple: (company_name, type, status, days_until_end, duration_days, total_value, renewal_notice_days)
# Contract end = today + days_until_end; start = end - duration_days.
# Use days_until_end between ~5 and ~88 for active renewal-radar showcase.

CONTRACTS = [
    # Urgent / soon (Command Center renewal radar)
    ("Royal Bank of Canada", "our_contract", "active", 5, 380, 412000, 90),
    ("Verizon Communications", "our_contract", "active", 9, 340, 168000, 30),
    ("Goldman Sachs", "our_contract", "active", 11, 365, 295000, 60),
    ("Nairobi Cloud Services", "our_contract", "active", 14, 300, 88000, 45),
    ("DBS Group Holdings", "our_contract", "active", 17, 420, 356000, 60),
    ("JPMorgan Chase", "our_contract", "active", 19, 400, 1280000, 90),
    ("Peachtree Wealth Advisors", "our_contract", "active", 21, 290, 112000, 30),
    ("HSBC Holdings", "our_contract", "active", 24, 410, 302000, 60),
    ("Abbott Laboratories", "our_contract", "active", 26, 365, 445000, 90),
    ("NTT Data Corporation", "our_contract", "active", 29, 520, 687000, 90),
    ("Siemens AG", "our_contract", "active", 33, 730, 640000, 90),
    ("SAP SE", "our_contract", "active", 36, 400, 515000, 60),
    ("Shopify Inc.", "our_contract", "active", 39, 350, 198000, 60),
    ("Samsung Electronics", "our_contract", "active", 42, 365, 223000, 60),
    ("Equinor ASA", "our_contract", "active", 45, 380, 328000, 90),
    ("Banco Santander", "competitor_contract", "active", 47, 360, 890000, None),
    ("Tata Consultancy Services", "our_contract", "active", 51, 400, 189000, 60),
    ("Itaú Unibanco", "our_contract", "active", 54, 370, 267000, 60),
    ("Saudi Aramco", "competitor_contract", "active", 56, 540, 1200000, None),
    ("Lockheed Martin", "our_contract", "active", 59, 730, 548000, 90),
    ("BAE Systems", "our_contract", "active", 62, 400, 412000, 90),
    ("Palantir Technologies", "our_contract", "active", 64, 320, 176000, 45),
    ("Ericsson", "competitor_contract", "active", 66, 400, 702000, None),
    ("Commonwealth Bank of Australia", "our_contract", "active", 69, 450, 501000, 90),
    ("Telstra Corporation", "our_contract", "active", 72, 380, 334000, 60),
    ("Bristol Cyber Consulting", "our_contract", "active", 75, 280, 96000, 30),
    ("Chevron Corporation", "competitor_contract", "active", 77, 500, 910000, None),
    ("TotalEnergies SE", "competitor_contract", "active", 80, 620, 1050000, None),
    ("Petrobras", "competitor_contract", "active", 83, 330, 410000, None),
    ("Deutsche Bank", "competitor_contract", "active", 86, 400, 378000, None),
    ("Microsoft Corporation", "competitor_contract", "active", 12, 540, 920000, None),
    ("Duke Energy", "competitor_contract", "active", 28, 350, 205000, None),
    ("Netflix Inc.", "our_contract", "active", 210, 400, 142000, 60),
    # Pipeline / other statuses (not on renewal radar strip)
    ("Salesforce Inc.", "our_contract", "pending", 120, 365, 220000, 60),
    ("Datadog Inc.", "our_contract", "pending", 200, 365, 188000, 45),
    ("Nubank", "our_contract", "pending", 90, 365, 134000, 60),
    ("Banco Santander", "our_contract", "expired", -40, 365, 95000, 60),
    ("Petrobras", "competitor_contract", "expired", -20, 400, 280000, None),
]

# ── Contract line items ──────────────────────────────────────────────
# Tuple: (company_name, contract_index, product_name, quantity, unit_price)
# contract_index is 0-based order of contracts for that company in CONTRACTS.

CONTRACT_LINE_ITEMS = [
    ("JPMorgan Chase", 0, "Managed SIEM", 1, 520000),
    ("JPMorgan Chase", 0, "EDR Platform", 4, 62000),
    ("JPMorgan Chase", 0, "SOC-as-a-Service", 1, 198000),
    ("JPMorgan Chase", 0, "Threat Intelligence Feed", 1, 48000),
    ("HSBC Holdings", 0, "XDR Extended Detection", 2, 78000),
    ("HSBC Holdings", 0, "Penetration Testing", 1, 32000),
    ("HSBC Holdings", 0, "Compliance Audit", 1, 55000),
    ("Verizon Communications", 0, "EDR Platform", 3, 48000),
    ("Verizon Communications", 0, "Firewall Management", 2, 42000),
    ("Verizon Communications", 0, "Incident Response Retainer", 1, 125000),
    ("Royal Bank of Canada", 0, "Managed SIEM", 1, 168000),
    ("Royal Bank of Canada", 0, "vCISO Service", 1, 96000),
    ("Royal Bank of Canada", 0, "Cloud Workload Protection", 2, 88000),
    ("Siemens AG", 0, "Managed SIEM", 1, 195000),
    ("Siemens AG", 0, "Red Team Assessment", 1, 85000),
    ("Siemens AG", 0, "EDR Platform", 4, 52000),
    ("Siemens AG", 0, "Compliance Audit", 1, 55000),
    ("Siemens AG", 0, "SOC-as-a-Service", 1, 198000),
    ("Lockheed Martin", 0, "Red Team Assessment", 2, 102000),
    ("Lockheed Martin", 0, "Managed SIEM", 1, 210000),
    ("Lockheed Martin", 0, "Penetration Testing", 1, 28000),
    ("Equinor ASA", 0, "Managed SIEM", 1, 155000),
    ("Equinor ASA", 0, "EDR Platform", 2, 46000),
    ("Equinor ASA", 0, "Threat Intelligence Feed", 1, 48000),
    ("Tata Consultancy Services", 0, "XDR Extended Detection", 1, 72000),
    ("Tata Consultancy Services", 0, "Cloud Workload Protection", 3, 88000),
    ("Samsung Electronics", 0, "EDR Platform", 5, 47000),
    ("Samsung Electronics", 0, "Managed SIEM", 1, 142000),
    ("Microsoft Corporation", 0, "XDR Extended Detection", 4, 72000),
    ("Microsoft Corporation", 0, "Firewall Management", 1, 36000),
    ("Deutsche Bank", 0, "Managed SIEM", 1, 178000),
    ("Deutsche Bank", 0, "Compliance Audit", 1, 55000),
    ("Duke Energy", 0, "EDR Platform", 2, 45000),
    ("Duke Energy", 0, "Penetration Testing", 2, 28000),
    ("Petrobras", 0, "Firewall Management", 3, 36000),
    ("Petrobras", 0, "EDR Platform", 2, 45000),
    ("Banco Santander", 0, "XDR Extended Detection", 2, 72000),
    ("Banco Santander", 0, "Managed SIEM", 1, 246000),
    ("Saudi Aramco", 0, "Managed SIEM", 1, 420000),
    ("Saudi Aramco", 0, "Firewall Management", 4, 36000),
    ("Saudi Aramco", 0, "Incident Response Retainer", 1, 125000),
    ("Commonwealth Bank of Australia", 0, "SOC-as-a-Service", 1, 198000),
    ("Commonwealth Bank of Australia", 0, "EDR Platform", 6, 52000),
    ("Commonwealth Bank of Australia", 0, "vCISO Service", 1, 96000),
    ("Telstra Corporation", 0, "Managed SIEM", 1, 142000),
    ("Telstra Corporation", 0, "Cloud Workload Protection", 2, 88000),
    ("Goldman Sachs", 0, "XDR Extended Detection", 1, 72000),
    ("Goldman Sachs", 0, "Penetration Testing", 1, 28000),
    ("Goldman Sachs", 0, "Compliance Audit", 1, 55000),
    ("SAP SE", 0, "EDR Platform", 5, 50000),
    ("SAP SE", 0, "Managed SIEM", 1, 165000),
    ("SAP SE", 0, "Red Team Assessment", 1, 85000),
    ("Abbott Laboratories", 0, "Compliance Audit", 1, 55000),
    ("Abbott Laboratories", 0, "EDR Platform", 2, 45000),
    ("Itaú Unibanco", 0, "Managed SIEM", 1, 132000),
    ("Itaú Unibanco", 0, "SOC-as-a-Service", 1, 198000),
    ("Palantir Technologies", 0, "Penetration Testing", 1, 28000),
    ("Palantir Technologies", 0, "Red Team Assessment", 1, 85000),
    ("Ericsson", 0, "Managed SIEM", 1, 312000),
    ("Ericsson", 0, "Threat Intelligence Feed", 1, 48000),
    ("Chevron Corporation", 0, "Firewall Management", 5, 36000),
    ("Chevron Corporation", 0, "EDR Platform", 4, 45000),
    ("TotalEnergies SE", 0, "Managed SIEM", 1, 380000),
    ("TotalEnergies SE", 0, "XDR Extended Detection", 2, 72000),
    ("TotalEnergies SE", 0, "Compliance Audit", 1, 55000),
    ("BAE Systems", 0, "Red Team Assessment", 1, 85000),
    ("BAE Systems", 0, "Managed SIEM", 1, 198000),
    ("BAE Systems", 0, "Incident Response Retainer", 1, 125000),
    ("NTT Data Corporation", 0, "Cloud Workload Protection", 4, 88000),
    ("NTT Data Corporation", 0, "SOC-as-a-Service", 1, 198000),
    ("NTT Data Corporation", 0, "EDR Platform", 3, 50000),
    ("Shopify Inc.", 0, "EDR Platform", 2, 45000),
    ("Shopify Inc.", 0, "Penetration Testing", 1, 28000),
    ("DBS Group Holdings", 0, "Managed SIEM", 1, 156000),
    ("DBS Group Holdings", 0, "vCISO Service", 1, 96000),
    ("Peachtree Wealth Advisors", 0, "EDR Platform", 1, 45000),
    ("Peachtree Wealth Advisors", 0, "Compliance Audit", 1, 55000),
    ("Nairobi Cloud Services", 0, "Firewall Management", 1, 36000),
    ("Nairobi Cloud Services", 0, "Penetration Testing", 1, 28000),
    ("Bristol Cyber Consulting", 0, "vCISO Service", 1, 96000),
    ("Bristol Cyber Consulting", 0, "Threat Intelligence Feed", 1, 48000),
    ("Salesforce Inc.", 0, "XDR Extended Detection", 2, 72000),
    ("Salesforce Inc.", 0, "Managed SIEM", 1, 76000),
    ("Datadog Inc.", 0, "Cloud Workload Protection", 2, 88000),
    ("Datadog Inc.", 0, "EDR Platform", 1, 45000),
    ("Nubank", 0, "EDR Platform", 2, 45000),
    ("Nubank", 0, "Compliance Audit", 1, 55000),
    ("Netflix Inc.", 0, "Managed SIEM", 1, 98000),
    ("Netflix Inc.", 0, "SOC-as-a-Service", 1, 198000),
]

# ── Competitors ──────────────────────────────────────────────────────

COMPETITORS = [
    {
        "name": "CrowdStrike",
        "website": "https://www.crowdstrike.com",
        "strengths": [
            "Market leader in EDR",
            "Strong brand recognition",
            "FedRAMP authorized",
        ],
        "weaknesses": [
            "18% price hike alienating mid-market",
            "High cost of ownership",
        ],
    },
    {
        "name": "Palo Alto Networks",
        "website": "https://www.paloaltonetworks.com",
        "strengths": [
            "Comprehensive platform (NGFW + Cortex XDR)",
            "Large install base",
        ],
        "weaknesses": [
            "Critical PAN-OS CVEs in 2026",
            "Complex licensing model",
        ],
    },
    {
        "name": "SentinelOne",
        "website": "https://www.sentinelone.com",
        "strengths": [
            "Autonomous AI-driven response",
            "Competitive pricing",
        ],
        "weaknesses": [
            "Lost FedRAMP auth for Singularity XDR",
            "Limited enterprise references",
        ],
    },
    {
        "name": "Fortinet",
        "website": "https://www.fortinet.com",
        "strengths": [
            "Strong SMB/mid-market presence",
            "Integrated Security Fabric",
        ],
        "weaknesses": [
            "SIEM acquisition causing integration friction",
            "Weaker cloud-native story",
        ],
    },
    {
        "name": "Cisco",
        "website": "https://www.cisco.com",
        "strengths": [
            "Massive networking install base",
            "SecureX platform consolidation",
        ],
        "weaknesses": [
            "AMP EOL forcing migrations",
            "Slow to innovate in XDR space",
        ],
    },
    {
        "name": "Trend Micro",
        "website": "https://www.trendmicro.com",
        "strengths": [
            "Deep email/server security roots",
            "Vision One platform",
        ],
        "weaknesses": [
            "Losing cloud-native market share",
            "Declining mindshare with CISOs",
        ],
    },
]

# ── Competitor Intel Records ─────────────────────────────────────────
# Tuple: (company_name, competitor_name, product_name, contract_end_offset_days, confidence)
# contract_end_offset_days is relative to today (positive = future).

COMPETITOR_INTEL = [
    ("Microsoft Corporation", "CrowdStrike", "Falcon XDR", 180, "confirmed"),
    ("Deutsche Bank", "Palo Alto Networks", "Cortex XDR", 120, "confirmed"),
    ("Samsung Electronics", "SentinelOne", "Singularity XDR", 240, "confirmed"),
    ("Petrobras", "Fortinet", "FortiEDR", -30, "confirmed"),
    ("Duke Energy", "Cisco", "SecureX", 90, "confirmed"),
    ("HSBC Holdings", "CrowdStrike", "Falcon Complete", 150, "rumor"),
    ("Mitsubishi UFJ Financial", "Trend Micro", "Vision One", 300, "inferred"),
    ("Saudi Aramco", "Fortinet", "FortiGate NGFW", 85, "confirmed"),
    ("Banco Santander", "Palo Alto Networks", "Prisma Cloud", 200, "rumor"),
    ("Royal Bank of Canada", "CrowdStrike", "Falcon Insight", 60, "inferred"),
    ("Lockheed Martin", "CrowdStrike", "Falcon Platform", 365, "confirmed"),
    ("Tata Consultancy Services", "Trend Micro", "Apex One", 140, "rumor"),
    ("JPMorgan Chase", "Palo Alto Networks", "Cortex XSOAR", 270, "inferred"),
    ("Verizon Communications", "Cisco", "Umbrella DNS Security", 110, "confirmed"),
    ("Siemens AG", "Fortinet", "FortiSIEM", 190, "rumor"),
    ("Chevron Corporation", "Palo Alto Networks", "Cortex XDR", 72, "confirmed"),
    ("TotalEnergies SE", "Fortinet", "FortiGate NGFW", 78, "confirmed"),
    ("Ericsson", "CrowdStrike", "Falcon Complete", 64, "inferred"),
    ("SAP SE", "SentinelOne", "Singularity XDR", 38, "rumor"),
    ("Goldman Sachs", "CrowdStrike", "Falcon Insight", 14, "confirmed"),
    ("Commonwealth Bank of Australia", "Trend Micro", "Vision One", 68, "confirmed"),
    ("Telstra Corporation", "Cisco", "Umbrella DNS Security", 70, "inferred"),
    ("Netflix Inc.", "SentinelOne", "Singularity XDR", 200, "rumor"),
]

# ── Pipeline Stages ──────────────────────────────────────────────────
# Ordered by probability (low → high) to mirror the sales funnel.

STAGES = [
    {"name": "Intelligence Gathering", "probability": 5},
    {"name": "Vulnerability Identified", "probability": 15},
    {"name": "Initial Infiltration", "probability": 30},
    {"name": "Proof of Concept", "probability": 50},
    {"name": "Final Assault", "probability": 75},
    {"name": "Extraction", "probability": 95},
]

# ── Sample Engagements ───────────────────────────────────────────────
# Tuple: (company_name, stage_name, type, outcome, days_ago)
# days_ago controls how far back created_at is set.

ENGAGEMENTS = [
    ("HSBC Holdings", "Intelligence Gathering", "call", "Identified upcoming renewal — CrowdStrike contract ends Q3", 1),
    ("Deutsche Bank", "Intelligence Gathering", "email", "Sent intro deck to CISO office", 4),
    ("Mitsubishi UFJ Financial", "Intelligence Gathering", "meeting", "Met at RSA conference, discussed pain points", 0),
    ("Saudi Aramco", "Vulnerability Identified", "call", "Confirmed Fortinet renewal in 90 days — budget approved", 6),
    ("Petrobras", "Vulnerability Identified", "email", "Competitor contract ending, decision-maker interested", 3),
    ("Duke Energy", "Vulnerability Identified", "meeting", "Security assessment revealed gaps in current stack", 8),
    ("JPMorgan Chase", "Initial Infiltration", "meeting", "First meeting with CISO — positive reception", 11),
    ("Microsoft Corporation", "Initial Infiltration", "demo", "Showed XDR platform to security team", 5),
    ("Verizon Communications", "Initial Infiltration", "call", "Technical deep-dive with VP Network Security", 9),
    ("Samsung Electronics", "Proof of Concept", "demo", "POC deployed in test environment — 2 week eval", 15),
    ("Tata Consultancy Services", "Proof of Concept", "meeting", "Executive sponsor aligned, legal reviewing terms", 13),
    ("Salesforce Inc.", "Final Assault", "meeting", "Proposal submitted — awaiting procurement review", 19),
    ("Lockheed Martin", "Final Assault", "call", "Final pricing negotiation, verbal commitment received", 17),
    ("Royal Bank of Canada", "Extraction", "meeting", "Contract signed — onboarding kickoff scheduled", 21),
    ("Itaú Unibanco", "Extraction", "call", "Competitor displaced — migration plan in progress", 7),
    ("Goldman Sachs", "Intelligence Gathering", "email", "Mapped buying committee — CFO wants ROI model by Friday", 2),
    ("SAP SE", "Vulnerability Identified", "call", "Legacy AV renewal flagged as budget line item to displace", 10),
    ("BAE Systems", "Initial Infiltration", "demo", "Live MDR demo with SOC lead — strong technical fit", 12),
    ("Equinor ASA", "Proof of Concept", "meeting", "Scope narrowed to offshore OT segment — legal engaged", 14),
    ("Chevron Corporation", "Intelligence Gathering", "meeting", "CISO workshop on supply-chain ransomware scenarios", 18),
    ("TotalEnergies SE", "Vulnerability Identified", "email", "Shared benchmark vs Fortinet renewal pricing", 16),
    ("Ericsson", "Initial Infiltration", "call", "Architecture review scheduled with Nordic security guild", 20),
    ("Commonwealth Bank of Australia", "Proof of Concept", "demo", "Purple-team exercise booked for next sprint", 22),
    ("Telstra Corporation", "Final Assault", "meeting", "Security steering committee vote expected Thursday", 24),
    ("NTT Data Corporation", "Intelligence Gathering", "call", "Zero Trust initiative kickoff — we are shortlisted", 6),
    ("DBS Group Holdings", "Vulnerability Identified", "email", "Champion wants side-by-side EDR bake-off matrix", 9),
    ("Shopify Inc.", "Initial Infiltration", "meeting", "Developer security champions program — entry wedge", 11),
    ("Palantir Technologies", "Proof of Concept", "demo", "FedRAMP-adjacent controls pack under review", 13),
    ("Abbott Laboratories", "Intelligence Gathering", "email", "HIPAA-aligned logging gaps documented in QBR", 15),
    ("Nubank", "Final Assault", "call", "Procurement asked for 3-year TCO with FX hedging", 17),
    ("Datadog Inc.", "Vulnerability Identified", "meeting", "Observability team pushing back on agent overlap", 19),
    ("Netflix Inc.", "Initial Infiltration", "demo", "Streaming edge PoP security review — follow-up actions", 23),
    ("Banco Santander", "Intelligence Gathering", "call", "Lost internal battle to status quo — revisit Q4", 25),
    ("Caterpillar Inc.", "Vulnerability Identified", "email", "Plant floor segmentation study — sponsor went silent", 26),
    ("Peachtree Wealth Advisors", "Proof of Concept", "meeting", "SMB bundle: EDR + vCISO lite — verbal yes", 27),
    ("Bristol Cyber Consulting", "Extraction", "call", "MSA signed — won 24-month MDR stack", 28),
    ("Nairobi Cloud Services", "Initial Infiltration", "demo", "East Africa reseller wants co-branded SOC story", 29),
    ("Siemens AG", "Final Assault", "meeting", "German works council review — paperwork slow", 30),
    ("Infosys Limited", "Intelligence Gathering", "email", "Global delivery centers — centralized RFP incoming", 31),
    ("Freshworks", "Vulnerability Identified", "call", "Competitor displaced in APAC mid-market pilot", 32),
    ("NASA", "Initial Infiltration", "meeting", "Federal segment briefing — compliance checklist shared", 33),
    ("CISA", "Proof of Concept", "demo", "Tabletop exercise sponsorship — logo approval pending", 34),
    ("UK National Cyber Security Centre", "Intelligence Gathering", "meeting", "Partnership channel — joint webinar proposed", 35),
    ("Australian Cyber Security Centre", "Vulnerability Identified", "email", "Threat intel sharing MOU draft circulated", 36),
    ("Rakuten Group", "Intelligence Gathering", "call", "Lost to incumbent on price — lessons learned captured", 37),
    ("CrowdStrike Holdings", "Initial Infiltration", "email", "Partner overlap discussion — neutral stance", 38),
    ("Maersk", "Proof of Concept", "meeting", "Maritime logistics IR retainer scoped", 39),
    ("Emirates NBD", "Final Assault", "call", "Regional CISO council endorsement — final signatures", 40),
    ("Toronto Compliance Solutions", "Extraction", "meeting", "Contract signed — kickoff next week", 41),
    ("Mexico City Cyber Lab", "Vulnerability Identified", "demo", "LATAM MSSP referral — warm intro made", 42),
    ("Heartland Credit Union", "Intelligence Gathering", "email", "NCUA exam prep — priority uplift opportunity", 43),
    ("Silicon Hills SaaS", "Initial Infiltration", "call", "Series B startup — fast-track security roadmap", 44),
    ("Xero Limited", "Proof of Concept", "meeting", "ANZ accounting platform — integration tests green", 45),
    ("Canva Pty Ltd", "Intelligence Gathering", "demo", "Design-collab DLP requirements workshop", 46),
]


async def seed():
    db = Prisma()
    await db.connect()

    print("Clearing existing data…")
    await db.companyterritory.delete_many()
    await db.companyindustry.delete_many()
    await db.engagement.delete_many()
    await db.engagementstage.delete_many()
    await db.competitorintel.delete_many()
    await db.competitor.delete_many()
    await db.contractlineitem.delete_many()
    await db.contract.delete_many()
    await db.productservice.delete_many()
    await db.productcategory.delete_many()
    await db.contact.delete_many()
    await db.companyassignment.delete_many()
    await db.companyname.delete_many()
    await db.companysite.delete_many()
    await db.company.delete_many()
    await db.territorymember.delete_many()
    await db.teammember.delete_many()
    await db.territorysegment.delete_many()
    await db.territory.delete_many()
    await db.segmentlabel.delete_many()
    await db.region.delete_many()
    await db.industry.delete_many()

    # ── Regions ───────────────────────────────────────────────────────
    print("Seeding regions…")
    region_map: dict[str, str] = {}

    for r in REGIONS:
        region = await db.region.create(data={"name": r["name"], "code": r["code"]})
        region_map[r["code"]] = region.id

    # ── Segment Labels & Territories ──────────────────────────────────
    print("Seeding segment labels & territories…")

    SEGMENT_LABELS = [
        {"name": "commercial", "short_description": "Commercial accounts"},
        {"name": "enterprise", "short_description": "Enterprise accounts"},
        {"name": "public_sector", "short_description": "Government and public sector"},
        {"name": "mid_market", "short_description": "Mid-market accounts"},
        {"name": "channel", "short_description": "Channel and partner accounts"},
    ]

    segment_map: dict[str, str] = {}
    for sl in SEGMENT_LABELS:
        label = await db.segmentlabel.create(
            data={"name": sl["name"], "shortDescription": sl["short_description"]}
        )
        segment_map[sl["name"]] = label.id

    sample_path = Path(__file__).resolve().parent.parent / "territories" / "sample_territories.json"
    with open(sample_path) as f:
        sample_territories = json.load(f)

    level_map = {"level_0": 0, "level_1": 1, "level_2": 2}
    territory_map: dict[str, str] = {}

    for t in sample_territories:
        level_val = level_map.get(t["level"], 0)
        territory = await db.territory.create(
            data={
                "name": t["name"],
                "level": level_val,
                "color": t["color"],
                "regionId": t["region_id"],
                "subregionId": t["subregion_id"],
                "gid0": t.get("gid_0"),
                "gid1": t.get("gid_1"),
                "children": Json(t.get("children", [])),
            }
        )
        territory_map[t["name"]] = territory.id

        for seg_name in t.get("segment_labels", []):
            seg_id = segment_map.get(seg_name)
            if seg_id:
                await db.territorysegment.create(
                    data={"territoryId": territory.id, "segmentLabelId": seg_id}
                )

    print(f"Seeded {len(SEGMENT_LABELS)} segment labels, {len(sample_territories)} territories.")

    # ── Team Members ───────────────────────────────────────────────────
    print("Seeding team members…")

    TEAM_MEMBERS = [
        {"first_name": "Sarah", "last_name": "Chen", "role": "leadership", "position": "VP of Sales, APJ", "email": "sarah.chen@cybersip.io"},
        {"first_name": "Marcus", "last_name": "Rodriguez", "role": "leadership", "position": "Regional Director, Americas", "email": "marcus.rodriguez@cybersip.io"},
        {"first_name": "Elena", "last_name": "Petrov", "role": "leadership", "position": "Regional Director, EMEA", "email": "elena.petrov@cybersip.io"},
        {"first_name": "James", "last_name": "Nakamura", "role": "sales_team", "position": "Senior Account Executive", "email": "james.nakamura@cybersip.io", "phone_number": "+81901234567"},
        {"first_name": "Priya", "last_name": "Sharma", "role": "sales_team", "position": "Account Executive", "email": "priya.sharma@cybersip.io", "phone_number": "+919876543210"},
        {"first_name": "David", "last_name": "Kim", "role": "sales_team", "position": "Account Executive", "email": "david.kim@cybersip.io"},
        {"first_name": "Ana", "middle_name": "Maria", "last_name": "Santos", "role": "sales_team", "position": "Senior Account Executive", "email": "ana.santos@cybersip.io", "phone_number": "+5511987654321"},
        {"first_name": "Michael", "last_name": "O'Brien", "role": "sales_team", "position": "Account Executive", "email": "michael.obrien@cybersip.io"},
        {"first_name": "Fatima", "last_name": "Al-Hassan", "role": "sales_team", "position": "Account Executive", "email": "fatima.alhassan@cybersip.io", "phone_number": "+971501234567"},
        {"first_name": "Lucas", "last_name": "Weber", "role": "sales_team", "position": "Account Executive", "email": "lucas.weber@cybersip.io"},
    ]

    member_map: dict[str, str] = {}
    for m in TEAM_MEMBERS:
        member = await db.teammember.create(
            data={
                "firstName": m["first_name"],
                "middleName": m.get("middle_name"),
                "lastName": m["last_name"],
                "role": m["role"],
                "position": m["position"],
                "email": m["email"],
                "phoneNumber": m.get("phone_number"),
            }
        )
        member_map[m["email"]] = member.id

    TERRITORY_ASSIGNMENTS = [
        ("sarah.chen@cybersip.io", "APJ - Southeast Asia"),
        ("sarah.chen@cybersip.io", "APJ - East Asia"),
        ("james.nakamura@cybersip.io", "APJ - East Asia"),
        ("priya.sharma@cybersip.io", "APJ - South Asia"),
        ("priya.sharma@cybersip.io", "APJ - Southeast Asia"),
        ("david.kim@cybersip.io", "APJ - Oceania"),
        ("marcus.rodriguez@cybersip.io", "Americas - North America"),
        ("michael.obrien@cybersip.io", "Americas - North America"),
        ("ana.santos@cybersip.io", "Americas - South America"),
        ("elena.petrov@cybersip.io", "EMEA - Western Europe"),
        ("fatima.alhassan@cybersip.io", "EMEA - Middle East"),
        ("lucas.weber@cybersip.io", "EMEA - Western Europe"),
    ]

    assigned_count = 0
    for email, territory_name in TERRITORY_ASSIGNMENTS:
        mid = member_map.get(email)
        tid = territory_map.get(territory_name)
        if mid and tid:
            await db.territorymember.create(
                data={"teamMemberId": mid, "territoryId": tid}
            )
            assigned_count += 1

    print(f"Seeded {len(TEAM_MEMBERS)} team members, {assigned_count} territory assignments.")

    # ── Industries ────────────────────────────────────────────────────
    print("Seeding industries…")
    industry_ids: list[str] = []
    for ind in INDUSTRIES:
        created = await db.industry.create(data={"name": ind["name"], "sector": ind["sector"]})
        industry_ids.append(created.id)

    # ── Companies ─────────────────────────────────────────────────────
    print("Seeding companies…")
    all_companies = (
        [(c, "APJ") for c in COMPANIES_APJ]
        + [(c, "EMEA") for c in COMPANIES_EMEA]
        + [(c, "Americas") for c in COMPANIES_AMERICAS]
    )

    for entry, _region_code in all_companies:
        name, status, size, employees, revenue, website, ticker, country, territory, ind_idx = entry

        company = await db.company.create(
            data={
                "currentName": name,
                "status": status,
                "companySize": size,
                "employeeCount": employees,
                "revenueRange": revenue,
                "website": website,
                "stockTicker": ticker,
                "country": country,
            }
        )

        # Link primary industry
        if 0 <= ind_idx < len(industry_ids):
            await db.companyindustry.create(
                data={
                    "companyId": company.id,
                    "industryId": industry_ids[ind_idx],
                    "isPrimary": True,
                }
            )

        # ~40 % chance of a secondary industry
        if random.random() < 0.4:
            secondary = random.choice([i for i in range(len(industry_ids)) if i != ind_idx])
            await db.companyindustry.create(
                data={
                    "companyId": company.id,
                    "industryId": industry_ids[secondary],
                    "isPrimary": False,
                }
            )

    print(f"Seeded {len(all_companies)} companies across 3 regions.")

    # ── Contacts ───────────────────────────────────────────────────────
    print("Seeding contacts…")
    company_id_map: dict[str, str] = {}
    all_db_companies = await db.company.find_many()
    for c in all_db_companies:
        company_id_map[c.currentName] = c.id

    contact_count = 0
    for company_name, first, last, title, seniority, role, email in CONTACTS:
        cid = company_id_map.get(company_name)
        if not cid:
            print(f"  ⚠ Company not found for contact: {first} {last} → {company_name}")
            continue
        await db.contact.create(
            data={
                "companyId": cid,
                "firstName": first,
                "lastName": last,
                "title": title,
                "seniority": seniority,
                "roleInDeal": role,
                "email": email,
                "isActive": True,
            }
        )
        contact_count += 1

    print(f"Seeded {contact_count} contacts.")

    # ── Pipeline Stages ────────────────────────────────────────────────
    print("Seeding pipeline stages…")
    stage_id_map: dict[str, str] = {}
    for s in STAGES:
        stage = await db.engagementstage.create(
            data={"name": s["name"], "probability": s["probability"]}
        )
        stage_id_map[s["name"]] = stage.id

    print(f"Seeded {len(STAGES)} pipeline stages.")

    # ── Engagements ────────────────────────────────────────────────────
    print("Seeding engagements…")
    engagement_count = 0
    for company_name, stage_name, eng_type, outcome, days_ago in ENGAGEMENTS:
        cid = company_id_map.get(company_name)
        sid = stage_id_map.get(stage_name)
        if not cid or not sid:
            print(f"  ⚠ Skipping engagement: {company_name} / {stage_name}")
            continue

        created = datetime.now(timezone.utc) - timedelta(days=days_ago)
        next_action = created + timedelta(days=random.randint(3, 14))

        await db.engagement.create(
            data={
                "companyId": cid,
                "stageId": sid,
                "type": eng_type,
                "outcome": outcome,
                "nextActionDate": next_action,
                "createdAt": created,
            }
        )
        engagement_count += 1

    print(f"Seeded {engagement_count} engagements.")

    # ── Product Categories & Products ──────────────────────────────────
    print("Seeding product categories & products…")
    product_id_map: dict[str, str] = {}
    for cat in PRODUCT_CATEGORIES:
        category = await db.productcategory.create(data={"name": cat["name"]})
        for prod in cat["products"]:
            p = await db.productservice.create(
                data={
                    "categoryId": category.id,
                    "name": prod["name"],
                    "basePrice": prod["base_price"],
                    "pricingModel": prod["pricing_model"],
                }
            )
            product_id_map[prod["name"]] = p.id

    product_count = sum(len(c["products"]) for c in PRODUCT_CATEGORIES)
    print(f"Seeded {len(PRODUCT_CATEGORIES)} categories, {product_count} products.")

    # ── Contracts ──────────────────────────────────────────────────────
    print("Seeding contracts…")
    contract_ids_by_company: dict[str, list[str]] = defaultdict(list)
    contract_count = 0
    for company_name, ctype, cstatus, days_until_end, duration, value, renewal in CONTRACTS:
        cid = company_id_map.get(company_name)
        if not cid:
            print(f"  ⚠ Skipping contract: company {company_name} not found")
            continue

        now = datetime.now(timezone.utc)
        start = now + timedelta(days=days_until_end - duration)
        end = now + timedelta(days=days_until_end)

        c = await db.contract.create(
            data={
                "companyId": cid,
                "type": ctype,
                "status": cstatus,
                "startDate": start,
                "endDate": end,
                "totalValue": value,
                "renewalNoticeDays": renewal,
            }
        )
        contract_ids_by_company[company_name].append(c.id)
        contract_count += 1

    print(f"Seeded {contract_count} contracts.")

    # ── Contract Line Items ────────────────────────────────────────────
    print("Seeding contract line items…")
    li_count = 0
    for company_name, contract_idx, product_name, qty, price in CONTRACT_LINE_ITEMS:
        ids = contract_ids_by_company.get(company_name)
        prod_id = product_id_map.get(product_name)
        if not ids or contract_idx < 0 or contract_idx >= len(ids):
            print(
                f"  ⚠ Skipping line item: {company_name} / {product_name} "
                f"(contract index {contract_idx}, have {len(ids) if ids else 0})"
            )
            continue
        if not prod_id:
            print(f"  ⚠ Skipping line item: unknown product {product_name}")
            continue

        await db.contractlineitem.create(
            data={
                "contractId": ids[contract_idx],
                "productServiceId": prod_id,
                "quantity": qty,
                "unitPrice": price,
            }
        )
        li_count += 1

    print(f"Seeded {li_count} contract line items.")

    # ── Competitors ────────────────────────────────────────────────────
    print("Seeding competitors…")
    competitor_id_map: dict[str, str] = {}
    for comp in COMPETITORS:
        c = await db.competitor.create(
            data={
                "name": comp["name"],
                "website": comp.get("website"),
                "strengths": comp["strengths"],
                "weaknesses": comp["weaknesses"],
            }
        )
        competitor_id_map[comp["name"]] = c.id

    print(f"Seeded {len(COMPETITORS)} competitors.")

    # ── Competitor Intel ───────────────────────────────────────────────
    print("Seeding competitor intel…")
    intel_count = 0
    for company_name, competitor_name, product, end_off, conf in COMPETITOR_INTEL:
        cid = company_id_map.get(company_name)
        comp_id = competitor_id_map.get(competitor_name)
        if not cid or not comp_id:
            print(f"  ⚠ Skipping intel: {company_name} / {competitor_name}")
            continue

        contract_end = datetime.now(timezone.utc) + timedelta(days=end_off) if end_off else None

        await db.competitorintel.create(
            data={
                "companyId": cid,
                "competitorId": comp_id,
                "productName": product,
                "contractEnd": contract_end,
                "confidence": conf,
            }
        )
        intel_count += 1

    print(f"Seeded {intel_count} competitor intel records.")
    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(seed())
