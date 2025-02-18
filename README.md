# **Expense Tracker Source 1 - README**

## **Overview**

The **Expense Tracker** is a financial management tool designed to help users log, categorize, and analyze their income and expenses. The application enables users to track their financial activities efficiently, manage budgets, and generate reports. The project is built using JavaScript (Node.js, Electron, MongoDB) and follows a modular structure for maintainability.

## **Contributors**

**Team Members & Roles:**
- **Naeem (NLovitt)** - Frontend & Documentation: Handles UI/UX design and maintains project documentation
- **Steven (mouniesa)** - Full Stack: Develops server-side logic and integrates frontend with backend
- **Cully (cullyrs)** - Backend: Leads server-side development and JavaScript code optimization

**Contributors:**
- **Arewa (Arewa-lyi)** - DB Developer: Oversaw database development
  
## **Project Setup**

### **Prerequisites**

1. A **MongoDB Atlas** account. You will need to be added to the **access list** via:
    - [MongoDB Access List](https://cloud.mongodb.com/v2/678d3c0c74df8f2b109d1a4a#/access)
2. Add a **username and password** to your MongoDB Atlas database.
3. Whitelist your **IP address** via:
    - [MongoDB Network Access](https://cloud.mongodb.com/v2/678d3c0c74df8f2b109d1a4a#/security/network/accessList)
4. An IDE of your choice.

### **Installation Steps**

1. **Clone the Repository**
    
    ```bash
    git clone https://github.com/cullyrs/MoneyManagementApp.git
    cd MoneyManagementApp
    ```
    
2. **Configuration File**
    
    The project requires an `api.json` file to store **MongoDB credentials**. Create this file in the root directory and add the following:
    
    ```json
    {
        "username": "YOUR_MONGODB_USERNAME",
        "password": "YOUR_MONGODB_PASSWORD"
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

## **Technologies Used**

### **Programming Languages**

- JavaScript
- HTML
- CSS
- LESS

### **Frameworks & Libraries**

- **Backend:** Node.js, Mongoose
- **Database:** MongoDB Atlas
- **Desktop Application:** Electron
- **Data Handling:** bcrypt, MongoDB client

### **Development Tools**

- Git/GitHub (Version Control)
- VS Code
- Electron

## **Core Functionalities**

The application features user authentication with secure password storage using bcrypt and user login/registration capabilities. 

For financial management, users can track both expenses and income by logging transactions with specific categories like food, utilities, and rent, while maintaining a comprehensive transaction history. 

The budget management system allows users to set and monitor budget goals. Additionally, the reporting features provide monthly expense summaries to help users better understand their financial patterns.

## **Troubleshooting**

### **Common Issues & Fixes**

1. **MongoDB Connection Error**
    - Ensure you have whitelisted your IP in MongoDB Atlas.
    - Verify `api.json` exists and has the correct MongoDB credentials.
2. **Modules Not Found**
    - Run `npm install` to install all dependencies.
3. **Electron App Not Starting**
    - Ensure you are in the project root folder and run `npm start`.

## **Contributing**

1. Fork the repository.
2. Create a new branch (`feature-name`).
3. Make your changes and commit.
4. Submit a pull request.
