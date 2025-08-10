import os
from langchain_huggingface import HuggingFaceEmbeddings
import logging

logger = logging.getLogger(__name__)

def get_embeddings():
    """
    Returns an instance of HuggingFaceEmbeddings.
    This function acts as a factory for the embedding model.
    """
    logger.info("Initializing HuggingFace embeddings...")
    
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    
    model_kwargs = {'device': 'cpu'}
    
    encode_kwargs = {}

    try:
        embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs=model_kwargs,
            encode_kwargs=encode_kwargs
        )
        logger.info(f"Successfully initialized HuggingFaceEmbeddings with model: {model_name}")
        return embeddings
    except Exception as e:
        logger.error(f"Failed to initialize HuggingFaceEmbeddings: {e}", exc_info=True)
        raise
