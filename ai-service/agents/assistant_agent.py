import re
import json
from utils.ollama import ask_ollama


def extract_product_rule_based(text):
    # clean text
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)

    product_map = {
        "phone": ["phone", "phones", "mobile", "mobiles"],
        "laptop": ["laptop", "laptops"],
        "book": ["book", "books"],
        "shirt": ["shirt", "shirts", "tshirt", "t shirt", "t-shirt"],
        "shoes": ["shoe", "shoes", "sneakers"],
        "bag": ["bag", "bags", "backpack"],
        "iphone": ["iphone"],
        "oppo": ["oppo"],
        "vivo": ["vivo"],
        "atomic habits": ["atomic habits"],
        "harry potter": ["harry potter"]
    }

    for key, keywords in product_map.items():
        if any(word in text for word in keywords):
            return key

    return None


def assistant_agent(user_input):

    text = user_input.lower()

    # ================= PRODUCT (RULE FIRST 🔥) =================
    product = extract_product_rule_based(text)

    # ================= INTENT =================
    if any(word in text for word in ["compare", "difference", "better"]):
        intent = "compare"
    elif any(word in text for word in ["best", "recommend", "suggest", "advice"]):
        intent = "recommend"
    elif any(word in text for word in ["show", "list", "under", "below", "find", "search", "need", "want"]):
        intent = "search"
    elif any(word in text for word in ["hi", "hello", "hey"]):
        intent = "chat"
    else:
        intent = "search"

    # ================= PRICE =================
    price = None
    match = re.search(r"(under|below)\s*(\d+)", text)
    if match:
        price = int(match.group(2))

    return {
        "intent": intent,
        "product": product,
        "price": price
    }


# ================= LLM (ONLY IF NEEDED) =================
def extract_product_dynamic(user_input, products):

    categories = list(set([p["category"].lower() for p in products]))

    product_names = [p["name"].lower() for p in products]

    prompt = f"""
You are an ecommerce AI assistant.

Available categories:
{categories}

Available products:
{product_names}

User query:
"{user_input}"

Task:
- Identify the MOST RELEVANT category or product from the given lists
- DO NOT create new categories
- DO NOT guess outside the list

Return JSON ONLY:
{{
  "product": "matched category or product name or null"
}}
"""

    try:
        response = ask_ollama(prompt)
        data = json.loads(response)
        return data.get("product")
    except:
        return None
