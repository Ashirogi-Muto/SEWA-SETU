"""
AWS Bedrock Service for SewaSetu

This module provides intelligent report analysis using Amazon Bedrock
with Claude 3.5 Sonnet for multilingual civic issue classification.
"""
import json
import re

from backend.aws_config import get_aws_client


class BedrockAgent:
    """
    Intelligent agent for analyzing civic reports using AWS Bedrock.
    
    This agent uses Claude 3.5 Sonnet to:
    - Translate regional Indian languages to English
    - Classify reports into civic categories
    - Assess priority levels based on safety concerns
    - Analyze sentiment and urgency
    """
    
    def __init__(self):
        """Initialize the Bedrock agent with a runtime client."""
        self.client = get_aws_client('bedrock-runtime')
        self.model_id = 'anthropic.claude-3-5-sonnet-20240620-v1:0'
        print(f"🤖 BedrockAgent initialized with model: {self.model_id}")
    
    def analyze_report(self, text: str) -> dict:
        """
        Analyze a civic report using Claude 3.5 Sonnet via AWS Bedrock.
        
        This method:
        1. Translates the input text to professional English (if needed)
        2. Classifies the report into a civic category
        3. Assesses the priority level
        4. Analyzes the sentiment
        
        Args:
            text (str): The civic report text (can be in any Indian language)
        
        Returns:
            dict: Analysis results containing:
                - translated_text (str): Professional English translation
                - category (str): One of [Roads, Sanitation, Water Supply, 
                                         Electricity, Law & Order, Others]
                - priority (str): One of [High, Medium, Low]
                - sentiment (str): One of [Urgent, Frustrated, Neutral]
        
        Raises:
            Exception: If the Bedrock API call fails or response parsing fails
        
        Example:
            >>> agent = BedrockAgent()
            >>> result = agent.analyze_report("सड़क पर गड्ढा है")
            >>> print(result['category'])
            'Roads'
        """
        try:
            # Construct the prompt for Claude
            prompt = f"""You are an intelligent agent for 'SewaSetu', an Indian civic reporting system.
Input: '{text}'
Task:
1. Translate the text to professional English.
2. Classify into ONE category: [Roads, Sanitation, Water Supply, Electricity, Law & Order, Others].
3. Assess Priority: [High, Medium, Low] (High = safety risks like open wires, accidents, fire).
4. Sentiment: [Urgent, Frustrated, Neutral].

Return JSON ONLY (no markdown formatting):
{{
  "translated_text": "...",
  "category": "...",
  "priority": "...",
  "sentiment": "..."
}}"""

            # Prepare the request body for Claude 3.5 Sonnet
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "temperature": 0.1,  # Low temperature for consistent categorization
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            print(f"📤 Sending report to Bedrock: '{text[:50]}...'")
            
            # Invoke the Bedrock model
            response = self.client.invoke_model(
                modelId=self.model_id,
                body=json.dumps(request_body)
            )
            
            # Parse the response
            response_body = json.loads(response['body'].read().decode('utf-8'))
            
            # Extract the text content from Claude's response
            # Claude returns: {"content": [{"type": "text", "text": "..."}], ...}
            claude_text = response_body['content'][0]['text']
            
            print(f"📥 Raw Claude response: {claude_text[:100]}...")
            
            # Parse the JSON from Claude's response
            # Handle case where Claude wraps response in ```json ... ```
            analysis_result = self._parse_claude_json(claude_text)
            
            print(f"✅ Analysis complete - Category: {analysis_result.get('category')}, "
                  f"Priority: {analysis_result.get('priority')}")
            
            return analysis_result
            
        except Exception as e:
            print(f"❌ Error in BedrockAgent.analyze_report: {e}")
            # Return a fallback response
            return {
                "translated_text": text,
                "category": "Others",
                "priority": "Medium",
                "sentiment": "Neutral",
                "error": str(e)
            }
    
    def _parse_claude_json(self, text: str) -> dict:
        """
        Parse JSON from Claude's response, handling markdown code blocks.
        
        Claude sometimes wraps JSON in ```json ... ``` blocks. This method
        strips those markers and parses the clean JSON.
        
        Args:
            text (str): The text response from Claude
        
        Returns:
            dict: Parsed JSON dictionary
        
        Raises:
            json.JSONDecodeError: If the text is not valid JSON
        """
        # Remove markdown code block formatting if present
        # Pattern matches: ```json\n{...}\n``` or ```{...}```
        cleaned_text = text.strip()
        
        # Check if wrapped in markdown code blocks
        if cleaned_text.startswith('```'):
            # Remove opening ```json or ```
            cleaned_text = re.sub(r'^```(?:json)?\s*\n?', '', cleaned_text)
            # Remove closing ```
            cleaned_text = re.sub(r'\n?```\s*$', '', cleaned_text)
        
        # Parse the JSON
        try:
            result = json.loads(cleaned_text)
            return result
        except json.JSONDecodeError as e:
            print(f"⚠️  JSON parsing error: {e}")
            print(f"⚠️  Attempted to parse: {cleaned_text[:200]}...")
            # Try to extract JSON using regex as fallback
            json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', cleaned_text)
            if json_match:
                return json.loads(json_match.group(0))
            raise


# Singleton instance for easy access
_bedrock_agent_instance = None


def get_bedrock_agent() -> BedrockAgent:
    """
    Get a singleton instance of the BedrockAgent.
    
    This ensures we don't create multiple Bedrock clients unnecessarily.
    
    Returns:
        BedrockAgent: The singleton BedrockAgent instance
    """
    global _bedrock_agent_instance
    if _bedrock_agent_instance is None:
        _bedrock_agent_instance = BedrockAgent()
    return _bedrock_agent_instance


# Test function for development
if __name__ == "__main__":
    print("Testing BedrockAgent")
    print("=" * 60)
    
    agent = BedrockAgent()
    
    # Test with Hindi text
    test_report = "सड़क पर बहुत बड़ा गड्ढा है जिससे एक्सीडेंट हो सकता है"
    print(f"\nTest Report: {test_report}")
    print("-" * 60)
    
    result = agent.analyze_report(test_report)
    print("\nAnalysis Result:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
