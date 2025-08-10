import os
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import logging
import random

logger = logging.getLogger(__name__)

LABELS = ["weather", "irrigation", "crop selection", "market price", "government scheme", "finance", "general query"]

llm = ChatGroq(
    model="llama3-8b-8192",
    temperature=0,
    max_tokens=50,
    api_key=os.getenv("GROQ_API_KEY")
)

intent_prompt_template = """
You are an expert at classifying user queries in the agricultural domain.
Your task is to categorize the following user query into one of the predefined labels.
The query is: "{query}"

Here are the available labels:
{labels}

Based on the query, choose the most appropriate label.
Your response should ONLY be the chosen label and nothing else.

Label:
"""

INTENT_PROMPT = PromptTemplate(
    template=intent_prompt_template,
    input_variables=["query", "labels"]
)

intent_chain = LLMChain(llm=llm, prompt=INTENT_PROMPT)

def classify_intent(query: str) -> str:
    """
    Classifies the user's query to determine the primary intent.
    
    Args:
        query: The user's input string.
        
    Returns:
        The classified intent label as a string.
    """
    if not os.getenv("GROQ_API_KEY"):
        logger.warning("GROQ_API_KEY not set. Using random intent fallback.")
        return random.choice(LABELS)

    try:
        formatted_labels = "\n".join([f"- {label}" for label in LABELS])

        result = intent_chain.invoke({
            "query": query,
            "labels": formatted_labels
        })
        
        if isinstance(result, dict):
            classified_label = result.get('text', '').strip()
        else:
            classified_label = str(result).strip()

        if classified_label in LABELS:
            logger.info(f"Classified intent for query '{query[:50]}...' as: {classified_label}")
            return classified_label
        else:
            logger.warning(f"Classification returned an invalid label: '{classified_label}'. Falling back.")
            return "general query" 

    except Exception as e:
        logger.error(f"Error during intent classification for query '{query[:50]}...': {e}", exc_info=True)
        return "general query"


