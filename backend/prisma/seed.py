"""
Seed script for the Cybersecurity Sales Intelligence Platform.

Populates the database with:
  - 3 regions (APJ, EMEA, Americas)
  - Territory groups per region
  - Industries
  - ~150 companies with a realistic size distribution
    (≈40 % SMB, ≈25 % Mid-Market, ≈25 % Enterprise, ≈10 % Government)
  - Company ↔ territory-group and company ↔ industry links
  - Contacts across Enterprise, Mid-Market, and Government companies

Run:  python prisma/seed.py          (standalone)
"""

import asyncio
import random

from prisma import Prisma

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


async def seed():
    db = Prisma()
    await db.connect()

    print("Clearing existing data…")
    await db.companyterritorygroup.delete_many()
    await db.companyindustry.delete_many()
    await db.engagement.delete_many()
    await db.competitorintel.delete_many()
    await db.contractlineitem.delete_many()
    await db.contract.delete_many()
    await db.contact.delete_many()
    await db.companyassignment.delete_many()
    await db.companyname.delete_many()
    await db.companysite.delete_many()
    await db.company.delete_many()
    await db.teammember.delete_many()
    await db.teamterritorygroup.delete_many()
    await db.team.delete_many()
    await db.territorygroup.delete_many()
    await db.region.delete_many()
    await db.industry.delete_many()

    # ── Regions & Territory Groups ────────────────────────────────────
    print("Seeding regions & territory groups…")
    region_map: dict[str, str] = {}
    territory_map: dict[str, str] = {}

    for r in REGIONS:
        region = await db.region.create(data={"name": r["name"], "code": r["code"]})
        region_map[r["code"]] = region.id

        for t in r["territories"]:
            tg = await db.territorygroup.create(
                data={
                    "regionId": region.id,
                    "name": t["name"],
                    "description": t["description"],
                }
            )
            territory_map[t["name"]] = tg.id

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

        # Link to territory group
        tg_id = territory_map.get(territory)
        if tg_id:
            await db.companyterritorygroup.create(
                data={"companyId": company.id, "territoryGroupId": tg_id}
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
    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(seed())
