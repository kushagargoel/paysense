import os
import json
import re
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Bedrock client
brt = boto3.client(
    "bedrock-runtime",
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
)

# Model ID for Claude - use standard model ID format
MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "global.anthropic.claude-sonnet-4-6")

# Load product data
with open('dummy_data.json', 'r') as f:
    DUMMY_DATA = json.load(f)


def create_system_prompt():
    """Create the system prompt for the AI concierge."""
    products_text = json.dumps(DUMMY_DATA['products'], indent=2)
    deals_text = json.dumps(DUMMY_DATA['deals'], indent=2)

    return f"""You are an AI Concierge for a trekking gear store called TrekShop. Help customers find trekking gear.

Available Products:
{products_text}

Available Deals:
{deals_text}

STRICT CONVERSATION FLOW - Follow this exactly:
1. GREETING: Greet warmly, ask what category they need (Footwear, Backpacks, Clothing, Accessories)
2. BRAND: Ask brand preference (Forclaz, Quechua, or No preference)
3. BUDGET: Ask their budget in INR
4. RECOMMEND: Show 2-3 matching products with name, price, and key features
5. DISCOUNT: Check for applicable deals and calculate final price
6. CHECKOUT: Guide to proceed with purchase

At each step, acknowledge what they said and ask the NEXT question in the flow. Never skip steps.

RESPONSE FORMAT - Return ONLY a JSON object:
{{
  "message": "Your conversational response to the user",
  "stage": "category_query|brand_query|budget_query|show_recommendations|discount_query|proceed_checkout",
  "extracted_category": "extracted or null",
  "extracted_brand": "extracted or null",
  "extracted_budget": number or null,
  "recommended_products": [{{"id": "TREK-100", "name": "...", "price": 4499, "category": "Footwear"}}] or [],
  "suggestions": [{{"label": "Button text", "value": "what_to_send_when_clicked"}}]
}}

STAGE TRANSITIONS AND SUGGESTIONS:
- category_query: After greeting, ask for category. Suggestions: 🥾 Trekking Shoes, 🎒 Backpacks, 🧥 Jackets, 🦯 Poles & Accessories
- brand_query: After category selected, ask for brand. Suggestions: Forclaz, Quechua, Any Brand
- budget_query: After brand selected, ask for budget. Suggestions: Under ₹3,000, Under ₹5,000, Under ₹8,000, No Limit
- show_recommendations: Show matching products. Suggestions: Check for Discounts, EMI Options, Proceed to Buy
- discount_query: Show discount info. Suggestions: Apply Discount, Continue without Discount
- proceed_checkout: Guide to checkout. Suggestions: Complete Purchase, Add More Items

Rules:
- Always return appropriate suggestions for the current stage
- Include relevant emoji in suggestion labels
- Make suggestions actionable and clear
- If user selects category, move to brand_query stage
- If user provides brand/preference, move to budget_query stage
- If user provides budget, find matching products and move to show_recommendations
- Only show products when budget is known
- Use exact product IDs and names from catalog
- Calculate EMI: price/6 months"""


def call_bedrock(messages, max_tokens=1024):
    """Call Bedrock with the given messages using Messages API format."""
    try:
        system_prompt = create_system_prompt()

        # Format messages for Claude Messages API
        formatted_messages = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", [{}])[0].get("text", "")
            if role not in ["user", "assistant"]:
                role = "user"
            formatted_messages.append({
                "role": role,
                "content": content
            })

        # Prepare the request body for Claude Messages API
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": max_tokens,
            "system": system_prompt,
            "messages": formatted_messages,
            "temperature": 0.5,  # Lower temperature for more consistent output
        }

        # Call Bedrock using invoke_model with Messages API
        response = brt.invoke_model(
            modelId=MODEL_ID,
            body=json.dumps(body)
        )

        # Parse the response
        response_body = json.loads(response['body'].read())
        content_blocks = response_body.get('content', [])
        if content_blocks and len(content_blocks) > 0:
            return content_blocks[0].get('text', '').strip()
        return ''

    except (ClientError, Exception) as e:
        print(f"ERROR: Can't invoke '{MODEL_ID}'. Reason: {e}")
        raise


def filter_products(category=None, brand=None, budget=None):
    """Filter products based on preferences."""
    products = DUMMY_DATA['products']

    if category:
        products = [p for p in products if p['category'].lower() == category.lower()]

    if brand and brand.lower() not in ['no preference', 'any', 'none']:
        products = [p for p in products if brand.lower() in p['name'].lower()]

    if budget:
        products = [p for p in products if p['price'] <= budget]

    # Sort by rating * reviews for best recommendations
    products.sort(key=lambda p: (p['rating'] * p['reviews']), reverse=True)

    return products[:3]  # Return top 3


def find_applicable_deals(product_ids):
    """Find deals applicable to given product IDs."""
    eligible_deals = []
    for deal_id, deal in DUMMY_DATA['deals'].items():
        eligible = [pid for pid in product_ids if pid in deal.get('eligible_products', [])]
        if eligible:
            eligible_deals.append({
                **deal,
                "id": deal_id,
                "eligibleProducts": eligible
            })
    return eligible_deals


@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint."""
    try:
        data = request.json
        user_message = data.get('message', '')
        conversation_history = data.get('history', [])
        current_stage = data.get('stage', 'category_query')
        preferences = data.get('preferences', {})

        # Build messages for the LLM
        messages = []

        # Add conversation context
        context = f"""Current conversation stage: {current_stage}
Extracted preferences so far:
- Category: {preferences.get('category', 'Not set')}
- Brand: {preferences.get('brand', 'Not set')}
- Budget: {preferences.get('budget', 'Not set')}

User message: {user_message}

