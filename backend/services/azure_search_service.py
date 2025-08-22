import os
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential
from typing import List, Dict, Any
import json

class AzureSearchService:
    def __init__(self):
        # Use DefaultAzureCredential for authentication as mentioned in requirements
        self.credential = DefaultAzureCredential()
    
    async def get_indexes(self, search_endpoint: str) -> List[Dict[str, str]]:
        """Get all search indexes from Azure Cognitive Search"""
        try:
            index_client = SearchIndexClient(
                endpoint=search_endpoint,
                credential=self.credential
            )
            
            indexes = []
            for index in index_client.list_indexes():
                indexes.append({
                    "name": index.name,
                    "description": getattr(index, 'description', ''),
                    "fields_count": len(index.fields) if index.fields else 0
                })
            
            return indexes
        except Exception as e:
            print(f"Error getting search indexes: {e}")
            return []
    
    async def search_documents(
        self, 
        search_endpoint: str, 
        index_name: str, 
        query: str, 
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Search documents in Azure Cognitive Search"""
        try:
            search_client = SearchClient(
                endpoint=search_endpoint,
                index_name=index_name,
                credential=self.credential
            )
            
            results = search_client.search(
                search_text=query,
                top=top_k,
                include_total_count=True
            )
            
            documents = []
            for result in results:
                # Extract the document content and metadata
                doc = {
                    "content": result.get("content", ""),
                    "title": result.get("title", ""),
                    "url": result.get("url", ""),
                    "score": result.get("@search.score", 0),
                    "metadata": {k: v for k, v in result.items() if not k.startswith("@")}
                }
                documents.append(doc)
            
            return documents
        except Exception as e:
            print(f"Error searching documents: {e}")
            return []
    
    async def get_document_contexts(
        self, 
        search_endpoint: str, 
        index_name: str, 
        query: str, 
        top_k: int = 5
    ) -> List[str]:
        """Get document contexts for RAGAS evaluation"""
        documents = await self.search_documents(search_endpoint, index_name, query, top_k)
        
        # Extract just the content for context
        contexts = []
        for doc in documents:
            content = doc.get("content", "")
            if content:
                contexts.append(content)
        
        return contexts
