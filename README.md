# cellphone_company_database
This is a web-based application developed using Node.js and Express, which interacts with a PostgreSQL database to manage a cellphone company database. The application allows you to manage customers, call records, and payment information through a simple web interface.

Features
Initialize Database Tables: Set up your database with the required tables using the /initializeTables route.
Customer Management: Add new customers, update existing ones, and view detailed customer information.
Payment Handling: Record and manage payments made by customers.
Call Management: Record call details including caller, receiver, call duration, and data usage.
Performance Metrics: View performance times for transactions.
Prerequisites
Node.js
PostgreSQL
Installation
Clone the repository:

bash
Copy code
git clone <repository_url>
Install dependencies:

bash
Copy code
npm install
Set up the database credentials:

Add your database credentials in a creds.json file.
Run the application:

bash
Copy code
node hw2.js

Usage
Access the application at http://localhost:3001.
Use the main page to navigate through different functionalities like adding customers, making payments, and viewing performance metrics.

API Endpoints
/initializeTables: Initializes the database tables from the SQL file.
/addCustomer: Add a new customer to the database.
/makePayment: Record a payment made by a customer.
/calls: Record a call between two numbers.
/performance: View transaction performance metrics.
