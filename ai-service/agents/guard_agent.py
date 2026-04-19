from utils.ollama import ask_ollama

def is_store_related(user_input):
    prompt = f"""
Check if query is related to e-commerce store.

Return ONLY:
yes or no

User: {user_input}
"""
    return "yes" in ask_ollama(prompt).lower()