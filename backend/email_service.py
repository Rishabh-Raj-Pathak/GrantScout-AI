import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os

load_dotenv('../.env')

class EmailService:
    def __init__(self):
        # Gmail SMTP setup using environment variables
        self.smtp_server = "smtp.gmail.com"
        self.port = 587
        self.sender_email = os.getenv('SENDER_EMAIL', '')
        self.password = os.getenv('EMAIL_PASSWORD', '')
        
        # Check if email credentials are configured
        self.email_configured = bool(self.sender_email and self.password)
        
    def send_grant_digest(self, recipient_email, grants, user_filters=None):
        """Send grant digest email to user"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = "🎁 Your Personalized Grant Digest"
            message["From"] = self.sender_email
            message["To"] = recipient_email

            # Create HTML content
            html = self._create_email_html(grants, user_filters)
            
            # Turn HTML into MIMEText object
            html_part = MIMEText(html, "html")
            message.attach(html_part)

            # Create secure connection and send email
            context = ssl.create_default_context()
            
            if self.email_configured:
                # Actually send the email
                try:
                    with smtplib.SMTP(self.smtp_server, self.port) as server:
                        server.starttls(context=context)
                        server.login(self.sender_email, self.password)
                        server.sendmail(self.sender_email, recipient_email, message.as_string())
                    
                    print(f"✅ EMAIL SENT SUCCESSFULLY TO: {recipient_email}")
                    return {
                        'success': True,
                        'message': f'Grant digest sent successfully to {recipient_email}'
                    }
                except Exception as email_error:
                    print(f"❌ EMAIL SENDING FAILED: {str(email_error)}")
                    return {
                        'success': False,
                        'message': f'Failed to send email: {str(email_error)}'
                    }
            else:
                # Demo mode - print email content
                print(f"📧 DEMO MODE - EMAIL WOULD BE SENT TO: {recipient_email}")
                print(f"📧 EMAIL CONTENT:")
                print(html)
                print("=" * 50)
                print("💡 To enable real email sending, add SENDER_EMAIL and EMAIL_PASSWORD to your .env file")
                
                return {
                    'success': True,
                    'message': f'Demo: Grant digest would be sent to {recipient_email} (email not configured)'
                }
            
        except Exception as e:
            return {
                'success': False,
                'message': f'Failed to send email: {str(e)}'
            }
    
    def _create_email_html(self, grants, user_filters=None):
        """Create HTML email content"""
        filter_info = ""
        if user_filters:
            filter_info = f"""
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #495057; margin: 0 0 10px 0;">Your Search Criteria:</h3>
                <p style="margin: 5px 0; color: #6c757d;">
                    <strong>Country:</strong> {user_filters.get('country', 'Any')}<br>
                    <strong>Sector:</strong> {user_filters.get('sector', 'Any')}<br>
                    <strong>Stage:</strong> {user_filters.get('stage', 'Any')}<br>
                    <strong>Founder Type:</strong> {user_filters.get('founderType', 'Any')}
                </p>
            </div>
            """
        
        grants_html = ""
        for grant in grants:
            grants_html += f"""
            <div style="border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; background-color: white;">
                <h3 style="color: #212529; margin: 0 0 15px 0;">{grant['title']}</h3>
                <div style="margin-bottom: 15px;">
                    <span style="font-size: 24px; font-weight: bold; color: #28a745;">{grant['amount']}</span>
                    <span style="color: #6c757d; font-size: 14px;"> funding available</span>
                </div>
                <div style="margin-bottom: 15px;">
                    <span style="background-color: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-right: 8px;">📍 {grant['country']}</span>
                    <span style="background-color: #f3e5f5; color: #7b1fa2; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-right: 8px;">🏭 {grant['sector']}</span>
                    <span style="background-color: #fff3e0; color: #f57c00; padding: 4px 8px; border-radius: 12px; font-size: 12px;">⏰ {grant['deadline']}</span>
                </div>
                <p style="color: #495057; margin: 10px 0;"><strong>Eligibility:</strong> {grant['eligibility']}</p>
                <p style="color: #495057; margin: 10px 0;"><strong>Source:</strong> {grant['source']}</p>
                <a href="{grant['apply_link']}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">📝 Apply Now</a>
            </div>
            """

        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #007bff; margin-bottom: 10px;">🚀 Your Grant Digest</h1>
                    <p style="color: #6c757d; font-size: 16px;">Personalized funding opportunities curated by AI</p>
                </div>
                
                {filter_info}
                
                <h2 style="color: #495057;">Found {len(grants)} Grant{'s' if len(grants) != 1 else ''}</h2>
                
                {grants_html}
                
                <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
                    <p>This digest was generated by your AI-powered Grant Finder Agent.</p>
                    <p>Happy funding! 🎉</p>
                </div>
            </body>
        </html>
        """
        
        return html

# Test function
def test_email_service():
    """Test the email service with sample data"""
    email_service = EmailService()
    
    sample_grants = [
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
        }
    ]
    
    sample_filters = {
        'country': 'United States',
        'sector': 'Technology',
        'stage': 'Seed',
        'founderType': 'Student-led'
    }
    
    # Use the configured sender email as recipient for testing
    test_recipient = os.getenv('SENDER_EMAIL', 'test@example.com')
    
    result = email_service.send_grant_digest(
        test_recipient,
        sample_grants,
        sample_filters
    )
    
    print("Email Service Test Result:", result)
    return result

if __name__ == '__main__':
    test_email_service()
