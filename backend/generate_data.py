"""
NationOS — Lagos State 2026 Fiscal Budget Dataset Generator
Generates a realistic 500-row ground truth dataset reflecting the 2026 fiscal plan.
"""

import os
import random
import pandas as pd
import numpy as np

# Set deterministic seed for reproducibility
random.seed(42)
np.random.seed(42)

# Sector & MDA mappings
SECTOR_MDA_MAP = {
    "Economic": [
        "Ministry of Works and Infrastructure",
        "Ministry of Transportation",
        "Ministry of Agriculture and Food Systems",
        "Ministry of Energy and Mineral Resources",
        "Ministry of Commerce, Cooperatives, Trade & Investment",
        "Lagos State Employment Trust Fund (LSETF)",
    ],
    "Social": [
        "Ministry of Health",
        "Ministry of Basic and Secondary Education",
        "Ministry of Environment and Water Resources",
        "Ministry of Youth and Social Development",
        "Ministry of Women Affairs and Poverty Alleviation",
        "Lagos State Primary Health Care Board",
        "Lagos State Waste Management Authority (LAWMA)",
    ],
    "Law & Justice": [
        "Ministry of Justice",
        "Lagos State Judiciary",
        "Lagos State Citizens Mediation Centre",
        "Lagos State Traffic Management Authority (LASTMA)",
    ],
    "Administration": [
        "Ministry of Finance",
        "Ministry of Establishments and Training",
        "Ministry of Local Government and Chieftaincy Affairs",
        "Ministry of Information and Strategy",
        "Lagos State Internal Revenue Service (LIRS)",
    ],
}

# The 20 LGAs of Lagos State
LGAS = [
    "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa",
    "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye",
    "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland",
    "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"
]