Respond with a JSON object containing message, stage, extracted values, and recommended products if applicable."""

        messages.append({
            "role": "user",
            "content": [{"text": context}]
        })

        # Call Bedrock
        response_text = call_bedrock(messages)

        # Try to parse JSON response
        try:
            # Extract JSON from response (in case there's extra text)
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
            else:
                parsed = json.loads(response_text)

            message = parsed.get('message', response_text)
            stage = parsed.get('stage', current_stage)
            extracted_category = parsed.get('extracted_category')
            extracted_brand = parsed.get('extracted_brand')
            extracted_budget = parsed.get('extracted_budget')
            recommended_products = parsed.get('recommended_products', [])
            suggestions = parsed.get('suggestions', [])

        except (json.JSONDecodeError, Exception) as e:
            print(f"Failed to parse JSON response: {e}")
            # Fallback: use response as-is and determine stage locally
            message = response_text
            stage = current_stage
            extracted_category = None
            extracted_brand = None
            extracted_budget = None
            recommended_products = []
            suggestions = []

        # Update preferences based on extracted values
        updated_preferences = preferences.copy()
        if extracted_category:
            updated_preferences['category'] = extracted_category
        if extracted_brand:
            updated_preferences['brand'] = extracted_brand
        if extracted_budget:
            updated_preferences['budget'] = extracted_budget

        # If we're at recommendation stage but no products returned, filter locally
        if stage == 'show_recommendations' and not recommended_products:
            recommended_products = filter_products(
                updated_preferences.get('category'),
                updated_preferences.get('brand'),
                updated_preferences.get('budget')
            )

        # If LLM didn't provide suggestions, fallback to basic ones based on stage
        if not suggestions:
            if stage == 'category_query':
                suggestions = [
                    {"label": "🥾 Trekking Shoes", "value": "shoes"},
                    {"label": "🎒 Backpacks", "value": "backpacks"},
                    {"label": "🧥 Jackets", "value": "jackets"},
                    {"label": "🦯 Poles & Accessories", "value": "accessories"}
                ]
            elif stage == 'brand_query':
                suggestions = [
                    {"label": "Forclaz", "value": "forclaz"},
                    {"label": "Quechua", "value": "quechua"},
                    {"label": "Any Brand", "value": "no preference"}
                ]
            elif stage == 'budget_query':
                suggestions = [
                    {"label": "Under ₹3,000", "value": "3000"},
                    {"label": "Under ₹5,000", "value": "5000"},
                    {"label": "Under ₹8,000", "value": "8000"},
                    {"label": "No Limit", "value": "100000"}
                ]
            elif stage == 'show_recommendations':
                suggestions = [
                    {"label": "✅ Check for Discounts", "value": "discounts"},
                    {"label": "💳 EMI Options", "value": "emi"},
                    {"label": "Proceed to Buy", "value": "buy"}
                ]

        return jsonify({
            "success": True,
            "message": message,
            "stage": stage,
            "preferences": updated_preferences,
            "suggestions": suggestions,
            "products": recommended_products if recommended_products else None
        })

    except Exception as e:
        print(f"Error in chat: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Sorry, I'm having trouble connecting right now. Please try again."
        }), 500


@app.route('/api/chat/greeting', methods=['GET'])
def greeting():
    """Get initial greeting from AI."""
    try:
        messages = [{
            "role": "user",
            "content": [{"text": "Start the conversation. Greet the customer warmly and ask what trekking gear category they're looking for (Footwear, Backpacks, Clothing, or Accessories). Return a JSON response with message and stage='category_query'."}]
        }]

        response_text = call_bedrock(messages, max_tokens=512)

        # Try to parse JSON
        try:
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
                message = parsed.get('message', response_text)
            else:
                message = response_text
        except:
            message = response_text

        return jsonify({
            "success": True,
            "message": message,
            "stage": "category_query",
            "suggestions": [
                {"label": "🥾 Trekking Shoes", "value": "shoes"},
                {"label": "🎒 Backpacks", "value": "backpacks"},
                {"label": "🧥 Jackets", "value": "jackets"},
                {"label": "🦯 Poles & Accessories", "value": "accessories"}
            ]
        })

    except Exception as e:
        print(f"Error in greeting: {e}")
        return jsonify({
            "success": True,
            "message": "Hi! I'm your Trekking Concierge. What are you looking for today?",
            "stage": "category_query",
            "suggestions": [
                {"label": "🥾 Trekking Shoes", "value": "shoes"},
                {"label": "🎒 Backpacks", "value": "backpacks"},
                {"label": "🧥 Jackets", "value": "jackets"},
                {"label": "🦯 Poles & Accessories", "value": "accessories"}
            ]
        })


@app.route('/api/check-discounts', methods=['POST'])
def check_discounts():
    """Check available discounts for products."""
    try:
        data = request.json
        product_ids = data.get('productIds', [])

        eligible_deals = find_applicable_deals(product_ids)

        # Build processing steps
        processing = [
            "[Discovery Agent] → Handoff to Sales Agent",
            "[Checking] Merchant promo budget...",
            "[Checking] User eligibility...",
            "[Checking] Inventory pressure...",
            f"[Result] {len(eligible_deals)} discount(s) unlocked ✓" if eligible_deals else "[Result] Standard pricing applied"
        ]

        return jsonify({
            "success": True,
            "deals": eligible_deals,
            "processing": processing
        })

    except Exception as e:
        print(f"Error checking discounts: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "deals": [],
            "processing": ["Error checking discounts"]
        }), 500


@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products or filter by query params."""
    try:
        category = request.args.get('category')
        max_price = request.args.get('maxPrice')
        brand = request.args.get('brand')

        products = filter_products(category, brand, int(max_price) if max_price else None)

        return jsonify({
            "success": True,
            "products": products
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
