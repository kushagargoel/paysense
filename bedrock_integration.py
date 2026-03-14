import os
import json
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create an Amazon Bedrock Runtime client
brt = boto3.client(
    "bedrock-runtime",
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
)

# Set the model ID - try different formats if one fails
model_id = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0")

# Prepare the request body using Messages API format
body = {
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 512,
    "system": "You are a helpful AI assistant.",
    "messages": [
        {
            "role": "user",
            "content": "Hello, please introduce yourself as an AI assistant."
        }
    ],
    "temperature": 0.7,
}

try:
    # Call Bedrock using invoke_model with Messages API
    response = brt.invoke_model(
        modelId=model_id,
        body=json.dumps(body)
    )

    # Parse the response
    response_body = json.loads(response['body'].read())
    content_blocks = response_body.get('content', [])
    if content_blocks and len(content_blocks) > 0:
        print(content_blocks[0].get('text', '').strip())

except (ClientError, Exception) as e:
    print(f"ERROR: Can't invoke '{model_id}'. Reason: {e}")
    print("\nTip: Make sure you have the correct model ID. Try:")
    print("  - anthropic.claude-3-sonnet-20240229-v1:0")
    print("  - anthropic.claude-3-haiku-20240307-v1:0")
    print("  - anthropic.claude-3-opus-20240229-v1:0")
    exit(1)