# Project templates categorized by MDA
PROJECT_CATALOG = {
    "Ministry of Works and Infrastructure": [
        "Construction of Eti-Osa Regional Road Section {num}",
        "Dualization of Lekki-Epe Expressway corridor - Package {num}",
        "Rehabilitation of Ikorodu-Sagamu arterial road network",
        "Construction of multi-tier flyover bridge at Pen Cinema Phase {num}",
        "Asphalt overlay and drainage construction across major feeder routes in {lga}",
        "Reconstruction of coastal embankment and flood barrier at {lga}",
        "Structural reinforcement of Carter Bridge and Third Mainland feeder ramps",
        "Pavement improvement and sidewalk pedestrianization project in {lga}",
    ],
    "Ministry of Transportation": [
        "Expansion of Lagos Rail Mass Transit (Red Line Phase {num}) infrastructure",
        "Procurement of electric high-capacity passenger buses for BRT corridors in {lga}",
        "Installation of automated traffic management and adaptive signal systems",
        "Rehabilitation and modernization of commercial ferry terminal at {lga}",
        "Construction of multi-modal passenger transit interchange in {lga}",
        "Deployment of junction improvement and intelligent camera network",
    ],
    "Ministry of Agriculture and Food Systems": [
        "Expansion of Lagos Food Logistics and Agro-Hub facility in {lga}",
        "Rice value chain input distribution and storage silos modernization",
        "Aquaculture development program and cage-culture equipment in {lga}",
        "Poultry revival and commercial feed subsidy initiative",
        "Cold-chain refrigerated storage terminals for peri-urban markets in {lga}",
    ],
    "Ministry of Energy and Mineral Resources": [
        "Lagos Solar Initiative: Off-grid solar installations for public hospitals in {lga}",
        "Deployment of LED intelligent street-lighting network along {lga} expressway",
        "Rural electrification and mini-grid distribution infrastructure for {lga}",
        "Substation upgrade and distribution transformer replenishment program",
    ],
    "Ministry of Commerce, Cooperatives, Trade & Investment": [
        "Development of Enterprise Industrial Park Phase {num} in {lga}",
        "Modernization of artisan tech hubs and incubation centers in {lga}",
        "MSME credit guarantee and single-digit interest facility for small traders",
        "Trade exhibition and digital export facilitation infrastructure",
    ],
    "Lagos State Employment Trust Fund (LSETF)": [
        "Tech talent workforce apprenticeship and software engineering grants",
        "Women-in-business microfinance capital injection program in {lga}",
        "Youth vocational training and equipment kits distribution across {lga}",
        "Seed capital for green-tech and climate resilience startups",
    ],
    "Ministry of Health": [
        "Procurement of advanced MRI and CT diagnostic radiology suite for {lga} General Hospital",
        "Construction of 100-bed Maternal and Child Center (MCC) in {lga}",
        "Renovation of clinical laboratories and intensive care isolation units",
        "Universal health insurance equity fund subsidy for indigent residents in {lga}",
        "Upgrade of pharmaceutical cold-chain vaccine repository and distribution vehicles",
        "Emergency medical services ambulance dispatch station establishment in {lga}",
    ],
    "Lagos State Primary Health Care Board": [
        "Revitalization and 24-hour solar power outfitting of Primary Healthcare Centers in {lga}",
        "Maternal healthcare outreach and infant nutrition immunization campaigns in {lga}",
        "Procurement of point-of-care rapid testing diagnostic kits for {lga} clinics",
        "Community healthcare worker field mobilization and digital reporting tablets",
    ],
    "Ministry of Basic and Secondary Education": [
        "Construction of 18-classroom modular secondary school block in {lga}",
        "Outfitting of STEM robotics and digital computer laboratories in {lga} schools",
        "Comprehensive structural rehabilitation and perimeter fencing of primary schools",
        "Distribution of standardized textbooks and digital learning tablets in {lga}",
        "Special education needs learning resource center development",
    ],
    "Ministry of Environment and Water Resources": [
        "Construction of primary concrete storm water drainage channel in {lga}",
        "Dredging, desilting, and canal expansion to mitigate recurring floods in {lga}",
        "Installation of automated real-time water and air quality monitoring sensors",
        "Urban green canopy tree planting and shoreline erosion defense in {lga}",
    ],
    "Lagos State Waste Management Authority (LAWMA)": [
        "Procurement of Euro-4 compliant hydraulic compactor trucks for {lga} routes",
        "Construction of decentralized waste transfer loading station in {lga}",
        "Recycling facility machinery upgrade and plastics baling plant modernization",
        "Community street sweeping and solid waste sanitation operational drive",
    ],
    "Ministry of Youth and Social Development": [
        "Rehabilitation of youth leadership and vocational sports development complex in {lga}",
        "Child protection and rehabilitation center refurbishment in {lga}",
        "Substance abuse prevention and mental health psychosocial clinic support",
        "Elderly day care center facility upgrade and assistive mobility provisions",
    ],
    "Ministry of Women Affairs and Poverty Alleviation": [
        "Vocational skills acquisition center expansion and industrial sewing outfitting in {lga}",
        "Economic empowerment grant for widows and vulnerable women cooperatives",
        "Domestic violence response shelter rehabilitation and legal aid helpline support",
    ],
    "Ministry of Justice": [
        "Digital court filing, e-registry, and automated case management system",
        "Renovation and modernization of High Court and Magistrate complexes in {lga}",
        "Public defender legal representation program for low-income detainees",
        "DNA and forensic science laboratory reagent and equipment procurement",
    ],
    "Lagos State Judiciary": [
        "Audio-visual electronic court recording and automated transcription suites",
        "Modernization of judicial chambers and electronic library resources in {lga}",
        "Security enhancement and perimeter surveillance for court premises in {lga}",
    ],
    "Lagos State Citizens Mediation Centre": [
        "Expansion of dispute resolution storefront offices across {lga}",
        "Community alternative dispute resolution (ADR) training and public awareness campaign",
        "Casework case management mobile application and cloud archiving system",
    ],
    "Lagos State Traffic Management Authority (LASTMA)": [
        "Procurement of digital body-worn cameras and hand-held ticketing terminals",
        "Towing heavy recovery crane and traffic rescue vehicle fleet replenishment",
        "Traffic management officer field tactical gear and radio communication relay system in {lga}",
    ],
    "Ministry of Finance": [
        "Integrated Financial Management Information System (IFMIS) cloud migration and security audit",
        "State debt management advisory services and municipal bond redemption reserve",
        "Fiscal compliance review and state-wide procurement integrity inspection program",
    ],
    "Ministry of Establishments and Training": [
        "Public service digital upskilling and executive leadership masterclasses",
        "Civil service continuous professional development curriculum rollout",
        "Retirement bond contribution matching and pension management administration",
    ],
    "Ministry of Local Government and Chieftaincy Affairs": [
        "Inter-LGA development monitoring and rural infrastructure coordination forum in {lga}",
        "Traditional leadership community conflict resolution engagement sessions",
        "Local council administrative oversight and capacity strengthening program",
    ],
    "Ministry of Information and Strategy": [
        "Lagos State open-data transparency portal and public dashboard modernization",
        "Civic engagement town hall digital broadcasting and feedback infrastructure in {lga}",
        "Anti-misinformation and public health public service announcement broadcasting",
    ],
    "Lagos State Internal Revenue Service (LIRS)": [
        "Automated tax assessment portal upgrade and enterprise API integrations",
        "Informal sector revenue enumeration and biometrics onboarding drive in {lga}",
        "Tax compliance mobile auditing units and digital field enforcement kits",
    ],
}

