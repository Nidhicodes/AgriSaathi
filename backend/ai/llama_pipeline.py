import os
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain.chains.combine_documents import create_stuff_documents_chain
from .retriever import get_retriever
from ..schemas import WeatherResponse, MarketResponse
from dotenv import load_dotenv
from typing import Dict, Any, List
import logging
import tiktoken
import re

logger = logging.getLogger(__name__)

load_dotenv()
if not os.getenv("GROQ_API_KEY"):
    print("Warning: GROQ_API_KEY not set. AI features will not work.")

llm = ChatGroq(
    model="llama3-8b-8192",  
    temperature=0.3,  
    max_tokens=512, 
    api_key=os.getenv("GROQ_API_KEY")
)

LANGUAGE_INSTRUCTIONS = {
    "hindi": "हिंदी में जवाब दें। केवल हिंदी का उपयोग करें, कोई अंग्रेजी शब्द न मिलाएं।",
    "english": "Respond only in English.",
    "marathi": "केवळ मराठीत उत्तर द्या।",
    "gujarati": "ફક્ત ગુજરાતીમાં જવાબ આપો।",
    "punjabi": "ਕੇਵਲ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ।",
    "bengali": "শুধুমাত্র বাংলায় উত্তর দিন।",
    "tamil": "தமிழில் மட்டும் பதில் சொல்லுங்கள்।",
    "telugu": "కేవలం తెలుగులో జవాబు ఇవ్వండి।"
}

prompt_template = """
You are AgriSaathi, an expert AI agricultural advisor for Indian farmers.

**CRITICAL LANGUAGE INSTRUCTION:**
{language_instruction}
DO NOT mix languages. Your ENTIRE response must be in {lang} only.

**Your Task:**
1. Analyze the user's Query and the provided Context below.
2. The Context contains specific data retrieved for the user's location. Base your answer primarily on this Context.
3. If the Context is empty or lacks relevant information for pincode {pincode}, clearly state that you couldn't find specific information for this pincode.
4. After stating that, provide general agricultural advice for the broader region ({district}, {state}).
5. ALWAYS recommend consulting local experts or the district's Krishi Vigyan Kendra (KVK).
6. Write your COMPLETE response in {lang} language only. No English words or phrases should appear in your response.

---
**Context:**
{context}
---

**User Query:** {query}
**Location:** {district}, {state} (Pin: {pincode})

**Remember: Respond ENTIRELY in {lang} language.**
"""

PROMPT = PromptTemplate(
    template=prompt_template,
    input_variables=["language_instruction", "context", "query", "pincode", "district", "state", "lang"]
)

def count_tokens(text: str) -> int:
    """Count tokens in text using tiktoken (approximation for LLaMA)"""
    try:
        encoding = tiktoken.get_encoding("cl100k_base")  
        return len(encoding.encode(text))
    except:
        return len(text) // 4

def truncate_context(docs: List[Document], max_tokens: int = 2000) -> List[Document]:
    """Truncate context to fit within token limits"""
    truncated_docs = []
    current_tokens = 0
    
    for doc in docs:
        doc_tokens = count_tokens(doc.page_content)
        if current_tokens + doc_tokens <= max_tokens:
            truncated_docs.append(doc)
            current_tokens += doc_tokens
        else:
            remaining_tokens = max_tokens - current_tokens
            if remaining_tokens > 100: 
                remaining_chars = remaining_tokens * 4  
                truncated_content = doc.page_content[:remaining_chars] + "..."
                truncated_docs.append(Document(
                    page_content=truncated_content,
                    metadata=doc.metadata
                ))
            break
    
    logger.info(f"Truncated context from {len(docs)} to {len(truncated_docs)} documents, ~{current_tokens} tokens")
    return truncated_docs

def summarize_weather_data(weather_data: WeatherResponse) -> str:
    """Create concise weather summary"""
    if not weather_data:
        return "Not available"
    
    try:
        current = weather_data.current if hasattr(weather_data, 'current') else {}
        forecast = weather_data.forecast if hasattr(weather_data, 'forecast') else {}
        
        summary = f"Temp: {current.get('temp', 'N/A')}°C, "
        summary += f"Humidity: {current.get('humidity', 'N/A')}%, "
        summary += f"Rain: {current.get('rain', 'No')} "
        
        if forecast:
            summary += f"| 7-day: {forecast.get('summary', 'Variable conditions')}"
        
        return summary[:200]  
    except:
        return "Weather data processing error"

