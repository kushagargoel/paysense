"""PaySense Backend — Pine Labs Payment Integration"""
import os
import json
import uuid
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="PaySense API")

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pine Labs Config ---
PINELABS_CLIENT_ID = os.getenv("PINELABS_CLIENT_ID")
PINELABS_CLIENT_SECRET = os.getenv("PINELABS_CLIENT_SECRET")
PINELABS_MERCHANT_ID = os.getenv("PINELABS_MERCHANT_ID")
PINELABS_ENV = os.getenv("PINELABS_ENV", "uat")
PINELABS_CALLBACK_URL = os.getenv("PINELABS_CALLBACK_URL", "")

PINELABS_BASE_URLS = {
    "uat": "https://pluraluat.v2.pinepg.in",
    "production": "https://api.pluralpay.in",
}
PINELABS_BASE_URL = PINELABS_BASE_URLS.get(PINELABS_ENV, PINELABS_BASE_URLS["uat"])

DATA_FILE = os.path.join(os.path.dirname(__file__), "data.json")


# --- Data Store ---
def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE) as f:
            return json.load(f)
    return {"payment_links": []}


def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


# --- Pine Labs Helpers ---
def get_pinelabs_token():
    url = f"{PINELABS_BASE_URL}/api/auth/v1/token"
    payload = {
        "client_id": PINELABS_CLIENT_ID,
        "client_secret": PINELABS_CLIENT_SECRET,
        "grant_type": "client_credentials",
    }
    resp = requests.post(url, json=payload, timeout=10)
    if resp.status_code == 200:
        return resp.json().get("access_token")
    return None


def _pinelabs_headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Request-ID": str(uuid.uuid4()),
        "Request-Timestamp": datetime.now().isoformat(),
        "accept": "application/json",
    }


def create_pinelabs_order(amount: float, customer_name: str, description: str,
                          customer_phone: str = "", customer_email: str = "") -> dict:
    """Create a Pine Labs payment order and return redirect URL."""
    if amount <= 0:
        return {"error": "Amount must be greater than 0"}
    if not customer_name.strip():
        return {"error": "Customer name is required"}

    # Real Pine Labs API call
    if PINELABS_CLIENT_ID and PINELABS_CLIENT_ID != "your_pinelabs_client_id":
        token = get_pinelabs_token()
        if not token:
            return {"error": "Failed to authenticate with Pine Labs"}

        # Use the Hosted Checkout endpoint for redirect-based flow
        url = f"{PINELABS_BASE_URL}/api/checkout/v1/orders"
        headers = _pinelabs_headers(token)

        name_parts = customer_name.strip().split(maxsplit=1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        order_ref = f"PS_{datetime.now().strftime('%Y%m%d%H%M%S')}_{first_name}"
        payload = {
            "merchant_order_reference": order_ref,
            "order_amount": {
                "value": int(amount * 100),
                "currency": "INR",
            },
            "pre_auth": False,
            "purchase_details": {
                "customer": {
                    "email_id": customer_email or "customer@example.com",
                    "first_name": first_name,
                    "last_name": last_name,
                    "customer_id": f"CUST_{first_name.upper()}",
                    "mobile_number": customer_phone or "9999999999",
                }
            },
            "notes": description,
        }
        if PINELABS_CALLBACK_URL:
            payload["callback_url"] = PINELABS_CALLBACK_URL
            payload["failure_callback_url"] = PINELABS_CALLBACK_URL

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=10)
            if resp.status_code in [200, 201]:
                resp_json = resp.json()
                print(f"[DEBUG] Pine Labs full response: {json.dumps(resp_json, indent=2)}")

                # Hosted checkout returns: { token, order_id, redirect_url, response_code, response_message }
                # or wrapped in { data: { ... } }
                order_data = resp_json.get("data", resp_json)

                redirect_url = (
                    order_data.get("redirect_url")
                    or resp_json.get("redirect_url")
                    or ""
                )
                order_id_val = (
                    order_data.get("order_id")
                    or resp_json.get("order_id")
                    or order_ref
                )

                result = {
                    "id": order_id_val,
                    "order_id": order_id_val,
                    "merchant_order_reference": order_ref,
                    "amount": amount,
                    "customer_name": customer_name,
                    "description": description,
                    "status": order_data.get("status", "CREATED"),
                    "redirect_url": redirect_url,
                    "created_at": datetime.now().isoformat(),
                }
                data = load_data()
                data["payment_links"].append(result)
                save_data(data)
                return result
            else:
                return {"error": f"Pine Labs API error: {resp.status_code} — {resp.text}"}
        except requests.Timeout:
            return {"error": "Pine Labs API timed out. Please try again."}
        except Exception as e:
            return {"error": f"Pine Labs API error: {str(e)}"}

    # Sandbox fallback when no credentials
    link_id = f"PL_{datetime.now().strftime('%Y%m%d%H%M%S')}_{customer_name.replace(' ', '_')}"
    result = {
        "id": link_id,
        "amount": amount,
        "customer_name": customer_name,
        "description": description,
        "status": "CREATED",
        "redirect_url": f"https://pluraluat.v2.pinepg.in/links/{link_id}",
        "created_at": datetime.now().isoformat(),
    }
    data = load_data()
    data["payment_links"].append(result)
    save_data(data)
    return result


def check_payment_status(order_id: str) -> dict:
    """Check real-time status of a payment order."""
    if PINELABS_CLIENT_ID and PINELABS_CLIENT_ID != "your_pinelabs_client_id":
        token = get_pinelabs_token()
        if token:
            url = f"{PINELABS_BASE_URL}/api/pay/v1/orders/{order_id}"
            headers = _pinelabs_headers(token)
            try:
                resp = requests.get(url, headers=headers, timeout=10)
                if resp.status_code == 200:
                    order_data = resp.json().get("data", resp.json())
                    status = order_data.get("status", "UNKNOWN")
                    return {
                        "id": order_id,
                        "order_id": order_data.get("order_id", order_id),
                        "status": status,
                        "amount": order_data.get("order_amount", {}).get("value", 0) / 100,
                        "currency": order_data.get("order_amount", {}).get("currency", "INR"),
                        "payment_method": order_data.get("payment_method"),
                        "updated_at": order_data.get("updated_at"),
                    }
            except (requests.Timeout, requests.RequestException):
                pass

    # Fallback to local data
    data = load_data()
    for link in data["payment_links"]:
        if link.get("id") == order_id or link.get("order_id") == order_id:
            return link
    return {"error": "Order not found"}


# ===================================================================
# API ENDPOINTS
# ===================================================================

class CreateOrderRequest(BaseModel):
    amount: float
    customer_name: str
    customer_email: str = ""
    customer_phone: str = ""
    description: str = "PaySense Order"


class CheckStatusRequest(BaseModel):
    order_id: str


@app.get("/health")
def health():
    return {"status": "ok", "pinelabs_env": PINELABS_ENV}


@app.post("/api/create-order")
def api_create_order(req: CreateOrderRequest):
    result = create_pinelabs_order(
        amount=req.amount,
        customer_name=req.customer_name,
        description=req.description,
        customer_phone=req.customer_phone,
        customer_email=req.customer_email,
    )
    return result


@app.get("/api/payment-status/{order_id}")
def api_payment_status(order_id: str):
    return check_payment_status(order_id)


@app.get("/api/orders")
def api_list_orders():
    data = load_data()
    return {"orders": data.get("payment_links", [])}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
