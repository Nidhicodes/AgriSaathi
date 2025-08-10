import os
import json
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
from typing import List
from .embeddings import get_embeddings
import logging

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
FAISS_INDEX_PATH = os.path.join(DATA_DIR, 'faiss_index')

class SafeVectorStoreRetriever:
    """Custom retriever that ensures all results are Document objects"""
    
    def __init__(self, vectorstore, search_kwargs=None):
        self.vectorstore = vectorstore
        self.search_kwargs = search_kwargs or {"k": 5}
    
    def get_relevant_documents(self, query: str) -> List[Document]:
        """Synchronous document retrieval with safe Document conversion"""
        return self._get_relevant_documents(query)
    
    def _get_relevant_documents(self, query: str) -> List[Document]:
        """Synchronous document retrieval with safe Document conversion"""
        try:
            if self.vectorstore is None:
                logger.warning("Vectorstore is None, returning empty results")
                return []
                
            docs = self.vectorstore.similarity_search(query, **self.search_kwargs)
            logger.info(f"Retrieved {len(docs)} documents for query: {query[:50]}...")

            safe_docs = []
            for doc in docs:
                if isinstance(doc, Document):
                    safe_docs.append(doc)
                else:
                    safe_docs.append(Document(
                        page_content=str(doc), 
                        metadata={"source": "retriever"}
                    ))
            
            return safe_docs
            
        except Exception as e:
            logger.error(f"Error in document retrieval: {e}")
            return []
    
    async def _aget_relevant_documents(self, query: str) -> List[Document]:
        """Asynchronous document retrieval with safe Document conversion"""
        try:
            if self.vectorstore is None:
                logger.warning("Vectorstore is None, returning empty results")
                return []
            
            docs = self.vectorstore.similarity_search(query, **self.search_kwargs)
            logger.info(f"Retrieved {len(docs)} documents for query: {query[:50]}...")
            
            safe_docs = []
            for doc in docs:
                if isinstance(doc, Document):
                    safe_docs.append(doc)
                else:
                    safe_docs.append(Document(
                        page_content=str(doc), 
                        metadata={"source": "retriever"}
                    ))
            
            return safe_docs
            
        except Exception as e:
            logger.error(f"Error in async document retrieval: {e}")
            return []
    
    async def ainvoke(self, query: str) -> List[Document]:
        """LangChain-style async invoke method"""
        return await self._aget_relevant_documents(query)
    
    def invoke(self, query: str) -> List[Document]:
        """LangChain-style sync invoke method"""
        return self._get_relevant_documents(query)

def load_knowledge_base():
    """Load knowledge base from JSON files"""
    documents = []
    try:
        if not os.path.exists(DATA_DIR):
            logger.warning(f"Data directory {DATA_DIR} does not exist")
            return documents
            
        for filename in os.listdir(DATA_DIR):
            if filename.endswith(".json"):
                filepath = os.path.join(DATA_DIR, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            for item in data:
                                text = json.dumps(item, ensure_ascii=False)
                                documents.append(Document(
                                    page_content=text, 
                                    metadata={"source": filename}
                                ))
                        else:
                            text = json.dumps(data, ensure_ascii=False)
                            documents.append(Document(
                                page_content=text, 
                                metadata={"source": filename}
                            ))
                except Exception as e:
                    logger.error(f"Error loading {filepath}: {e}")
                    continue
                    
        logger.info(f"Loaded {len(documents)} documents from knowledge base")
        return documents
        
    except Exception as e:
        logger.error(f"Error loading knowledge base: {e}")
        return documents

def get_retriever():
    """Get the vector store retriever with safe Document handling"""
    try:
        embeddings = get_embeddings()

        if os.path.exists(FAISS_INDEX_PATH):
            try:
                vector_store = FAISS.load_local(
                    FAISS_INDEX_PATH,
                    embeddings
                )
                logger.info("Loaded existing FAISS index")
            except Exception as e:
                logger.error(f"Error loading existing FAISS index: {e}")
                logger.info("Creating new FAISS index")
                documents = load_knowledge_base()
                if documents:
                    vector_store = FAISS.from_documents(documents, embeddings)
                    vector_store.save_local(FAISS_INDEX_PATH)
                else:
                    dummy_doc = Document(page_content="No knowledge base available", metadata={"source": "system"})
                    vector_store = FAISS.from_documents([dummy_doc], embeddings)
        else:
            logger.info("Creating new FAISS index")
            documents = load_knowledge_base()
            if documents:
                vector_store = FAISS.from_documents(documents, embeddings)
                os.makedirs(os.path.dirname(FAISS_INDEX_PATH), exist_ok=True)
                vector_store.save_local(FAISS_INDEX_PATH)
            else:
                dummy_doc = Document(page_content="No knowledge base available", metadata={"source": "system"})
                vector_store = FAISS.from_documents([dummy_doc], embeddings)

        retriever = SafeVectorStoreRetriever(
            vectorstore=vector_store,
            search_kwargs={"k": 5}
        )
        
        logger.info("Successfully created vector store retriever")
        return retriever
        
    except Exception as e:
        logger.error(f"Error creating retriever: {e}")
        return SafeVectorStoreRetriever(vectorstore=None)