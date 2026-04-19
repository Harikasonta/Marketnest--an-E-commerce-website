def format_price(product):
    return f"Rs.{int(product.get('price', 0)):,}"


def recommend_agent(products, user_input):
    if not products:
        return {
            "message": "No products available for recommendation.",
            "products": []
        }

    products = sorted(products[:5], key=lambda product: product.get("price", 0))
    best = products[0]

    if len(products) == 1:
        message = (
            f"I recommend {best.get('name')} for {format_price(best)}. "
            f"It matches your search and is listed under {best.get('category', 'Product')}."
        )
    else:
        options = "\n".join([
            f"{index + 1}. {product.get('name')} - {format_price(product)}"
            for index, product in enumerate(products)
        ])

        message = (
            f"My top pick is {best.get('name')} at {format_price(best)} because it is the best-priced match.\n\n"
            f"Other matching options:\n{options}"
        )

    return {
        "message": message,
        "products": products
    }
