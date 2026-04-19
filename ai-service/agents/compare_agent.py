def format_price(product):
    return f"Rs.{int(product.get('price', 0)):,}"


def compare_agent(products, user_input):
    if not products:
        return {
            "message": "No products available to compare.",
            "products": []
        }

    products = products[:5]

    if len(products) == 1:
        product = products[0]
        return {
            "message": (
                f"I found only one matching product: {product.get('name')} for {format_price(product)} "
                f"in {product.get('category', 'Product')}. Add another product if you want a comparison."
            ),
            "products": products
        }

    cheapest = min(products, key=lambda product: product.get("price", 0))
    most_expensive = max(products, key=lambda product: product.get("price", 0))
    lines = [
        f"{index + 1}. {product.get('name')} - {format_price(product)} ({product.get('category', 'Product')})"
        for index, product in enumerate(products)
    ]

    message = (
        "Here is a clean comparison:\n\n"
        + "\n".join(lines)
        + f"\n\nBest value by price: {cheapest.get('name')} at {format_price(cheapest)}."
    )

    if cheapest != most_expensive:
        difference = most_expensive.get("price", 0) - cheapest.get("price", 0)
        message += f" The price difference from the highest option is {format_price({'price': difference})}."

    return {
        "message": message,
        "products": products
    }