def summarize_market_data(market_data: MarketResponse) -> str:
    """Create concise market summary"""
    if not market_data:
        return "Not available"
    
    try:
        if hasattr(market_data, 'prices') and market_data.prices:
            prices = market_data.prices[:3]  
            price_list = [f"{p.get('commodity', 'Item')}: ₹{p.get('price', 'N/A')}" 
                         for p in prices]
            return " | ".join(price_list)
        return "No current prices available"
    except:
        return "Market data processing error"

def sanitize_query(query: str) -> str:
    """Sanitize user query to remove potentially harmful characters."""
    return query.replace("#", "").replace("*", "").replace("-", "")

def clean_ai_response(text: str) -> str:
    """
    Removes markdown formatting from the AI response to deliver plain text.
    """
    text = re.sub(r'(\*\*|__|\*|_)', '', text)
    text = re.sub(r'^\s*#+\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'^\s*[\-\*]\s+', '', text, flags=re.MULTILINE)
    return text.strip()

def post_process_language(text: str, target_lang: str) -> str:
    """
    Post-process the response to remove English words and ensure target language consistency
    """
    english_replacements = {
        "hindi": {
            "As AgriSaathi": "एग्रीसाथी के रूप में",
            "Unfortunately": "दुर्भाग्य से",
            "However": "हालांकि",
            "Remember": "याद रखें",
            "Weather Forecast": "मौसम पूर्वानुमान",
            "PM-KISAN": "पीएम-किसान",
            "PM-KMY": "पीएम-केएमवाई",
            "KVK": "केवीके",
            "MSAMB": "एमएसएएमबी",
            "MSACCB": "एमएसएसीसीबी"
        }
    }
    
    if target_lang in english_replacements:
        for english, native in english_replacements[target_lang].items():
            text = text.replace(english, native)

    english_patterns = [
        r'\bAs\s+\w+[,!]\s*',  
        r'\*\*[^*]+\*\*',  
        r'\bUnfortunately[,\s]+',
        r'\bHowever[,\s]+',
        r'\bRemember[,\s]+',
    ]
    
    for pattern in english_patterns:
        try:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        except re.error as e:
            logger.warning(f"Regex pattern failed: {pattern}, Error: {e}")
            continue
    
    return text.strip()

def get_language_instruction(lang: str) -> str:
    """Get specific language instruction based on the target language"""
    lang_lower = lang.lower()
    return LANGUAGE_INSTRUCTIONS.get(lang_lower, f"Respond only in {lang} language.")

async def get_ai_response(
    query: str,
    lang: str,
    pincode: str,
    location_details: Dict[str, Any],
    weather_data: WeatherResponse,
    market_data: MarketResponse
):
    
    query = sanitize_query(query)
    logger.info(f"get_ai_response called with query='{query}', lang='{lang}', pincode='{pincode}'")

    try:
        retriever = get_retriever()

        try:
            retrieved_docs = await retriever._aget_relevant_documents(query)
        except (AttributeError, NotImplementedError):
            retrieved_docs = retriever._get_relevant_documents(query)

        fixed_docs = []
        for doc in retrieved_docs:
            if isinstance(doc, Document):
                fixed_docs.append(doc)
            elif isinstance(doc, str):
                fixed_docs.append(Document(page_content=doc, metadata={"source": "retriever"}))
            else:
                fixed_docs.append(Document(page_content=str(doc), metadata={"source": "retriever"}))

        truncated_docs = truncate_context(fixed_docs, max_tokens=2000)

        weather_summary = summarize_weather_data(weather_data)
        market_summary = summarize_market_data(market_data)

        context_text = "\n".join([doc.page_content for doc in truncated_docs])
        estimated_input_tokens = count_tokens(context_text) + count_tokens(query) + 200  
        logger.info(f"Estimated input tokens: {estimated_input_tokens}")
        
        if estimated_input_tokens > 4500:  
            logger.warning(f"Input tokens ({estimated_input_tokens}) may exceed limits")

            truncated_docs = truncate_context(truncated_docs, max_tokens=1500)

        language_instruction = get_language_instruction(lang)

        stuff_chain = create_stuff_documents_chain(llm, PROMPT)

        result = stuff_chain.invoke({
            "language_instruction": language_instruction,
            "context": truncated_docs,
            "query": query,
            "pincode": pincode,
            "district": location_details.get("district", "N/A"),
            "state": location_details.get("state", "N/A"),
            "lang": lang
        })

        if isinstance(result, dict):
            response_text = result.get("output", result.get("text", str(result)))
        else:
            response_text = str(result)

        confidence = 0.85 if truncated_docs else 0.3
        sources = [doc.metadata.get("source", "unknown") for doc in truncated_docs]

        logger.info(f"Generated AI response with confidence: {confidence}")

        cleaned_response = clean_ai_response(response_text)
        cleaned_response = post_process_language(cleaned_response, lang)
        
        logger.debug(f"Cleaned AI Response: {cleaned_response[:200]}...")

        return cleaned_response, confidence, list(set(sources))

    except Exception as e:
        logger.error(f"Chain execution error: {e}", exc_info=True)

        fallback_response = generate_fallback_response(query, location_details, lang)
        return fallback_response, 0.0, []

def generate_fallback_response(query: str, location_details: Dict[str, Any], lang: str) -> str:
    """Generate contextual fallback response in the target language"""
    district = location_details.get('district', 'your area')
    
    fallback_templates = {
        "hindi": {
            "crop": f"{district} में फसल की सिफारिशों के लिए, अपने स्थानीय कृषि विज्ञान केंद्र या कृषि विस्तार कार्यालय से संपर्क करें।",
            "market": f"{district} में वर्तमान बाजार मूल्यों के लिए, ई-नाम पोर्टल देखें या अपने निकटतम मंडी जाएं।",
            "scheme": f"{district} में सरकारी कृषि योजनाओं के लिए, कॉमन सर्विस सेंटर पर जाएं या जिला कलेक्टर कार्यालय से संपर्क करें।",
            "default": f"तकनीकी कठिनाई के लिए खेद है। {district} में कृषि मार्गदर्शन के लिए, कृपया अपने स्थानीय कृषि विज्ञान केंद्र से संपर्क करें।"
        },
        "english": {
            "crop": f"For crop recommendations in {district}, consult your local Krishi Vigyan Kendra or agricultural extension office.",
            "market": f"For current market prices in {district}, check the eNAM portal or visit your nearest mandi.",
            "scheme": f"For government agricultural schemes in {district}, visit the Common Service Center or contact the District Collector's office.",
            "default": f"I apologize for the technical difficulty. For agricultural guidance in {district}, please consult your local Krishi Vigyan Kendra."
        }
    }
    
    query_lower = query.lower()
    lang_templates = fallback_templates.get(lang.lower(), fallback_templates["english"])
    
    if any(keyword in query_lower for keyword in ['crop', 'farming', 'cultivation', 'फसल', 'खेती']):
        return lang_templates["crop"]
    elif any(keyword in query_lower for keyword in ['price', 'market', 'mandi', 'मूल्य', 'बाजार', 'मंडी']):
        return lang_templates["market"]
    elif any(keyword in query_lower for keyword in ['scheme', 'subsidy', 'government', 'योजना', 'सब्सिडी', 'सरकार']):
        return lang_templates["scheme"]
    else:
        return lang_templates["default"]

async def get_ai_response_chunked(
    query: str,
    lang: str,
    pincode: str,
    location_details: Dict[str, Any],
    weather_data: WeatherResponse,
    market_data: MarketResponse,
    chunk_size: int = 3
):
    """Process large contexts in chunks and combine responses"""
    
    retriever = get_retriever()
    
    try:
        retrieved_docs = await retriever._aget_relevant_documents(query)
    except (AttributeError, NotImplementedError):
        retrieved_docs = retriever._get_relevant_documents(query)

    chunks = [retrieved_docs[i:i + chunk_size] for i in range(0, len(retrieved_docs), chunk_size)]
    responses = []
    
    for i, chunk in enumerate(chunks):
        if i >= 2:  
            break
            
        try:
            response, confidence, sources = await get_ai_response(
                query, lang, pincode, location_details, 
                weather_data if i == 0 else None, 
                market_data if i == 0 else None,
            )
            responses.append((response, confidence, sources))
        except Exception as e:
            logger.error(f"Error processing chunk {i}: {e}")
            continue
    
    if responses:
        best_response = max(responses, key=lambda x: x[1])
        return best_response
    else:
        return generate_fallback_response(query, location_details, lang), 0.0, []