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
        """Create HTML email content that matches frontend styling"""
        filter_info = ""
        if user_filters:
            filter_info = f"""
            <div style="background: linear-gradient(to right, #dbeafe, #e0e7ff); padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #bfdbfe;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">🎯 Your Search Criteria</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; color: #374151;">
                    <p style="margin: 0; font-size: 14px;"><strong>Industry:</strong> {user_filters.get('industry', 'Any')}</p>
                    <p style="margin: 0; font-size: 14px;"><strong>Region:</strong> {user_filters.get('region', 'Any')}</p>
                    <p style="margin: 0; font-size: 14px;"><strong>Stage:</strong> {user_filters.get('stage', 'Any')}</p>
                    <p style="margin: 0; font-size: 14px;"><strong>Founder Type:</strong> {user_filters.get('founderType', 'Any')}</p>
                </div>
                {f'<p style="margin: 10px 0 0 0; font-size: 14px; color: #059669;"><strong>Non-dilutive Only:</strong> Yes</p>' if user_filters.get('nonDilutiveOnly') else ''}
            </div>
            """
        
        # Calculate stats
        high_relevance = len([g for g in grants if g.get('relevance_score', 0) >= 80])
        avg_relevance = sum(g.get('relevance_score', 0) for g in grants) / len(grants) if grants else 0
        
        # Stats section
        stats_section = f"""
        <div style="background: linear-gradient(to right, #dbeafe, #f3e8ff); padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #bfdbfe;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">📊 Search Results Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="text-align: center; background: rgba(255,255,255,0.6); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #2563eb;">{len(grants)}</div>
                    <div style="font-size: 12px; color: #6b7280;">Total Grants</div>
                </div>
                <div style="text-align: center; background: rgba(255,255,255,0.6); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #059669;">{high_relevance}</div>
                    <div style="font-size: 12px; color: #6b7280;">High Relevance</div>
                </div>
                <div style="text-align: center; background: rgba(255,255,255,0.6); padding: 12px; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #7c3aed;">{int(avg_relevance)}%</div>
                    <div style="font-size: 12px; color: #6b7280;">Avg. Relevance</div>
                </div>
            </div>
        </div>
        """
        
        grants_html = ""
        for i, grant in enumerate(grants):
            # Get relevance score styling
            relevance_score = grant.get('relevance_score', 0)
            if relevance_score >= 80:
                relevance_bg = "#dcfce7"
                relevance_color = "#166534"
            elif relevance_score >= 60:
                relevance_bg = "#fef3c7"
                relevance_color = "#92400e"
            else:
                relevance_bg = "#f3f4f6"
                relevance_color = "#374151"
            
            # Get funding category icon
            category_icons = {
                'government': '🏛️',
                'academic': '🎓', 
                'corporate': '🏢',
                'foundation': '🌟'
            }
            category_icon = category_icons.get(grant.get('funding_category', 'other'), '💼')
            
            # Get deadline urgency styling
            urgency = grant.get('deadline_urgency', 'moderate')
            if urgency == 'urgent':
                urgency_bg = "#fecaca"
                urgency_color = "#991b1b"
                urgency_icon = "⚡"
            elif urgency == 'moderate':
                urgency_bg = "#fed7aa"
                urgency_color = "#c2410c"
                urgency_icon = "⏰"
            else:
                urgency_bg = "#dbeafe"
                urgency_color = "#1d4ed8"
                urgency_icon = "📅"
            
            # Match reasons
            match_reasons = grant.get('match_reasons', [])
            match_reasons_html = ""
            if match_reasons:
                match_reasons_html = f"""
                <div style="background: linear-gradient(to right, #d1fae5, #dbeafe); padding: 12px; border-radius: 8px; margin: 15px 0; border: 1px solid #86efac;">
                    <p style="margin: 0 0 8px 0; color: #065f46; font-weight: bold; font-size: 14px;">🎯 Why this grant matches:</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        {' '.join([f'<span style="background: rgba(255,255,255,0.7); padding: 4px 8px; border-radius: 12px; font-size: 12px; color: #047857;">{reason}</span>' for reason in match_reasons[:3]])}
                    </div>
                </div>
                """
            
            grants_html += f"""
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; background-color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <!-- Header with badges -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        <span style="background: {relevance_bg}; color: {relevance_color}; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                            {relevance_score}% match
                        </span>
                        <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                            {category_icon} {grant.get('source', 'Unknown')}
                        </span>
                        <span style="background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 12px; font-size: 12px;">
                            🌍 {grant.get('country', 'Unknown')}
                        </span>
                        <span style="background: {urgency_bg}; color: {urgency_color}; padding: 4px 10px; border-radius: 12px; font-size: 12px;">
                            {urgency_icon} {urgency.title()}
                        </span>
                    </div>
                </div>
                
                <!-- Title -->
                <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 20px; font-weight: 600; line-height: 1.3;">
                    {grant.get('title', 'Grant Opportunity')}
                </h3>
                
                {match_reasons_html}
                
                <!-- Amount and Deadline -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 16px; background: #f9fafb; border-radius: 8px;">
                    <div>
                        <div style="font-size: 24px; font-weight: bold; color: #111827;">💰 {grant.get('amount', 'Amount varies')}</div>
                        <div style="font-size: 14px; color: #6b7280;">funding available</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 14px; color: #6b7280;">⏰ Deadline</div>
                        <div style="font-size: 16px; font-weight: 600; color: #111827;">{grant.get('deadline', 'Not specified')}</div>
                    </div>
                </div>
                
                <!-- Description -->
                {f'<p style="color: #4b5563; margin: 12px 0; line-height: 1.5;">{grant.get("description", "")}</p>' if grant.get('description') else ''}
                
                <!-- Details -->
                <div style="margin: 16px 0;">
                    <p style="color: #374151; margin: 8px 0; font-size: 14px;"><strong>Eligibility:</strong> {grant.get('eligibility', 'Check requirements')}</p>
                    <p style="color: #374151; margin: 8px 0; font-size: 14px;"><strong>Sector:</strong> {grant.get('sector', 'Various')}</p>
                </div>
                
                <!-- Apply Button -->
                <div style="margin-top: 20px;">
                    <a href="{grant.get('apply_link', '#')}" 
                       style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        📝 Apply Now
                    </a>
                </div>
            </div>
            """

        html = f"""
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your Grant Digest</title>
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px; color: white;">
                    <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">🚀 Your Grant Digest</h1>
                    <p style="margin: 0; font-size: 18px; opacity: 0.9;">Personalized funding opportunities curated by AI</p>
                    <div style="margin-top: 15px; font-size: 14px; opacity: 0.8;">
                        Powered by AI + Web Exploration
                    </div>
                </div>
                
                {filter_info}
                
                {stats_section}
                
                <!-- Grants Section -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">🎯 Your Personalized Grants</h2>
                    {grants_html}
                </div>
                
                <!-- Footer -->
                <div style="border-top: 2px solid #e5e7eb; padding: 25px 20px; margin-top: 40px; text-align: center; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <p style="margin: 0 0 10px 0; color: #374151; font-size: 16px; font-weight: 600;">🤖 Generated by your AI Grant Finder Agent</p>
                    <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">This digest contains real grants from verified sources with working application links.</p>
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; font-size: 16px; font-weight: 600;">
                        Happy funding! 🎉💰
                    </div>
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
