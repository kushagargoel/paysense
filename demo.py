import boto3
from botocore.exceptions import ClientError

# Set the Bedrock API key
bedrock_api_key = "paste your Bedrock API key here"

# Create an Amazon Bedrock Runtime client with the API key
brt = boto3.client(
    "bedrock-runtime",
    region_name="us-east-1",  # Specify your region
    aws_access_key_id="",  # Leave empty when using bearer token
    aws_secret_access_key="",  # Leave empty when using bearer token
)

# Add the bearer token to the client's request headers
brt.meta.events.register('before-call', lambda event_name, **kwargs: 
    kwargs.get('params', {}).get('headers', {}).update({
        'Authorization': f'Bearer {bedrock_api_key}'
    }) if 'headers' in kwargs.get('params', {}) else None
)

# Set the model ID, e.g., Amazon Titan Text G1 - Express.
model_id = "global.anthropic.claude-opus-4-6-v1"

# Start a conversation with the user message.
user_message = "Describe the purpose of a 'hello world' program in one line."
conversation = [
    {
        "role": "user",
        "content": [{"text": user_message}],
    }
]

try:
    # Send the message to the model, using a basic inference configuration.
    response = brt.converse(
        modelId=model_id,
        messages=conversation,
        inferenceConfig={"maxTokens": 512},
    )
    # Extract and print the response text.
    response_text = response["output"]["message"]["content"][0]["text"]
    print(response_text)
except (ClientError, Exception) as e:
    print(f"ERROR: Can't invoke '{model_id}'. Reason: {e}")
    exit(1)

