🛒 MarketNest – AI-Powered E-Commerce Platform
📌 Project Description

MarketNest is an AI-powered e-commerce platform designed for scalability and flexibility. It enables dynamic product management and provides intelligent product recommendations through a chatbot. The system ensures a seamless shopping experience with personalized suggestions and detailed product views.

🚀 Features
🧠 AI chatbot for product queries and recommendations
📦 Dynamic product & category management (admin controlled)
🔍 Smart product search and filtering
📄 Detailed product pages with similar product suggestions
🛒 Cart and wishlist functionality
⚡ Scalable architecture (works with any product dataset)
🎯 Personalized user experience
🛠️ Tech Stack

Frontend:
HTML, CSS, JavaScript
Bootstrap

Backend:
Node.js
Express.js

AI Service:
OpenAI API

Database:
(Add your DB here – MongoDB / MySQL if used)

📂 Project Structure
ecommerce-project/
│── client/        # Frontend
│── server/        # Backend APIs
│── ai-service/    # AI chatbot & recommendation logic
│── images/        # Product images
│── outputs/       # Generated outputs
│── .gitignore

⚙️ Setup Instructions

1️⃣ Clone the Repository
git clone https://github.com/Harikasonta/Marketnest--an-E-commerce-website.git
cd ecommerce-project

2️⃣ Install Dependencies
cd server
npm install
cd ../client
npm install

3️⃣ Setup Environment Variables
Create a .env file inside ai-service/:
OPENAI_API_KEY=your_api_key_here

4️⃣ Run the Project
Start Backend:
cd server
node index.js

Start Frontend:
cd client
npm start

📸 Screenshots
![Homepage](images/homepage.png)
![Product Page](images/product.png)

🔐 Security Note
.env file is excluded from GitHub for security
API keys are not exposed

🌟 Future Enhancements
Payment gateway integration
User authentication & profiles
Advanced recommendation system
Order tracking system

👩‍💻 Author
Harika Sonta

⭐ Support
If you like this project, give it a ⭐ on GitHub!
