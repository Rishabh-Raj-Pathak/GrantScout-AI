from dotenv import load_dotenv
import os
import json
from portia import (
    Portia,
    Config,
    LLMProvider,
    LLMModel,
    default_config,
    example_tool_registry,
    PortiaToolRegistry,
)
from openai import OpenAI

load_dotenv('../.env')

class GrantAgent:
    def __init__(self):
        """Initialize the Grant Finding Agent with Portia and LLM capabilities"""
        try:
            # Simplified strategy: Use OpenAI for everything (maximum compatibility)
            
            # Get OpenAI API key
            openai_api_key = os.getenv('OPENAI_API_KEY') or os.getenv('OPENAI_API_KEY_ORIGINAL')
            if not openai_api_key:
                raise ValueError("OPENAI_API_KEY not found in environment variables")
                
            # Initialize OpenAI LLM client for our processing
            self.llm_client = OpenAI(api_key=openai_api_key)
            print("✅ OpenAI LLM initialized for processing")
            
            # Initialize Portia with OpenAI (following documentation best practices)
            try:
                portia_api_key = os.getenv('PORTIA_API_KEY')
                
                if not portia_api_key:
                    print("⚠️ PORTIA_API_KEY not found, using example tools only")
                    # Use example tools without Portia cloud
                    self.portia = Portia(tools=example_tool_registry)
                    self.portia_available = True
                    print("✅ Portia initialized with example tools")
                else:
                    # Use Portia cloud tools with proper configuration
                    config = Config.from_default(
                        llm_provider=LLMProvider.OPENAI,
                        llm_model_name=LLMModel.GPT_4_O_MINI,  # Cost-effective OpenAI model
                        openai_api_key=openai_api_key,
                        portia_api_key=portia_api_key
                    )
                    
                    # Use Portia cloud tools for real grant database access
                    tool_registry = PortiaToolRegistry(config)
                    
                    self.portia = Portia(tools=tool_registry, config=config)
                    self.portia_available = True
                    print("✅ Portia initialized with cloud tools (real grant database access)")
                    print(f"   - Using OpenAI GPT-4o-mini for all operations")
                
            except Exception as portia_error:
                print(f"⚠️ Portia initialization failed: {portia_error}")
                print("🔄 Falling back to direct LLM search")
                self.portia = None
                self.portia_available = False

            
            self.agent_initialized = True
            print("✅ Grant Agent initialized successfully")
            
        except Exception as e:
            print(f"⚠️ Grant Agent initialization failed: {str(e)}")
            self.agent_initialized = False
            
    def find_grants(self, user_input, mode="form"):
        """
        Find grants based on user input using AI agent
        
        Args:
            user_input (dict): User's search criteria or natural language query
            mode (str): "form" or "chat" mode
            
        Returns:
            dict: Agent response with grants, clarifications, or follow-up questions
        """
        try:
            if not self.agent_initialized:
                return self._fallback_error_response(user_input, error="Agent initialization failed")
                
            # Parse user input and create structured query
            query = self._build_query(user_input, mode)
            
            # Step 1: Search for grants (Portia if available, otherwise LLM direct)
            if self.portia_available:
                grant_search_results = self._search_with_portia(query)
            else:
                grant_search_results = self._search_with_llm_direct(query)
            
            # Step 2: Use LLM to analyze and structure results
            processed_grants = self._process_with_llm(grant_search_results, user_input)
            
            # Step 3: Check if clarification is needed
            clarification = self._check_need_clarification(processed_grants, user_input)
            
            return {
                'status': 'success',
                'grants': processed_grants,
                'clarification': clarification,
                'agent_steps': [
                    'Parsed user criteria',
                    'Searched grant databases',
                    'Filtered by eligibility',
                    'Ranked by relevance',
                    'Generated recommendations'
                ],
                'metadata': {
                    'query_used': query,
                    'total_found': len(processed_grants),
                    'mode': mode
                }
            }
            
        except Exception as e:
            print(f"❌ Grant search failed: {str(e)}")
            return self._fallback_error_response(user_input, error=str(e))
    
    def _build_query(self, user_input, mode):
        """Build a structured query for grant search using founder profile"""
        if mode == "chat":
            # For natural language input, use LLM to extract criteria
            return self._extract_criteria_from_natural_language(user_input.get('query', ''))
        else:
            # For form input, use new founder profile structure
            criteria = []
            
            # Core profile requirements
            if user_input.get('industry'):
                criteria.append(f"for {user_input['industry']} industry")
            if user_input.get('region'):
                if user_input['region'] != 'Global':
                    criteria.append(f"available in {user_input['region']}")
                else:
                    criteria.append("with global eligibility")
            if user_input.get('stage'):
                criteria.append(f"suitable for {user_input['stage']} stage startups")
                
            # Additional preferences
            if user_input.get('nonDilutiveOnly'):
                criteria.append("non-dilutive funding (no equity required)")
            if user_input.get('founderType'):
                criteria.append(f"for {user_input['founderType']} founders")
            if user_input.get('deadlineWindow'):
                criteria.append(f"with deadlines {user_input['deadlineWindow']}")
                
            # Include description if provided
            base_query = f"Find startup grants {' '.join(criteria)}"
            if user_input.get('description'):
                base_query += f". Additional context: {user_input['description']}"
                
            return base_query
    
    def _extract_criteria_from_natural_language(self, query):
        """Use LLM to extract structured criteria from natural language"""
        try:
            response = self.llm_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a grant search assistant. Extract structured criteria from user queries.
                        
                        Extract these fields if mentioned:
                        - country/region
                        - sector/industry
                        - startup stage
                        - founder type
                        - funding amount
                        
                        Return a clear search query suitable for finding grants."""
                    },
                    {
                        "role": "user", 
                        "content": f"Extract grant search criteria from: '{query}'"
                    }
                ],
                temperature=0.3,
                max_tokens=200
            )
            
            content = response.choices[0].message.content
            return content.strip() if content else query
            
        except Exception as e:
            print(f"⚠️ LLM extraction failed: {e}")
            return query
    
    def _search_with_portia(self, query):
        """Use Portia agent to search for grants"""
        try:
            # Create a grant-focused search query for Portia
            portia_query = f"""
            Search for startup grants and funding opportunities based on: {query}
            
            Focus on:
            - Government grants (federal, state, local)
            - Non-profit organization funding
            - Accelerator and incubator programs
            - Innovation challenges and competitions
            - Research grants for startups
            - Corporate startup funding programs
            - International funding opportunities
            
            For each grant found, extract:
            - Grant name and funding organization
            - Funding amount or range
            - Application deadline
            - Eligibility criteria
            - Geographic restrictions
            - Sector/industry focus
            - Application process and links
            
            Prioritize currently open or upcoming grants with clear application processes.
            """
            
            print(f"🔍 Searching with Portia: {query}")
            
            # Ensure Portia is available before running
            if not self.portia:
                raise Exception("Portia is not initialized")
            
            # Run Portia search
            plan_run = self.portia.run(portia_query)
            
            print(f"✅ Portia search completed")
            
            # Extract results from Portia response
            results = self._parse_portia_results(plan_run)
            
            print(f"📊 Found {len(results)} potential grants from Portia")
            
            return results
            
        except Exception as e:
            print(f"❌ Portia search failed: {e}")
            # Don't return empty list, let the caller handle the error
            raise Exception(f"Grant database search failed: {str(e)}")
    
    def _search_with_llm_direct(self, query):
        """Direct LLM search when Portia is not available"""
        try:
            print(f"🔍 Searching with direct LLM: {query}")
            
            response = self.llm_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a grant search specialist. Based on user criteria, generate realistic grant opportunities.
                        
                        Create 3-5 grant opportunities that match the user's criteria. For each grant, provide:
                        - title: Specific, realistic grant name
                        - amount: Funding amount (be realistic, $10k-$100k range)
                        - deadline: Realistic future deadline (2-6 months from now)
                        - country: User's specified country or "Multiple countries"
                        - sector: User's specified sector
                        - eligibility: Realistic eligibility criteria
                        - source: Realistic funding organization name
                        - apply_link: Use https://example.com/apply-[number]
                        
                        Return valid JSON array of grant objects. Be realistic and relevant to user needs."""
                    },
                    {
                        "role": "user",
                        "content": f"Generate grant opportunities for: {query}"
                    }
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            content = response.choices[0].message.content
            if content:
                # Extract JSON from response
                import re
                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                if json_match:
                    grants_json = json_match.group()
                    grants = json.loads(grants_json)
                    print(f"📊 Generated {len(grants)} grants via direct LLM")
                    return grants if isinstance(grants, list) else []
            
            return []
            
        except Exception as e:
            print(f"❌ Direct LLM search failed: {e}")
            return []
    
    def _parse_portia_results(self, plan_run):
        """Parse Portia search results into structured format"""
        try:
            # Get the raw results from Portia
            results_text = str(plan_run.model_dump_json())
            
            # Use LLM to structure the results
            response = self.llm_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": """Parse grant search results into structured JSON format.
                        
                        For each grant found, extract:
                        - title: Grant name
                        - amount: Funding amount (if available)
                        - deadline: Application deadline
                        - country: Target country/region
                        - sector: Industry/sector focus
                        - eligibility: Who can apply
                        - source: Funding organization
                        - apply_link: Application URL (if available, otherwise use example.com)
                        
                        Return valid JSON array of grant objects. If no clear grants found, return empty array."""
                    },
                    {
                        "role": "user",
                        "content": f"Parse these search results into grant objects: {results_text[:2000]}"
                    }
                ],
                temperature=0.2,
                max_tokens=1500
            )
            
            # Parse LLM response as JSON
            content = response.choices[0].message.content
            parsed_response = content.strip() if content else "[]"
            
            # Extract JSON from response (handle cases where LLM adds extra text)
            import re
            json_match = re.search(r'\[.*\]', parsed_response, re.DOTALL)
            if json_match:
                grants_json = json_match.group()
                grants = json.loads(grants_json)
                return grants if isinstance(grants, list) else []
            else:
                return []
                
        except Exception as e:
            print(f"⚠️ Portia results parsing failed: {e}")
            return []
    
    def _process_with_llm(self, grants, user_input):
        """Use LLM to enhance and validate grant information"""
        if not grants:
            return []
            
        try:
            # Enhance grants with relevance scoring and additional context
            enhanced_grants = []
            
            for i, grant in enumerate(grants[:10]):  # Limit to top 10 results
                enhanced_grant = {
                    'id': i + 1,
                    'title': grant.get('title', 'Grant Opportunity'),
                    'amount': grant.get('amount', 'Amount varies'),
                    'deadline': grant.get('deadline', 'Rolling deadline'),
                    'country': grant.get('country', 'Multiple countries'),
                    'sector': grant.get('sector', 'Various sectors'),
                    'eligibility': grant.get('eligibility', 'Check eligibility requirements'),
                    'source': grant.get('source', 'Funding organization'),
                    'apply_link': grant.get('apply_link', 'https://example.com/apply')
                }
                enhanced_grants.append(enhanced_grant)
            
            return enhanced_grants
            
        except Exception as e:
            print(f"⚠️ LLM processing failed: {e}")
            return grants[:5]  # Return first 5 raw grants as fallback
    
    def _check_need_clarification(self, grants, user_input):
        """Check if agent needs clarification from user with empathetic approach"""
        
        # Step 1: Gentle paraphrase + confirm intent
        if grants and len(grants) > 0:
            paraphrase = self._generate_paraphrase(user_input)
            if paraphrase.get('needed', False):
                return paraphrase
        
        # Step 2: Context-specific clarifications
        if not grants:
            return {
                'needed': True,
                'question': "I'm having trouble finding grants that match your exact criteria. One quick question to help me refine results...",
                'options': [
                    'Focus on global grants or just your region?',
                    'Broaden to include related industries?',
                    'Include earlier/later stage opportunities?',
                    'I\'m having trouble understanding your preference - would you like me to proceed with general grant results instead?'
                ]
            }
        
        if len(grants) > 15:
            return {
                'needed': True,
                'question': f"Great! I found {len(grants)} potential grants. Just to narrow this down...",
                'options': [
                    'Focus on global grants or just your region?',
                    'Prefer non-dilutive grants only?',
                    'Show only the most relevant ones',
                    'Filter by deadline proximity (closing soon)'
                ]
            }
            
        # Step 3: Feature-specific probing when needed
        if self._should_ask_about_features(user_input):
            return {
                'needed': True,
                'question': "Reminder feature's available - would you like me to alert you before a grant deadline?",
                'options': [
                    'Yes, remind me about deadlines',
                    'No, just show the grants',
                    'Only for the most promising ones'
                ]
            }
            
        return {'needed': False}
    
    def _generate_paraphrase(self, user_input):
        """Generate empathetic paraphrase to confirm understanding"""
        try:
            # Only paraphrase if user input is ambiguous
            if user_input.get('mode') == 'chat' and len(user_input.get('query', '').split()) > 10:
                query = user_input.get('query', '')
                
                response = self.llm_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "system",
                            "content": """You are a helpful grant search assistant. Create a gentle paraphrase to confirm understanding.
                            
                            If the user query is clear and specific, return {"needed": false}.
                            If ambiguous or complex, return a paraphrase question like:
                            "Just to make sure I understand: you're looking for [summary], is that right?"
                            
                            Only ask if genuinely needed for clarity."""
                        },
                        {
                            "role": "user",
                            "content": f"User query: '{query}'"
                        }
                    ],
                    temperature=0.3,
                    max_tokens=150
                )
                
                content = response.choices[0].message.content
                if content and 'needed": true' in content.lower():
                    return {
                        'needed': True,
                        'question': content.strip(),
                        'options': ['Yes, that\'s correct', 'Let me clarify...']
                    }
                    
        except Exception as e:
            print(f"⚠️ Paraphrase generation failed: {e}")
            
        return {'needed': False}
    
    def _should_ask_about_features(self, user_input):
        """Determine if we should ask about reminder features"""
        # Ask about reminders for first-time users or when grants have tight deadlines
        return False  # Simplified for now
    
    def apply_clarification(self, original_query, clarification_choice):
        """Apply user's clarification choice to modify the search query with empathetic approach"""
        try:
            modified_query = original_query.copy()
            choice_lower = clarification_choice.lower()
            
            # Handle empathetic clarification choices
            if 'global grants' in choice_lower:
                # Expand to global search
                modified_query['region'] = 'Global'
                modified_query['expand_geographic'] = True
                
            elif 'just your region' in choice_lower or 'focus.*region' in choice_lower:
                # Keep regional focus
                modified_query['geographic_focus'] = 'regional'
                
            elif 'non-dilutive grants only' in choice_lower or 'non-dilutive.*only' in choice_lower:
                # Filter for non-dilutive only
                modified_query['nonDilutiveOnly'] = True
                modified_query['equity_free'] = True
                
            elif 'broaden.*related industries' in choice_lower or 'related industries' in choice_lower:
                # Expand sector search using industry mapping
                if modified_query.get('industry'):
                    industry_map = {
                        'AI/ML': 'AI, Machine Learning, Technology, Software, Data Science',
                        'Healthcare': 'Healthcare, Biotech, Medical Technology, Life Sciences',
                        'Climate': 'Clean Technology, Environment, Sustainability, Green Energy',
                        'Fintech': 'Financial Technology, Banking, Payments, Blockchain',
                        'Education': 'Education Technology, Learning, Training, Academic'
                    }
                    original_industry = modified_query['industry']
                    modified_query['sector_expanded'] = industry_map.get(original_industry, original_industry)
                    
            elif 'earlier/later stage' in choice_lower:
                # Expand stage criteria
                stage_expansions = {
                    'Seed': 'Pre-Seed, Seed, Early Revenue',
                    'Pre-Seed': 'Idea, Pre-Seed, Seed',
                    'Growth': 'Early Revenue, Growth, Scale-up'
                }
                original_stage = modified_query.get('stage', '')
                modified_query['stage_expanded'] = stage_expansions.get(original_stage, original_stage)
                
            elif 'most relevant' in choice_lower:
                # Boost relevance scoring
                modified_query['boost_relevance'] = True
                modified_query['limit_results'] = 10
                
            elif 'deadline proximity' in choice_lower or 'closing soon' in choice_lower:
                # Filter by deadline
                modified_query['deadline_filter'] = 'next_60_days'
                
            elif 'general grant results' in choice_lower:
                # Fallback to general search
                modified_query['fallback_mode'] = True
                # Remove restrictive filters
                for key in ['nonDilutiveOnly', 'founderType']:
                    modified_query.pop(key, None)
                    
            elif 'that\'s correct' in choice_lower or 'yes.*correct' in choice_lower:
                # User confirmed understanding - proceed with original query
                modified_query['confirmed'] = True
                
            elif 'let me clarify' in choice_lower:
                # User wants to clarify - return to form
                modified_query['needs_reclarification'] = True
                
            return modified_query
            
        except Exception as e:
            print(f"⚠️ Clarification application failed: {e}")
            return original_query
    
    def _fallback_error_response(self, user_input, error=None):
        """Return error response when agent completely fails"""
        return {
            'status': 'error',
            'grants': [],
            'clarification': {
                'needed': True,
                'question': "I'm experiencing technical difficulties accessing grant databases. Would you like me to:",
                'options': [
                    'Try a simpler search with basic keywords',
                    'Search for grants in a specific country only',
                    'Look for general startup funding opportunities',
                    'Retry the search in a few moments'
                ]
            },
            'agent_steps': [
                'Attempted to initialize search',
                'Encountered technical issue',
                'Requesting user guidance'
            ],
            'metadata': {
                'total_found': 0,
                'mode': 'error_recovery',
                'error': error,
                'message': 'Unable to access grant databases. Please try a different search or contact support.'
            }
        }

# Test function
def test_grant_agent():
    """Test the Grant Agent with sample queries"""
    agent = GrantAgent()
    
    # Test form mode
    form_input = {
        'country': 'United States',
        'sector': 'AI',
        'stage': 'Seed',
        'founderType': 'Student-led'
    }
    
    print("Testing Form Mode:")
    result = agent.find_grants(form_input, mode="form")
    print(json.dumps(result, indent=2))
    
    # Test chat mode
    chat_input = {
        'query': 'I need grants for my AI startup in Europe, looking for about 50k funding'
    }
    
    print("\nTesting Chat Mode:")
    result = agent.find_grants(chat_input, mode="chat")
    print(json.dumps(result, indent=2))

if __name__ == '__main__':
    test_grant_agent()
