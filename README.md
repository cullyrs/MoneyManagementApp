# **Expense Tracker - README**

## **Overview**

The **Expense Tracker** is a financial management web application designed to help users log, categorize, and analyze their income and expenses. The project initially used **Electron** for a desktop-based approach but has since transitioned to **Express.js**, allowing for **RESTful APIs** and improved web-based functionality. This update enhances performance, maintainability, and scalability.

## **Contributors**

**Team Members & Roles:**

- **Naeem (NLovitt)** - Frontend & Documentation: Handles UI/UX design and maintains project documentation.
- **Steven (mouniesa)** - Full Stack: Develops server-side logic and integrates frontend with backend.
- **Cully (cullyrs)** - Backend: Leads server-side development and JavaScript code optimization.

**Former Team Members:**

- **Arewa (Arewa-lyi)** - DB Developer: Oversaw database development.

## **Project Setup**

### **Prerequisites**

1. Node.js & npm installed
2. MongoDB database access
    - A MongoDB Atlas account. You will need to be added to the access list via:
        - [MongoDB Access List](https://cloud.mongodb.com/v2/678d3c0c74df8f2b109d1a4a#/access)
    - The project now uses a new MongoDB instance.
    - Update your MongoDB credentials in the configuration file.
3. Git for version control
4. An IDE of your choice (VS Code recommended).

### **Installation Steps**

1. **Clone the Repository**
    
    ```bash
    git clone https://github.com/cullyrs/MoneyManagementApp.git
    cd MoneyManagementApp
    ```
    
2. **Configuration File**
The project requires an `api.json` file to store **MongoDB credentials**. Create this file in the root directory and add:
    
    ```json
    {
        "username": "YOUR_MONGODB_USERNAME",
        "password": "YOUR_MONGODB_PASSWORD"
        "SENDGRID_API_KEY": "API_KEY",
        "SENDER_EMAIL": "SENDER_EMAIL"
    }
    ```
    
3. **Install Required Dependencies**
    
    ```bash
    npm install
    ```
    
4. **Start the Application**
    
    ```bash
    npm start
    ```

## **Project Structure**

```graphql
.
└── MoneyManagementApp/
    ├── .gitignore
    ├── main.js
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── db/
    │   ├── api.json
    │   ├── budgetFunctions.js
    │   ├── categoryFunctions.js
    │   ├── dbconnect.js
    │   ├── goalFunctions.js
    │   ├── transactionsFunctions.js
    │   ├── userFunctions.js
    │   └── models/
    │       ├── Budget.js
    │       ├── Category.js
    │       ├── Goal.js
    │       ├── Transactions.js
    │       └── User.js
    ├── public/
    │   ├── about.html
    │   ├── budget.html
    │   ├── change-password.html
    │   ├── contact.html
    │   ├── dashboard.html
    │   ├── goal.html
    │   ├── index.html
    │   ├── less-watch-compiler.config.json
    │   ├── login.html
    │   ├── logout.html
    │   ├── manage-targets.html
    │   ├── profile.html
    │   ├── site.webmanifest
    │   ├── css/
    │   │   └── stylesheet.css
    │   ├── imgs/
    │   │   ├── android-chrome-192x192.png
    │   │   ├── android-chrome-512x512.png
    │   │   ├── apple-touch-icon.png
    │   │   ├── arewa.png
    │   │   ├── cully.png
    │   │   ├── favicon.ico
    │   │   ├── favicon-16x16.png
    │   │   ├── favicon-32x32.png
    │   │   ├── icon.png
    │   │   ├── naeem.png
    │   │   └── steven.png
    │   ├── js/
    │   │   ├── dateScript.js
    │   │   ├── headerMenu.js
    │   │   ├── initializeUser.js
    │   │   ├── logout.js
    │   │   ├── manageTargets.js
    │   │   ├── updatePassword.js
    │   │   ├── userBudget.js
    │   │   ├── userContact.js
    │   │   ├── userDashBoard.js
    │   │   ├── userGoal.js
    │   │   └── userProfile.js
    │   └── less/
    │       └── stylesheet.less
    ├── routes/
    │   ├── alertRoutes.js
    │   ├── authenRoutes.js
    │   ├── categoryRoutes.js
    │   ├── contactRoutes.js
    │   ├── dashboardRoutes.js
    │   ├── transactionRoutes.js
    │   └── userRoutes.js
    ├── tests/
    │   └── test.js
    └── utils/
        └── helper.js
```
## **Major Updates in this Version**

### **1. Migration from Electron to Express.js**

- Electron removed (no longer a desktop app).
- Express.js integrated for a RESTful web-based API.
- MongoDB queries optimized for better performance.

### **2. Database Schema Changes**

- Switched to a new MongoDB instance (update `api.json` for connectivity).
- Category now has a `type` field to distinguish income vs. expenses.
- Removed budget and goal categories (budgets/goals are now tracked monthly).
- Transactions now store category names instead of IDs.

### **3. Frontend Enhancements**

- "Add Expense" button dynamically updates transactions table.
- Transaction dates now properly account for UTC issues.
- Net balance stored in session storage and displayed upon login.
- Transactions sorted by month in descending order.
- Progress bars improved for budget and goals.

### **4. Authentication & UI Fixes**

- Login/logout state now dynamically updates UI buttons.
- "Get Started" now redirects to dashboard if logged in.
- Change Password feature added and verified.
- Export to CSV functionality added.

![home](https://github.com/user-attachments/assets/c4354029-52d4-4ce7-9b3d-40815293fcee)

### **5. Bug Fixes**

- [x]  Fixed **404 errors when loading goals & budgets**.
- [x]  Fixed **transaction sorting & undefined category references**.
- [x]  Fixed **CSS issues with Firefox scrollbars & month selector UI**.

## **Technologies Used**

| Component | Technology Used |
| --- | --- |
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Version Control** | Git/GitHub |
| **Testing Framework** | Jest, JSDOM |
| **Deployment** | Render.com / Azure |

## **Core Functionalities**

- User authentication (register, login, password change).
- Add, edit, and delete transactions.
- Budget & goal tracking (now monthly-based).
- Transaction history with category breakdown.
- Export financial data to CSV.

## **Troubleshooting**

### **Common Issues & Fixes**

1. **MongoDB Connection Error**
    - Ensure your credentials in `api.json` are correct.
    - Make sure your **MongoDB IP whitelist includes your machine**.
2. **Modules Not Found**
    - Run `npm install` to install missing dependencies.
3. **Login State Not Updating**
    - Clear your browser cache and refresh.

## **Deployment**

The app will be deployed using **Render.com**.

Steps:

1. **Push latest version to GitHub**.
2. **Deploy using Render or Azure**.
3. **Set up environment variables (`api.json` settings)**.
4. **Launch and test the live app**.

## **Contributing**

1. Fork the repository.
2. Create a new branch (`feature-name`).
3. Make your changes and commit.
4. Submit a pull request.
