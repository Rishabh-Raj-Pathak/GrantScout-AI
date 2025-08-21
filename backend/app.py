from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from email_service import EmailService
from grant_agent import GrantAgent

# Load environment variables from root directory
load_dotenv('../.env')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize services
email_service = EmailService()
grant_agent = GrantAgent()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Startup Grant Finder Agent API',
        'status': 'running',
        'version': '1.0.0'
    })

@app.route('/process-input', methods=['POST'])
def process_input():
    """Process user input using AI Grant Agent"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Determine the mode (form or chat)
        mode = data.get('mode', 'form')
        
        # Use Grant Agent to find grants
        agent_result = grant_agent.find_grants(data, mode)
        
        # Return the agent's response
        return jsonify(agent_result)
        
    except Exception as e:
        print(f"❌ Process input error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/send-email', methods=['POST'])
def send_email():
    """Send grant digest email to user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        email = data.get('email')
        grants = data.get('grants', [])
        filters = data.get('filters', {})
        
        if not email:
            return jsonify({'error': 'Email address is required'}), 400
            
        if not grants:
            return jsonify({'error': 'No grants to send'}), 400
        
        # Send email
        result = email_service.send_grant_digest(email, grants, filters)
        
        if result['success']:
            return jsonify({
                'status': 'success',
                'message': result['message']
            })
        else:
            return jsonify({'error': result['message']}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/clarify', methods=['POST'])
def handle_clarification():
    """Handle agent clarification responses"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Get original query and selected clarification option
        original_query = data.get('original_query', {})
        clarification_choice = data.get('clarification_choice')
        
        # Modify query based on clarification and re-run search
        modified_query = grant_agent.apply_clarification(original_query, clarification_choice)
        agent_result = grant_agent.find_grants(modified_query, data.get('mode', 'form'))
        
        return jsonify(agent_result)
        
    except Exception as e:
        print(f"❌ Clarification error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
