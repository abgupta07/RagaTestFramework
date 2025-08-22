import os
from azure.cosmos import CosmosClient, PartitionKey
from azure.cosmos.exceptions import CosmosHttpResponseError
from typing import List, Dict, Any, Optional
import json

class CosmosService:
    def __init__(self):
        # These should be set as environment variables
        self.endpoint = os.getenv("COSMOS_ENDPOINT")
        self.key = os.getenv("COSMOS_KEY")
        self.database_name = os.getenv("COSMOS_DATABASE_NAME", "ragas_db")
        self.container_name = os.getenv("COSMOS_CONTAINER_NAME", "configurations")
        
        if not self.endpoint or not self.key:
            raise ValueError("COSMOS_ENDPOINT and COSMOS_KEY environment variables must be set")
        
        self.client = CosmosClient(self.endpoint, self.key)
        self.database = None
        self.container = None
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize database and container if they don't exist"""
        try:
            # Create database if it doesn't exist
            self.database = self.client.create_database_if_not_exists(id=self.database_name)
            
            # Create container if it doesn't exist
            self.container = self.database.create_container_if_not_exists(
                id=self.container_name,
                partition_key=PartitionKey(path="/type"),
                offer_throughput=400
            )
        except CosmosHttpResponseError as e:
            print(f"Error initializing Cosmos DB: {e}")
            raise
    
    async def get_configs(self, config_type: str) -> List[Dict[str, Any]]:
        """Get all configurations of a specific type"""
        try:
            query = f"SELECT * FROM c WHERE c.type = '{config_type}'"
            items = list(self.container.query_items(
                query=query,
                enable_cross_partition_query=True
            ))
            return items
        except CosmosHttpResponseError as e:
            print(f"Error querying configs: {e}")
            return []
    
    async def get_config_by_id(self, config_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific configuration by ID"""
        try:
            query = f"SELECT * FROM c WHERE c.id = '{config_id}'"
            items = list(self.container.query_items(
                query=query,
                enable_cross_partition_query=True
            ))
            return items[0] if items else None
        except CosmosHttpResponseError as e:
            print(f"Error getting config by ID: {e}")
            return None
    
    async def save_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Save or update a configuration"""
        try:
            return self.container.upsert_item(body=config)
        except CosmosHttpResponseError as e:
            print(f"Error saving config: {e}")
            raise
    
    async def delete_config(self, config_id: str) -> bool:
        """Delete a configuration"""
        try:
            # First get the item to find its partition key
            config = await self.get_config_by_id(config_id)
            if not config:
                return False
            
            self.container.delete_item(
                item=config_id,
                partition_key=config["type"]
            )
            return True
        except CosmosHttpResponseError as e:
            print(f"Error deleting config: {e}")
            return False
    
    async def save_evaluation_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Save evaluation result"""
        try:
            result["type"] = "evaluation-result"
            return self.container.create_item(body=result)
        except CosmosHttpResponseError as e:
            print(f"Error saving evaluation result: {e}")
            raise
    
    async def get_evaluation_results(self) -> List[Dict[str, Any]]:
        """Get all evaluation results"""
        try:
            query = "SELECT * FROM c WHERE c.type = 'evaluation-result' ORDER BY c.created_at DESC"
            items = list(self.container.query_items(
                query=query,
                enable_cross_partition_query=True
            ))
            return items
        except CosmosHttpResponseError as e:
            print(f"Error querying evaluation results: {e}")
            return []
    
    async def get_evaluation_result(self, evaluation_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific evaluation result by ID"""
        try:
            query = f"SELECT * FROM c WHERE c.id = '{evaluation_id}' AND c.type = 'evaluation-result'"
            items = list(self.container.query_items(
                query=query,
                enable_cross_partition_query=True
            ))
            return items[0] if items else None
        except CosmosHttpResponseError as e:
            print(f"Error getting evaluation result: {e}")
            return None
