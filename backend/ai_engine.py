"""
NationOS — AI Brain & LlamaIndex Deterministic Query Engine
Orchestrates natural language to Pandas execution using OpenRouter.
"""

import os
from pathlib import Path
import pandas as pd
from dotenv import load_dotenv
from llama_index.experimental.query_engine import PandasQueryEngine
from llama_index.llms.openrouter import OpenRouter

# Load environment variables
load_dotenv()

# Resolve path to the ground truth dataset
BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "lagos_budget_2026.csv"
if not CSV_PATH.exists():
    CSV_PATH = BASE_DIR / "data" / "lagos_budget_2026.csv"

# 1. Load the ground truth dataset into Pandas DataFrame
df = pd.read_csv(CSV_PATH)

# 2. Retrieve OpenRouter credentials
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "mock-openrouter-key")

# 3. Initialize OpenRouter LLM (meta-llama/llama-3.1-8b-instruct)
llm = OpenRouter(
    model="meta-llama/llama-3.1-8b-instruct",
    api_key=OPENROUTER_API_KEY,
    temperature=0.0,
    max_tokens=1024,
)

# 4. Strict instruction string to enforce deterministic financial auditing
INSTRUCTION_STR = (
    "You are a strict financial auditor for Lagos State. "
    "You must use the provided Pandas DataFrame to answer queries mathematically. "
    "Never guess or hallucinate numbers. "
    "Return monetary values formatted in Naira (₦)."
)

# 5. Initialize PandasQueryEngine
def create_query_engine(
    dataframe: pd.DataFrame = df,
    model_name: str = "meta-llama/llama-3.1-8b-instruct",
    api_key: str | None = None,
) -> PandasQueryEngine:
    """Factory to instantiate the PandasQueryEngine with deterministic auditing constraints."""
    resolved_api_key = api_key or os.getenv("OPENROUTER_API_KEY", "mock-openrouter-key")
    engine_llm = OpenRouter(
        model=model_name,
        api_key=resolved_api_key,
        temperature=0.0,
        max_tokens=1024,
    )
    return PandasQueryEngine(
        df=dataframe,
        llm=engine_llm,
        instruction_str=INSTRUCTION_STR,
        verbose=True,
    )

# 6. Expose the primary query_engine instance for import across backend modules
query_engine = PandasQueryEngine(
    df=df,
    llm=llm,
    instruction_str=INSTRUCTION_STR,
    verbose=True,
)
