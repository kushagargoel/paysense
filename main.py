"""E-commerce AI Agent - Minimal Boilerplate"""
from fastapi import FastAPI
from pydantic import BaseModel

# TODO: Replace this with your LLM client
class MockLLM:
    def generate(self, message: str) -> str:
        return f"[MOCK RESPONSE] You said: {message}"

llm = MockLLM()

# FastAPI app
app = FastAPI(title="E-commerce AI Agent")


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """TODO: Replace mock LLM with real LLM (OpenAI, Anthropic, Bedrock, etc.)"""
    response = llm.generate(request.message)
    return ChatResponse(response=response)


@app.get("/chat")
def chat_get(message: str):
    """Simple GET endpoint for testing"""
    response = llm.generate(message)
    return {"response": response}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
