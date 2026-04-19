import re

from flask import Flask, request, jsonify
from flask_cors import CORS

from agents.assistant_agent import assistant_agent
from agents.compare_agent import compare_agent
from agents.recommend_agent import recommend_agent
from agents.chat_agent import chat_agent
from services.product_service import fetch_products

app = Flask(__name__)
CORS(app)

conversation_memory = {
    "last_intent": None,
    "last_product": None,
    "last_products": []
}


def normalize_product(product):
    if not product:
        return None

    p = product.lower().strip()
    synonyms = {
        "phone": "mobile",
        "phones": "mobile",
        "mobile": "mobile",
        "mobiles": "mobile",
        "t shirt": "shirt",
        "t-shirt": "shirt",
        "tshirt": "shirt",
        "clothes": "fashion",
        "clothing": "fashion",
        "sneakers": "shoes",
        "shoe": "shoes",
        "backpack": "bag"
    }

    return synonyms.get(p, p)


def tokenize(value):
    value = str(value or "").lower()
    return [token for token in re.split(r"[^a-z0-9]+", value) if len(token) > 1]


def product_search_text(product):
    return " ".join([
        str(product.get("name", "")),
        str(product.get("category", "")),
        str(product.get("description", ""))
    ]).lower()


def product_score(product, query_tokens):
    if not query_tokens:
        return 1

    name = str(product.get("name", "")).lower()
    category = str(product.get("category", "")).lower()
    description = str(product.get("description", "")).lower()
    combined = product_search_text(product)
    score = 0

    for token in query_tokens:
        if token in name:
            score += 5
        if token in category:
            score += 4
        if token in description:
            score += 2
        if token in combined:
            score += 1

    return score


def expand_query(product):
    clean = normalize_product(product)
    if not clean:
        return []

    expansion_map = {
        "mobile": ["mobile", "phone", "iphone", "oppo", "vivo", "samsung", "realme", "electronics"],
        "book": ["book", "books", "novel"],
        "shirt": ["shirt", "tshirt", "fashion"],
        "shoes": ["shoes", "shoe", "sneakers", "footwear"],
        "bag": ["bag", "backpack"],
        "laptop": ["laptop", "computer", "electronics"]
    }

    expanded = expansion_map.get(clean, [clean])
    return tokenize(" ".join(expanded))


def filter_products(products, product, price):
    if not isinstance(products, list):
        return []

    query_tokens = expand_query(product)
    scored = []

    for current_product in products:
        score = product_score(current_product, query_tokens)
        if not query_tokens or score > 0:
            scored.append((score, current_product))

    scored.sort(
        key=lambda item: (item[0], -float(item[1].get("price", 0))),
        reverse=True
    )
    filtered = [item[1] for item in scored]

    if price:
        try:
            price = float(price)
            filtered = [p for p in filtered if p.get("price", 0) <= price]
        except Exception:
            pass

    print("FINAL FILTERED PRODUCTS:", filtered)
    return filtered


def fallback_response(products):
    return build_catalog_response(products)


def format_price(product):
    return f"Rs.{int(product.get('price', 0)):,}"


def product_summary(product):
    name = product.get("name", "This product")
    category = product.get("category", "Product")
    price = format_price(product)
    stock = product.get("stock")
    description = str(product.get("description", "")).strip()

    parts = [f"{name} is available for {price} in {category}."]

    if description:
        parts.append(description)

    if stock is not None:
        if stock > 0:
            parts.append(f"{stock} item(s) are currently in stock.")
        else:
            parts.append("It is currently out of stock.")

    return " ".join(parts)


def build_catalog_response(products):
    if not products:
        return "No products found."

    if len(products) == 1:
        return product_summary(products[0])

    top_products = products[:5]
    lines = [
        f"{index + 1}. {product.get('name')} - {format_price(product)} ({product.get('category', 'Product')})"
        for index, product in enumerate(top_products)
    ]

    return "I found these matching products:\n\n" + "\n".join(lines)


def build_response(products, user_input):
    return build_catalog_response(products)


@app.route("/ai/query", methods=["POST"])
def ai_query():
    try:
        body = request.get_json()
        user_input = body.get("message") if body else None

        if not user_input:
            return jsonify({
                "success": False,
                "message": "No input provided"
            })

        text = user_input.lower().strip()

        if text in ["hi", "hello", "hey"]:
            return jsonify({
                "success": True,
                "type": "chat",
                "response": "Hey, how can I help you shop today?"
            })

        if text in ["yes", "ok", "sure", "yeah"]:
            last_products = conversation_memory.get("last_products")

            if last_products:
                return jsonify({
                    "success": True,
                    "type": "chat",
                    "response": "Great. Do you want to compare these, add one to cart, or checkout?",
                    "products": last_products
                })

            return jsonify({
                "success": True,
                "type": "chat",
                "response": "Can you tell me what product you mean?"
            })

        data = assistant_agent(user_input)

        if not data:
            return jsonify({
                "success": False,
                "message": "Could not understand request"
            })

        intent = data.get("intent")
        product = data.get("product")
        price = data.get("price")

        print("AI DECISION:", data)

        if intent == "chat":
            return jsonify({
                "success": True,
                "type": "chat",
                "response": chat_agent(user_input)
            })

        products = fetch_products(product, price)
        print("BEFORE FILTER:", products)

        products = filter_products(products, product, price)
        print("AFTER FILTER:", products)

        conversation_memory["last_intent"] = intent
        conversation_memory["last_product"] = product
        conversation_memory["last_products"] = products

        if not products:
            return jsonify({
                "success": True,
                "type": intent,
                "products": [],
                "response": "No matching products found."
            })

        if intent == "search":
            return jsonify({
                "success": True,
                "type": "hybrid",
                "response": build_response(products, user_input),
                "products": products
            })

        if intent == "compare":
            result = compare_agent(products, user_input)
            return jsonify({
                "success": True,
                "type": "compare",
                "response": result.get("message"),
                "products": products
            })

        if intent == "recommend":
            result = recommend_agent(products, user_input)
            return jsonify({
                "success": True,
                "type": "recommend",
                "response": result.get("message"),
                "products": products
            })

        return jsonify({
            "success": True,
            "type": "chat",
            "response": chat_agent(user_input)
        })

    except Exception as error:
        print("ERROR:", str(error))
        return jsonify({
            "success": False,
            "message": "Internal server error",
            "error": str(error)
        })


if __name__ == "__main__":
    app.run(port=8000, debug=True)
