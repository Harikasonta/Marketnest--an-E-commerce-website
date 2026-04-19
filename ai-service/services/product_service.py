import requests

def normalize_product(product):
    if not product:
        return None

    product = product.lower().strip()

    # 🔥 normalize variations
    if "phone" in product or "mobile" in product:
        return "phone"

    if "book" in product:
        return "book"

    if "laptop" in product:
        return "laptop"

    return product

def get_categories(products):
    categories = set()

    for p in products:
        if p.get("category"):
            categories.add(p["category"].lower())

    return list(categories)

def fetch_products(product=None, price=None):
    try:
        # 🔥 normalize BEFORE sending
        clean_product = normalize_product(product)

        print("SENDING TO NODE:", clean_product, price)

        res = requests.post(
            "http://localhost:5000/products/search",
            json={
                "product": clean_product,
                "price": price
            }
        )

        data = res.json()

        print("NODE RESPONSE:", data)

        # ensure always list
        if isinstance(data, list):
            return data

        return []

    except Exception as e:
        print("ERROR FETCHING PRODUCTS:", e)
        return []