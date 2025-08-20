from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from email_service import EmailService

# Load environment variables from root directory
load_dotenv('../.env')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize email service
email_service = EmailService()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Startup Grant Finder Agent API',
        'status': 'running',
        'version': '1.0.0'
    })

@app.route('/process-input', methods=['POST'])
def process_input():
    """Process user input and return mock response for now"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Mock response for testing
        mock_grants = [
            {
                'id': 1,
                'title': 'Young Entrepreneurs Grant',
                'amount': '$50,000',
                'deadline': '2025-03-15',
                'country': 'USA',
                'sector': 'Technology',
                'eligibility': 'Student-led startups under 25',
                'source': 'SBA Youth Program',
                'apply_link': 'https://example.com/apply1'
            },
            {
                'id': 2,
                'title': 'Innovation Catalyst Fund',
                'amount': '$25,000',
                'deadline': '2025-04-30',
                'country': 'Canada',
                'sector': 'AI/ML',
                'eligibility': 'Early-stage tech companies',
                'source': 'Canadian Innovation Fund',
                'apply_link': 'https://example.com/apply2'
            }
        ]
        
        return jsonify({
            'status': 'success',
            'input_received': data,
            'grants': mock_grants,
            'message': 'Mock data returned successfully'
        })
        
    except Exception as e:
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

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