def generate_budget_dataset(total_rows: int = 500) -> pd.DataFrame:
    rows = []
    
    # Invert sector lookup
    mda_to_sector = {}
    for sector, mdas in SECTOR_MDA_MAP.items():
        for mda in mdas:
            mda_to_sector[mda] = sector

    all_mdas = list(mda_to_sector.keys())

    for i in range(total_rows):
        fiscal_year = 2026
        mda = random.choice(all_mdas)
        sector = mda_to_sector[mda]
        lga = random.choice(LGAS)
        
        # Decide expenditure type: 58% Capital, 22% Recurrent - Personnel, 20% Recurrent - Overhead
        exp_dice = random.random()
        if exp_dice < 0.58:
            expenditure_type = "Capital"
        elif exp_dice < 0.80:
            expenditure_type = "Recurrent - Personnel"
        else:
            expenditure_type = "Recurrent - Overhead"

        # Generate realistic project description
        if expenditure_type == "Capital":
            templates = PROJECT_CATALOG.get(mda, ["Infrastructure capital development in {lga}"])
            template = random.choice(templates)
            project_description = template.format(num=random.randint(1, 4), lga=lga)
            
            # Capital projects have larger budgets (e.g., 80 Million to 18 Billion Naira)
            scale = random.random()
            if scale < 0.15:
                # Mega infrastructure projects (2B - 18B NGN)
                approved_budget = round(random.uniform(2_000_000_000, 18_000_000_000), 2)
            elif scale < 0.65:
                # Mid-level capital projects (250M - 2B NGN)
                approved_budget = round(random.uniform(250_000_000, 2_000_000_000), 2)
            else:
                # Community/LGA scale capital projects (40M - 250M NGN)
                approved_budget = round(random.uniform(40_000_000, 250_000_000), 2)

            # Execution rate simulation (disbursed vs approved):
            # Realistic variance: stalled projects, delayed projects, on-track projects
            perf_dice = random.random()
            if perf_dice < 0.12:
                # Stalled/Zero allocation release: Bureaucratic delay / procurement hold
                disbursement_ratio = 0.0
            elif perf_dice < 0.28:
                # Critically stalled / Bottlenecked: 5% - 25% disbursement
                disbursement_ratio = random.uniform(0.05, 0.25)
            elif perf_dice < 0.58:
                # Moderate progress / partial milestone release: 30% - 65%
                disbursement_ratio = random.uniform(0.30, 0.65)
            elif perf_dice < 0.88:
                # Healthy execution / near target: 70% - 94%
                disbursement_ratio = random.uniform(0.70, 0.94)
            else:
                # Fully disbursed / 100% completion milestone
                disbursement_ratio = random.uniform(0.97, 1.00)

            actual_disbursed = round(approved_budget * disbursement_ratio, 2)

        elif expenditure_type == "Recurrent - Personnel":
            project_description = f"{mda} - Staff Salaries, Allowances and Statutory Benefits ({lga} Division)"
            # Personnel budgets: 80M - 1.8B NGN
            approved_budget = round(random.uniform(80_000_000, 1_800_000_000), 2)
            # Salaries are highly prioritized in Lagos: 88% - 100% disbursed
            disbursement_ratio = random.uniform(0.88, 1.00)
            actual_disbursed = round(approved_budget * disbursement_ratio, 2)

        else: # Recurrent - Overhead
            project_description = f"{mda} - Operational Running Costs, Facility Maintenance and Utilities ({lga})"
            # Overhead budgets: 25M - 450M NGN
            approved_budget = round(random.uniform(25_000_000, 450_000_000), 2)
            # Overheads have moderate execution rates: 60% - 92%
            disbursement_ratio = random.uniform(0.60, 0.92)
            actual_disbursed = round(approved_budget * disbursement_ratio, 2)

        rows.append({
            "fiscal_year": fiscal_year,
            "mda": mda,
            "sector": sector,
            "expenditure_type": expenditure_type,
            "project_description": project_description,
            "lga": lga,
            "approved_budget_naira": approved_budget,
            "actual_disbursed_naira": actual_disbursed,
        })

    df = pd.DataFrame(rows)
    return df

if __name__ == "__main__":
    df = generate_budget_dataset(500)
    
    # Save in current directory and data/ directory for accessibility
    output_filename = "lagos_budget_2026.csv"
    os.makedirs("data", exist_ok=True)
    df.to_csv(output_filename, index=False)
    df.to_csv(os.path.join("data", output_filename), index=False)
    
    print(f"Generated {len(df)} rows successfully.")
    print("Sample rows:")
    print(df[["mda", "expenditure_type", "lga", "approved_budget_naira", "actual_disbursed_naira"]].head(5))
    print("\nSummary Statistics:")
    print(f"Total Approved Budget: NGN {df['approved_budget_naira'].sum():,.2f}")
    print(f"Total Actual Disbursed: NGN {df['actual_disbursed_naira'].sum():,.2f}")
    print(f"Overall Execution Rate: {(df['actual_disbursed_naira'].sum() / df['approved_budget_naira'].sum()) * 100:.2f}%")
