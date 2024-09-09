const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3001;
const creds = require('./creds.json');
const pool = new Pool(creds);
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const appDir = __dirname;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Define arrays for transaction times
let paymentTransactionTimes = [];
let callTransactionTimes = [];
let customerTransactionTimes = [];

app.get('/initializeTables', (req, res) => {
    // Read the SQL file content
    const sqlFilePath = path.join(appDir,'db.sql'); // Update the path accordingly
    const sqlFileContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the SQL commands to initialize tables
    pool.query(sqlFileContent, (err, result) => {
        if (err) {
            return res.status(500).send('Error initializing tables: ' + err.message);
        }
        res.send('Tables from db.sql initialized successfully!');
    });
});

// Route for the main page
app.get('/', (req, res) => {
    const mainPageContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cellphone Company Database</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    text-align: center;
                    padding: 50px;
                }
                h1 {
                    color: #333;
                }
                a {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: bold;
                    margin-right: 20px;
                }
                a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to Cellphone Company Database</h1>
            <h2>Initialize Database Tables</h2>
            <button onclick="initializeTables()">Initialize Tables</button>
            <script>
            function initializeTables() {
                // Make a GET request to the /initializeTables route
                fetch('/initializeTables')
                    .then(response => response.text())
                    .then(message => alert(message))
                    .catch(error => console.error('Error:', error));
            }
            </script>
            <p>Explore our database to learn more about our customers, plans, call records, and payments.</p>
            <a href="/database">Go to database</a>
            <a href="/addCustomer">Add a customer</a>
            <a href="/calls">Make a call</a>
            <a href="/existingcustomer">Existing Customer</a>
            <a href="/makePayment">Make Payment</a>
            <a href="/performance">Performance Times</a>
        </body>
        </html>
    `;
    res.send(mainPageContent);
});

app.get('/performance', (req, res) => {

    // Function to generate table rows with auto-incremented numbers
    const generateRows = (transactionTimes) => {
        let rows = '';
        for (let i = 0; i < transactionTimes.length; i++) {
            rows += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${transactionTimes[i]} milliseconds</td>
                </tr>
            `;
        }
        return rows;
    };

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Performance Metrics</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    text-align: center;
                    padding: 50px;
                }
                h1 {
                    color: #333;
                }
                .performance-container {
                    margin-top: 20px;
                    text-align: left;
                }
                .performance-header {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .performance-metric {
                    font-size: 18px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
            
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
            
                h3 {
                    margin-top: 20px;
                }
            
                .metric-table {
                    margin-top: 10px;
                }
            </style>
            
            </style>
            </head>
            <body>
                <h1>Performance Metrics</h1>
                <div class="performance-container">
                    <h3>Time taken for the add a payment transactions:</h3>
                    <div class="metric-table">
                        <table>
                            <tr>
                                <th>Payment Transaction Number:</th>
                                <th>Time</th>
                            </tr>
                            ${generateRows(paymentTransactionTimes)}
                        </table>
                    </div>
                    <h3>Time taken for the add a customer transactions:</h3>
                    <div class="metric-table">
                        <table>
                            <tr>
                                <th>Customer Transaction Number:</th>
                                <th>Time</th>
                            </tr>
                            ${generateRows(customerTransactionTimes)}
                        </table>
                    </div>
                    <h3>Time taken for the add a call transactions:</h3>
                    <div class="metric-table">
                        <table>
                            <tr>
                                <th>Call Transaction Number:</th>
                                <th>Time</th>
                            </tr>
                            ${generateRows(callTransactionTimes)}
                        </table>
                    </div>
                </div>
            </body>
            </html>
    `;

    res.send(html);
});

// Route for the "Make Payment" page
app.get('/makePayment', async (req, res) => {
    try {
        // Fetch a list of customers to populate the dropdown
        const customers = await pool.query('SELECT customer_phone_number, customer_name FROM customer');
        
        // Render the makePayment form with the list of customers
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Make Payment</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    text-align: center;
                    padding: 50px;
                }
                h1 {
                    color: #333;
                }
                form {
                    margin-top: 20px;
                }
                input {
                    margin-bottom: 20px;
                    padding: 5px;
                }
                button {
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    padding: 10px 20px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #0056b3;
                }
                table {
                    width: 80%;
                    margin: 20px auto;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 10px;
                    border: 1px solid #ddd;
                }
                th {
                    background-color: #f2f2f2;
                }
                a {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: bold;
                    margin-right: 20px;
                }
                a:hover {
                    text-decoration: underline;
                }
                .labelWithMargin {
                    padding-top: 40px;
                }                
            </style>
            </head>
            <body>
                <h1>Make Payment</h1>
                <form action="/makePayment" method="post" id="paymentForm">
                <label for="customerID" class="labelWithMargin">Select Customer:</label>
                <select id="customerID" name="customerID" required onchange="fetchAmountDue()">
                    <option value="" disabled selected>Select Customer</option>
                    ${customers.rows.map(customer => `<option value="${customer.customer_phone_number}">${customer.customer_name}</option>`).join('')}
                </select><br>
                <label for="paymentAmount" class="labelWithMargin">Enter Payment Amount:</label>
                <input type="number" id="paymentAmount" name="paymentAmount" step="0.01" required min="0"><br>
                <p id="amountDueDisplay">Amount Due: </p>            
                <button type="submit">Make Payment</button>
            </form>
            
                <script>
                    async function fetchAmountDue() {
                        const selectedCustomerID = document.getElementById('customerID').value;
                        const response = await fetch('/getAmountDue?customerID=' + selectedCustomerID);
                        const data = await response.json();
                        document.getElementById('amountDueDisplay').innerText = 'Amount Due: ' + data.amountDue;
                    }
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});

// Route to fetch the amount due for a specific customer
app.get('/getAmountDue', async (req, res) => {
    try {
        const customerID = req.query.customerID;
        const customer = await pool.query('SELECT amount_due FROM customer WHERE customer_phone_number = $1', [customerID]);
        const amountDue = customer.rows[0].amount_due;
        res.json({ amountDue });
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});

// Handle the POST request for making a payment
app.post('/makePayment', async (req, res) => {
    try {
        const { customerID, paymentAmount } = req.body;
        
        const sqlStatements = []; // Array to store SQL statements

        const startTime = new Date();

        // Fetch the current amount due for the selected customer
        const customer = await pool.query('SELECT amount_due FROM customer WHERE customer_phone_number = $1', [customerID]);
        const currentAmountDue = customer.rows[0].amount_due;
        sqlStatements.push(`SELECT amount_due FROM customer WHERE customer_phone_number = ${customerID};`);

        // Deduct the payment amount from the bank account balance
        const bankAccount = await pool.query('SELECT balance FROM bankaccount WHERE customer_phone_number = $1', [customerID]);
        const currentBalance = bankAccount.rows[0].balance;
        sqlStatements.push(`SELECT balance FROM bankaccount WHERE customer_phone_number = ${customerID};`);

        if(currentAmountDue - paymentAmount < 0){
            res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Error</title>
                <script>
                    alert("Payment is greater than amount due.");
                    window.location.href = "/makePayment";
                </script>
            </head>
            <body>
                <h1>Error</h1>
            </body>
            </html>
            `);
            return; // Stop further execution
        }
        else
        {
            const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in 'YYYY-MM-DD' format

            // Update the customer's amount due after payment
            const updatedAmountDue = currentAmountDue - paymentAmount;
            const updatedBalance = currentBalance - paymentAmount;
     
            await pool.query(`BEGIN;
                              UPDATE customer SET amount_due = ${updatedAmountDue} WHERE customer_phone_number = '${customerID}';
                              INSERT INTO payment (customer_phone_number, payment_amount, payment_time, payment_date) VALUES ('${customerID}', ${paymentAmount}, '20:00', ${currentDate});
                              UPDATE bankaccount SET balance = ${updatedBalance} WHERE customer_phone_number = '${customerID}';
                              COMMIT;
                            `);

            sqlStatements.push(`BEGIN;`);

            sqlStatements.push(`UPDATE customer SET amount_due = ${updatedAmountDue} WHERE customer_phone_number = ${customerID};`);

            sqlStatements.push(`INSERT INTO payment (customer_phone_number, payment_amount, payment_time, payment_date) VALUES (${customerID}, ${paymentAmount}, '20:00', '${currentDate}';`);

            sqlStatements.push(`UPDATE bankaccount SET balance = ${updatedBalance} WHERE customer_phone_number = ${customerID};`);

            sqlStatements.push(`COMMIT;`);

            const endTime = new Date();
            paymentTransactionTimes.push(endTime - startTime);

            // Render the response with SQL statements
            res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Transaction Result</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f5f5f5;
                        text-align: center;
                        padding: 50px;
                    }
                    h1 {
                        color: #333;
                    }
                    p {
                        color: #333;
                        font-weight: bold;
                        margin-top: 20px;
                    }
                    pre {
                        background-color: #f2f2f2;
                        padding: 10px;
                        white-space: pre-wrap;
                        text-align: left;
                        margin-top: 10px;
                        overflow-x: auto;
                    }
                    a {
                        color: #007bff;
                        text-decoration: none;
                        font-weight: bold;
                        margin-top: 20px;
                        display: block;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <h1>Transaction Successful</h1>
                <p>SQL Statements:</p>
                <pre>${sqlStatements.join('\n')}</pre>
                <p>Transaction Time: ${endTime - startTime} milliseconds</p>
                <a href="/database">Go back to database</a>
            </body>
            </html>        
            `);
            }
    } catch (error) {
        await pool.query('ROLLBACK'); // Rollback the transaction in case of an error
        console.log(error);
        res.status(500).send("Error: " + error.message);
    }
});

// Define the generateHtmlTable function before the routes
function generateHtmlTable(data, tableName, tableId) {
    const tableHtml = data.map(item => {
        const keys = Object.keys(item);
        const rowHtml = keys.map(key => `<td>${item[key]}</td>`).join('');
        return `<tr>${rowHtml}</tr>`;
    }).join('');

    return `
        <h2>${tableName}</h2>
        <table id="${tableId}" border="1">
            <tr>${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}</tr>
            ${tableHtml}
        </table>
    `;
}

// Route for the "Database" page
app.get('/database', async (req, res) => {
    let totalcustHTML = "";
    let precalldurHTML = "";
    let topcallersHTML = "";
    let avgcalldurationHTML = "";
    let payandBalanceHTML = "";

    try {
        // Query customer table
        const customerResult = await pool.query('SELECT * FROM customer');
        const customerData = customerResult.rows;

        // Query total amount of customers
        const totalCustomer = await pool.query('SELECT COUNT(*) AS total_customers FROM customer');
        if (totalCustomer.rows.length > 0) {
            totalcustHTML = totalCustomer.rows.map(row => {
                return `<span>${row.total_customers}</span>`;
            }).join('');
        }

        // Query prepaidplan table
        const prepaidPlanResult = await pool.query('SELECT * FROM prepaidplan');
        const prepaidPlanData = prepaidPlanResult.rows;

        // Query postpaidplan table
        const postpaidPlanResult = await pool.query('SELECT * FROM postpaidplan');
        const postpaidPlanData = postpaidPlanResult.rows;

        // Query callrecord table
        const callRecordResult = await pool.query('SELECT * FROM callrecord');
        const callRecordData = callRecordResult.rows;

        // Query Total Call Durations for Customers with Prepaid Plans
        const preCallDur = await pool.query('SELECT c.customer_name, SUM(cr.call_duration) AS total_call_duration FROM customer c JOIN callrecord cr ON c.customer_phone_number = cr.customer_phone_number JOIN prepaidplan pp ON c.prepaid_plan = pp.plan_name GROUP BY c.customer_phone_number ORDER BY c.customer_phone_number;');
        if(preCallDur.rows.length > 0) {
            precalldurHTML = preCallDur.rows.map(row => {
                return `<p>${row.customer_name}: ${row.total_call_duration} minutes</p>`;
            }).join('')
        }
        
        // Query top callers by call duration from callrecords
        const topCallers = await pool.query('SELECT c.customer_name, SUM(cr.call_duration) AS total_call_duration FROM callrecord cr JOIN customer c ON cr.customer_phone_number = c.customer_phone_number GROUP BY c.customer_name ORDER BY total_call_duration DESC LIMIT 3;');
        
        if (topCallers.rows.length > 0) {
            topcallersHTML = topCallers.rows.map(row => {
                return `<p>${row.customer_name}: ${row.total_call_duration} minutes</p>`;
            }).join('');
        }

        // Query Average call duration from callrecords
        const avgCallDuration = await pool.query('SELECT ROUND(AVG(cr.call_duration)) AS average_call_duration FROM callrecord cr;');
        if (avgCallDuration.rows.length > 0) {
            avgcalldurationHTML = avgCallDuration.rows.map(row => {
                return `<span>${row.average_call_duration} minutes</span>`;
            }).join('');
        }

        // Query payment table
        const paymentResult = await pool.query('SELECT * FROM payment');
        const paymentData = paymentResult.rows;

        // Query bankaccount table
        const banckaccountResult = await pool.query('SELECT * FROM bankaccount');
        const bankaccountData = banckaccountResult.rows;

        // Query Total Payments and Remaining Balance for Customers with Bank Accounts
        const payandBalance = await pool.query('SELECT c.customer_name, SUM(p.payment_amount) AS total_payments, b.balance AS remaining_balance FROM customer c JOIN payment p ON c.customer_phone_number = p.customer_phone_number JOIN bankaccount b ON c.customer_phone_number = b.customer_phone_number GROUP BY c.customer_phone_number, b.balance ORDER BY c.customer_phone_number');
        if (payandBalance.rows.length > 0) {
            payandBalanceHTML = payandBalance.rows.map(row => {
                return `<p>${row.customer_name}: ${row.total_payments} and ${row.remaining_balance} remaining</p>`;
            }).join('');
        }

        // Query competitors table
        const competitorsResult = await pool.query('SELECT * FROM competitors');
        const competitorsData = competitorsResult.rows;

        // Usage of generateHtmlTable with tableId
        const customerHtml = generateHtmlTable(customerData, 'Customer Information', 'customerTable');
        const prepaidPlanHtml = generateHtmlTable(prepaidPlanData, 'Prepaid Plans', 'prepaidPlanTable');
        const postpaidPlanHtml = generateHtmlTable(postpaidPlanData, 'Postpaid Plans', 'postpaidPlanTable');
        const callRecordHtml = generateHtmlTable(callRecordData, 'Call Records', 'callRecordTable');
        const paymentHtml = generateHtmlTable(paymentData, 'Payments', 'paymentTable');
        const bankaccountHtml = generateHtmlTable(bankaccountData, 'Bank Accounts', 'bankaccountTable');
        const competitorsHtml = generateHtmlTable(competitorsData, 'Competitors', 'competitorsTable');

        // Concatenate all HTML tables with consistent styling
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Database</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f5f5f5;
                        text-align: center;
                        padding: 50px;
                    }
                    h1 {
                        color: #333;
                    }
                    h2 {
                        color: #333;
                        margin-top: 40px;
                    }
                    table {
                        width: 80%;
                        margin: 20px auto;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 10px;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    a {
                        color: #007bff;
                        text-decoration: none;
                        font-weight: bold;
                        margin-right: 20px;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
                <script>
                    document.addEventListener("DOMContentLoaded", function () {
                        const customerTableRows = document.querySelectorAll("#customerTable tbody tr");
                        const prepaidPlanTableRows = document.querySelectorAll("#prepaidPlanTable tbody tr");
                        const postpaidPlanTableRows = document.querySelectorAll("#postpaidPlanTable tbody tr");
                        const callRecordTableRows = document.querySelectorAll("#callRecordTable tbody tr");
                        const paymentTableRows = document.querySelectorAll("#paymentTable tbody tr");
                        const bankaccountTableRows = document.querySelectorAll("#bankaccountTable tbody tr");
                        const competitorsTableRows = document.querySelectorAll("#competitorsTable tbody tr");
                        const showMoreButtonCust = document.getElementById("showMoreButtonCust");
                        const showLessButtonCust = document.getElementById("showLessButtonCust");
                        const showMoreButtonPre = document.getElementById("showMoreButtonPre");
                        const showLessButtonPre = document.getElementById("showLessButtonPre");
                        const showMoreButtonPost = document.getElementById("showMoreButtonPost");
                        const showLessButtonPost = document.getElementById("showLessButtonPost");
                        const showMoreButtonCall = document.getElementById("showMoreButtonCall");
                        const showLessButtonCall = document.getElementById("showLessButtonCall");
                        const showMoreButtonPay = document.getElementById("showMoreButtonPay");
                        const showLessButtonPay = document.getElementById("showLessButtonPay");
                        const showMoreButtonBank = document.getElementById("showMoreButtonBank");
                        const showLessButtonBank = document.getElementById("showLessButtonBank");
                        const showMoreButtonComp = document.getElementById("showMoreButtonComp");
                        const showLessButtonComp = document.getElementById("showLessButtonComp");
                        const rowsToShow = 11; 

                        // Initially hide rows beyond the specified limit
                        hideRowsBeyondLimit(customerTableRows, rowsToShow);
                        hideRowsBeyondLimit(prepaidPlanTableRows, rowsToShow);
                        hideRowsBeyondLimit(postpaidPlanTableRows, rowsToShow);
                        hideRowsBeyondLimit(callRecordTableRows, rowsToShow);
                        hideRowsBeyondLimit(paymentTableRows, rowsToShow);
                        hideRowsBeyondLimit(bankaccountTableRows, rowsToShow);
                        hideRowsBeyondLimit(competitorsTableRows, rowsToShow);

                        // Hide the "Show More" button if rows exceed the limit
                        if (customerTableRows.length <= rowsToShow) {
                            showMoreButtonCust.style.display = "none";
                        }
                        if (prepaidPlanTableRows.length <= rowsToShow) {
                            showMoreButtonPre.style.display = "none";
                        }
                        if (postpaidPlanTableRows.length <= rowsToShow) {
                            showMoreButtonPost.style.display = "none";
                        }
                        if (callRecordTableRows.length <= rowsToShow) {
                            showMoreButtonCall.style.display = "none";
                        }
                        if (paymentTableRows.length <= rowsToShow) {
                            showMoreButtonPay.style.display = "none";
                        }
                        if (bankaccountTableRows.length <= rowsToShow) {
                            showMoreButtonBank.style.display = "none";
                        }
                        if (competitorsTableRows.length <= rowsToShow) {
                            showMoreButtonComp.style.display = "none";
                        }

                        // Add event listener to the "Show More" button
                        showMoreButtonCust.addEventListener("click", function () {
                            showAllRows(customerTableRows);
                            showMoreButtonCust.style.display = "none";
                            showLessButtonCust.style.display = "";
                        });
                        showMoreButtonPre.addEventListener("click", function () {
                            showAllRows(prepaidPlanTableRows);
                            showMoreButtonPre.style.display = "none";
                            showLessButtonPre.style.display = "";
                        });
                        showMoreButtonPost.addEventListener("click", function () {
                            showAllRows(postpaidPlanTableRows);
                            showMoreButtonPost.style.display = "none";
                            showLessButtonPost.style.display = "";
                        });
                        showMoreButtonCall.addEventListener("click", function () {
                            showAllRows(callRecordTableRows);
                            showMoreButtonCall.style.display = "none";
                            showLessButtonCall.style.display = "";
                        });
                        showMoreButtonPay.addEventListener("click", function () {
                            showAllRows(paymentTableRows);
                            showMoreButtonPay.style.display = "none";
                            showLessButtonPay.style.display = "";
                        });
                        showMoreButtonBank.addEventListener("click", function () {
                            showAllRows(bankaccountTableRows);
                            showMoreButtonBank.style.display = "none";
                            showLessButtonBank.style.display = "";
                        });
                        showMoreButtonComp.addEventListener("click", function () {
                            showAllRows(competitorsTableRows);
                            showMoreButtonComp.style.display = "none";
                            showLessButtonComp.style.display = "";
                        });

                        // Add event listener to the "Show Less" button
                        showLessButtonCust.addEventListener("click", function() {
                            hideRowsBeyondLimit(customerTableRows, rowsToShow);
                            showMoreButtonCust.style.display = "";
                            showLessButtonCust.style.display = "none";
                        });
                        showLessButtonPre.addEventListener("click", function() {
                            hideRowsBeyondLimit(prepaidPlanTableRows, rowsToShow);
                            showMoreButtonPre.style.display = "";
                            showLessButtonPre.style.display = "none";
                        });
                        showLessButtonPost.addEventListener("click", function() {
                            hideRowsBeyondLimit(postpaidPlanTableRows, rowsToShow);
                            showMoreButtonPost.style.display = "";
                            showLessButtonPost.style.display = "none";
                        });
                        showLessButtonCall.addEventListener("click", function() {
                            hideRowsBeyondLimit(callRecordTableRows, rowsToShow);
                            showMoreButtonCall.style.display = "";
                            showLessButtonCall.style.display = "none";
                        });
                        showLessButtonPay.addEventListener("click", function() {
                            hideRowsBeyondLimit(paymentTableRows, rowsToShow);
                            showMoreButtonPay.style.display = "";
                            showLessButtonPay.style.display = "none";
                        });
                        showLessButtonBank.addEventListener("click", function() {
                            hideRowsBeyondLimit(bankaccountTableRows, rowsToShow);
                            showMoreButtonBank.style.display = "";
                            showLessButtonBank.style.display = "none";
                        });
                        showLessButtonComp.addEventListener("click", function() {
                            hideRowsBeyondLimit(competitorsTableRows, rowsToShow);
                            showMoreButtonComp.style.display = "";
                            showLessButtonComp.style.display = "none";
                        });
                    });

                    function hideRowsBeyondLimit(rows, limit) {
                        for (let i = limit; i < rows.length; i++) {
                            rows[i].style.display = "none";
                        }
                    }

                    function showAllRows(rows) {
                        for (let i = 0; i < rows.length; i++) {
                            rows[i].style.display = "";
                        }
                    }
                </script>
            </head>
            <body>
                <h1>Database</h1>
                <a href="/">Back to Main Page</a>
                ${customerHtml}
                <button id="showLessButtonCust" style="display: none;">Collapse</button>
                <button id="showMoreButtonCust">Show All Rows</button>
                ${prepaidPlanHtml}
                <button id="showLessButtonPre" style="display: none;">Collapse</button>
                <button id="showMoreButtonPre">Show All Rows</button>
                <button id="addPrepaidPlanBtn">Add a new Prepaid Plan</button>
                <div id="addPrepaidPlanModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <h2>Add New Prepaid Plan</h2>
                        <form id="addPrepaidPlanForm">
                            <label for="planName">Plan Name:</label>
                            <input type="text" id="planName" name="planName" required><br><br>
                            <label for="allottedMinutes">Allotted Minutes:</label>
                            <input type="number" id="allottedMinutes" name="allottedMinutes" required><br><br>
                            <label for="allottedData">Allotted Data:</label>
                            <input type="number" id="allottedData" name="allottedData" required><br><br>
                            <label for="upfrontCost">Upfront Cost:</label>
                            <input type="number" id="upfrontCost" name="upfrontCost" required><br><br>
                            <button type="submit">Submit</button>
                            <button type="button" class="cancel">Cancel</button>
                        </form>
                    </div>
                </div>
                <script>
                    // Get the modal
                    var modal = document.getElementById('addPrepaidPlanModal');
              
                    // Get the button that opens the modal
                    var btn = document.getElementById('addPrepaidPlanBtn');
              
                    // Get the <span> element that closes the modal
                    var span = document.getElementsByClassName('close')[0];
              
                    // When the user clicks the button, open the modal
                    btn.onclick = function() {
                    modal.style.display = 'block';
                    }
              
                    // When the user clicks on <span> (x), close the modal
                    span.onclick = function() {
                    modal.style.display = 'none';
                    }
              
                    // When the user clicks on Cancel button, close the modal
                    document.querySelector('.modal .cancel').onclick = function() {
                    modal.style.display = 'none';
                    }
                    
                    // When the user submits the form, handle the form submission via AJAX
                    document.getElementById('addPrepaidPlanForm').addEventListener('submit', async function(event) {
                        event.preventDefault();

                        // Get form data
                        const planName = document.getElementById('planName').value;
                        const allottedMinutes = document.getElementById('allottedMinutes').value;
                        const allottedData = document.getElementById('allottedData').value;
                        const upfrontCost = document.getElementById('upfrontCost').value;

                        try {
                            // Send AJAX request to update the prepaidplan table
                            const response = await fetch('/addPrepaidPlan', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    planName: planName,
                                    allottedMinutes: allottedMinutes,
                                    allottedData: allottedData,
                                    upfrontCost: upfrontCost
                                })
                            });

                            // Handle the response
                            const data = await response.json();
                            // Handle the response data as needed (e.g., show a success message, update the table)
                            console.log(data);
                
                            // Reload the page after successful submission
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                // Handle the error here
                                console.error('Error:', data.error);
                            }
                
                            // Close the modal after successful submission
                            modal.style.display = 'none';
                        } catch (error) {
                            // Handle errors here
                            console.error('Error:', error);
                        }
                    });
                </script>
                ${postpaidPlanHtml}
                <button id="showLessButtonPost" style="display: none;">Collapse</button>
                <button id="showMoreButtonPost">Show All Rows</button>
                <button id="addPostpaidPlanBtn">Add a new Postpaid Plan</button>
                <div id="addPostpaidPlanModal" class="modal" style="display: none;">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <h2>Add New Postpaid Plan</h2>
                        <!-- Postpaid Plan Form -->
                        <form id="addPostpaidPlanForm">
                            <label for="postpaidPlanName">Plan Name:</label>
                            <input type="text" id="postpaidPlanName" name="postpaidPlanName" required><br><br>
                            <label for="postpaidAllottedMinutes">Allotted Minutes:</label>
                            <input type="number" id="postpaidAllottedMinutes" name="postpaidAllottedMinutes" required><br><br>
                            <label for="postpaidAllottedData">Allotted Data (in GB):</label>
                            <input type="number" id="postpaidAllottedData" name="postpaidAllottedData" required><br><br>
                            <label for="postpaidMonthlyFee">Monthly Fee:</label>
                            <input type="number" id="postpaidMonthlyFee" name="postpaidMonthlyFee" required><br><br>
                            <button type="submit">Submit</button>
                            <button type="button" class="cancel">Cancel</button>
                        </form>                        
                    </div>
                </div>            
                <script>
                    // Get the modal for adding Postpaid plans
                    var postpaidModal = document.getElementById('addPostpaidPlanModal');
                    var postpaidBtn = document.getElementById('addPostpaidPlanBtn');
                    var postpaidCloseBtn = postpaidModal.querySelector('.close');
                
                    // When the user clicks the button, open the modal for adding Postpaid plans
                    postpaidBtn.onclick = function() {
                        postpaidModal.style.display = 'block';
                    }
                
                    // When the user clicks on <span> (x), close the Postpaid plans modal
                    postpaidCloseBtn.onclick = function() {
                        postpaidModal.style.display = 'none';
                    }
                
                    // When the user clicks on Cancel button, close the Postpaid plans modal
                    document.querySelector('#addPostpaidPlanModal .cancel').onclick = function() {
                        postpaidModal.style.display = 'none';
                    }
        
                    // When the user submits the form for adding Postpaid plans, handle the form submission via AJAX
                    document.getElementById('addPostpaidPlanForm').addEventListener('submit', async function(event) {
                        event.preventDefault();
                        
                        // Get form data for adding Postpaid plans
                        const postpaidPlanName = document.getElementById('postpaidPlanName').value;
                        const monthlyFee = parseFloat(document.getElementById('postpaidMonthlyFee').value);
                        const allottedMinutes = parseFloat(document.getElementById('postpaidAllottedMinutes').value);
                        const allottedData = parseFloat(document.getElementById('postpaidAllottedData').value);
                
                        try {
                            // Send AJAX request to add a new row to the Postpaid table
                            const response = await fetch('/addPostpaidPlan', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    postpaidPlanName: postpaidPlanName,
                                    monthlyFee: monthlyFee,
                                    allottedMinutes: allottedMinutes,
                                    allottedData: allottedData
                                })
                            });
                    
                            // Handle the response from the server
                            const data = await response.json();
                            console.log(data);
                    
                            // Reload the page after successful submission
                            if (response.ok) {
                                window.location.reload();
                            } else {
                                // Handle the error here
                                console.error('Error:', data.error);
                            }
                        } catch (error) {
                            // Handle errors here
                            console.error('Error:', error);
                        }
                    });                    
                </script>
                ${callRecordHtml}
                <button id="showLessButtonCall" style="display: none;">Collapse</button>
                <button id="showMoreButtonCall">Show All Rows</button>
                ${paymentHtml}
                <button id="showLessButtonPay" style="display: none;">Collapse</button>
                <button id="showMoreButtonPay">Show All Rows</button>
                ${bankaccountHtml}
                <button id="showLessButtonBank" style="display: none;">Collapse</button>
                <button id="showMoreButtonBank">Show All Rows</button>
                ${competitorsHtml}
                <button id="showLessButtonComp" style="display: none;">Collapse</button>
                <button id="showMoreButtonComp">Show All Rows</button>

                <h2>Insightful Information Queries</h2>
                <div style="text-align: left; margin-left: 175px;">
                    <span style="text-decoration:underline;">Total Customers:</span> ${totalcustHTML} 
                    <p></p>
                </div>
                <div style="text-align: left; margin-left: 175px;">
                    <span style="text-decoration:underline;">Total Call Durations for Prepaid Customers:</span> ${precalldurHTML}
                    <p></p>
                </div>
                <div style="text-align: left; margin-left: 175px;">
                    <span style="text-decoration:underline;">Top 3 Callers:</span> ${topcallersHTML}
                    <p></p>
                </div>
                <div style="text-align: left; margin-left: 175px;">
                    <span style="text-decoration:underline;">Average Call Duration:</span> ${avgcalldurationHTML} 
                    <p></p>
                </div>
                <div style="text-align: left; margin-left: 175px;">
                    <span style="text-decoration:underline;">Total Payments and Remaining Balance:</span> ${payandBalanceHTML} 
                    <p></p>
                </div>

                <h2>Create a New Table</h2>
                <form method="post" action="/create-table" id="createTableForm">
                    <label for="tableName">Table Name:</label>
                    <input type="text" id="tableName" name="tableName" required>
                    <br><br>
                    <label for="columns">Columns (Format: columnn1 datatype, column2 datatype, etc.):</label>
                    <input type="text" id="columns" name="columns" required>
                    <br><br>
                    <label for="numRows">Number of Rows:</label>
                    <input type="number" id="numRows" name="numRows" required>
                    <br><br>
                    <button type="submit">Create Table</button>
                </form>
                <div id="tableContainer"></div>
                <script>
                    async function createTable(event) {
                        event.preventDefault();
            
                        const form = document.getElementById('createTableForm');
                        const formData = new FormData(form);
            
                        try {
                            const response = await fetch('/create-table', {
                                method: 'POST',
                                body: formData,
                            });
            
                            if (response.ok) {
                                const result = await response.text();
                                console.log('Server response:', result);
                                document.getElementById('tableContainer').innerHTML = result;
                            } else {
                                console.error('Failed to create table:', response.status, response.statusText);
                            }
                        } catch (error) {
                            console.error('Error creating table:', error);
                        }
                    }
                </script>
                <h2>Delete Rows from Table</h2>
                <form method="post" action="/database">
                    <!-- Form elements -->
                    <label for="tableName">Select Table:</label>
                    <select id="tableName" name="tableName">
                        <!-- Options for table selection -->
                        <option value="customer">Customer</option>
                        <option value="prepaidplan">Prepaid Plan</option>
                        <option value="postpaidplan">Postpaid Plan</option>
                        <option value="callrecord">Call Record</option>
                        <option value="payment">Payment</option>
                        <option value="bankaccount">Bankaccount</option>
                        <option value="competitors">Competitors</option>
                    </select>

                    <button type="button" onclick="
                    const selectedTable = document.getElementById('tableName').value;
                    console.log('Selected Table:', selectedTable);
                    if (selectedTable !== 'competitors') {
                        const userConfirmed = confirm('WARNING: This action is DANGEROUS and will delete all rows from the selected table. THE WEBSITE MAY NOT WORK AS EXPECTED. Do you want to proceed?');
                        if (userConfirmed) {
                            document.getElementById('confirmDelete').value = 'true';
                            document.querySelector('form').submit();
                        } else {
                            // If user cancels, do nothing
                        }
                    } else if (selectedTable == 'competitors') {
                        // If 'Competitors' is selected, proceed without showing the warning message
                        document.getElementById('confirmDelete').value = 'true';
                        document.querySelector('form').submit();
                    }
                    ">Delete Rows</button>

                    <input type="hidden" id="confirmDelete" name="confirmDelete" value="false">
                </form>            
            </body>
            </html>
        `;
        // Sending the HTML response to the client
        res.send(htmlContent);
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});

// Handle POST request to add a new prepaid plan
app.post('/addPrepaidPlan', async (req, res) => {
    try {
      const { planName, allottedMinutes, allottedData, upfrontCost } = req.body;
  
      // Perform database insertion here (using pool.query or any other database ORM)
      await pool.query('INSERT INTO prepaidplan (plan_name, allotted_minutes, allotted_data, upfront_cost) VALUES ($1, $2, $3, $4)', [planName, allottedMinutes, allottedData, upfrontCost]);
  
      // Send success response
      res.json({ message: 'Prepaid plan added successfully!' });
    } catch (error) {
      // Handle errors
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
// Handle POST request to add a new postpaid plan
app.post('/addPostpaidPlan', async (req, res) => {
    try {
        const { postpaidPlanName, allottedMinutes, allottedData, monthlyFee } = req.body;

        // Validate numeric values
        if (isNaN(allottedMinutes) || isNaN(allottedData) || isNaN(monthlyFee) || allottedMinutes <= 0 || allottedData <= 0 || monthlyFee <= 0) {
            // If any value is not a valid numeric value or is non-positive, send an error response
            return res.status(400).json({ error: 'Invalid input. Please provide valid numeric values for allotted minutes, allotted data, and monthly fee.' });
        }

        // Perform database insertion for Postpaid plans
        await pool.query('INSERT INTO postpaidplan (plan_name, allotted_minutes, allotted_data, monthly_fee) VALUES ($1, $2, $3, $4)', [postpaidPlanName, allottedMinutes, allottedData, monthlyFee]);

        // Send success response
        res.json({ message: 'Postpaid plan added successfully!' });
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Function to generate random data for a given data type
function getRandomData(dataType) {
    if (dataType === 'VARCHAR(255)') {
        // Generate a random string for VARCHAR(255)
        return Math.random().toString(36).substring(2, 10);
    } else if (dataType === 'INT') {
        // Generate a random integer for INT
        return Math.floor(Math.random() * 100);
    } else if (dataType === 'FLOAT') {
        // Generate a random floating-point number for FLOAT
        return Math.random() * 100;
    }
    // Add more cases for other data types as needed
}

app.post('/create-table', async (req, res) => {
    const { tableName, columns, numRows } = req.body;

    try {
        // Attempt to fetch the table
        let tableData;
        try {
            tableData = await pool.query(`SELECT * FROM ${tableName}`);
        } catch (fetchError) {
            // If an error occurs during fetching, it means the table doesn't exist
            // Ignore the error, and proceed to create the table
        }

        // If the table exists, print it
        if (tableData && tableData.rows.length > 0) {
            const tableHtml = generateHtmlTable(tableData.rows, tableName, 'dynamicTable');
            res.send(`<h2>This table has already been created, fetching table info...</h2>` + tableHtml + `<a href="/database">Go back to database</a>`);
        } else {
            // If the table doesn't exist, create it
            await pool.query(`
                CREATE TABLE ${tableName} (
                    ${columns}
                );
            `);

            // Extract column names and data types from the columns string
            const columnDefinitions = columns.split(',').map(colDef => colDef.trim());
            const columnNames = columnDefinitions.map(colDef => colDef.split(' ')[0]);

            // Generate random data for each column and the specified number of rows
            const randomData = Array.from({ length: numRows }, () =>
                columnDefinitions.map(colDef => getRandomData(colDef.split(' ')[1]))
            );

            // Ensure no 'undefined' values in random data
            const sanitizedRandomData = randomData.map(row =>
                row.map(value => (value !== undefined ? value : null))
            );

            // Insert the generated random data into the table
            const insertQuery = `
                INSERT INTO ${tableName} (${columnNames.join(', ')})
                VALUES ${sanitizedRandomData
                    .map(row => `(${row.map(val => (val !== null ? `'${val}'` : 'NULL')).join(', ')})`)
                    .join(', ')}
            `;
            await pool.query(insertQuery);

            // Fetch the data from the newly created table
            const createdTableData = await pool.query(`SELECT * FROM ${tableName}`);

            // Generate HTML representation of the created table data
            const createdTableHtml = generateHtmlTable(createdTableData.rows, tableName, 'dynamicTable');

            // Send the HTML representation of the created table in the response
            res.send(`<h2>Here is your created table:</h2>` + createdTableHtml + `<a href="/database">Go back to database</a>`);
        }
    } catch (error) {
        res.status(500).send("Error creating or fetching table: " + error.message);
    }
});

// Handle POST request to delete rows from a table
app.post('/database', async (req, res) => {
    const { tableName, confirmDelete } = req.body;
    console.log('Confirm Delete:', confirmDelete);
    console.log('Table Name:', tableName);

    // Check if the user confirmed the deletion
    if (confirmDelete === 'true') {
        try {
            // Validate the selected table name to prevent SQL injection
            const allowedTables = ['customer', 'prepaidplan', 'postpaidplan', 'callrecord', 'payment', 'bankaccount', 'competitors'];
            if (!allowedTables.includes(tableName)) {
                return res.status(400).send('Invalid table name');
            }

            // Construct the SQL delete query
            const deleteQuery = `DELETE FROM ${tableName}`;

            // Execute the delete query
            await pool.query(deleteQuery);
                   
            // Redirect back to the main database page after deletion
            res.redirect('/database');
        } catch (error) {
            res.status(500).send("Error: " + error.message);
        }
    } else {
        // If user did not confirm, redirect back to the main database page
        res.redirect('/database');
    }
});

// Add this endpoint to your server
app.get('/getPlans', async (req, res) => {
    try {
        // Query the database to get the list of prepaid plans
        const prepaidPlansResult = await pool.query('SELECT plan_name FROM prepaidplan');
        const prepaidPlans = prepaidPlansResult.rows.map(row => row.plan_name);

        // Query the database to get the list of postpaid plans
        const postpaidPlansResult = await pool.query('SELECT plan_name FROM postpaidplan');
        const postpaidPlans = postpaidPlansResult.rows.map(row => row.plan_name);

        // Send the list of plans to the client
        res.json({ prepaidPlans, postpaidPlans });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/addCustomer', (req, res) => {
    const transactionForm = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Transaction</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    text-align: center;
                    padding: 50px;
                }
                h1 {
                    color: #333;
                }
                form {
                    margin-top: 20px;
                }
                input, button {
                    margin-bottom: 20px;
                }
                button {
                    margin-top: 20px;
                }
                #firstName {
                    margin-top: 20px;
                }
                #planType {
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <h1>Add a customer</h1>
            <form action="/addCustomer" method="post">

                <label for="planType">Select Plan Type:</label>
                <select id="planType" name="planType" required onchange="showPlanOptions()">
                    <option value="" disabled selected>Select Plan Type</option>
                    <option value="prepaid">Prepaid</option>
                    <option value="postpaid">Postpaid</option>
                </select><br>
                
                <div id="planOptionsContainer" style="display: none;">
                    <label for="planOptions">Select a Plan:</label>
                    <select id="planOptions" name="planOptions" required>
                        <option value="" disabled selected>Select a Plan</option>
                    </select><br>
                </div>
            
                <label for="firstName">First Name:</label>
                <input type="text" id="firstName" name="firstName" required><br>
                <label for="lastName">Last Name:</label>
                <input type="text" id="lastName" name="lastName" required><br>
                <label for="customerAddress">Customer Address:</label>
                <input type="text" id="customerAddress" name="customerAddress" required><br>
                <label for="customerPhoneNumber">Customer Phone Number:</label>
                <input type="tel" id="customerPhoneNumber" name="customerPhoneNumber" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" required title="Please enter the phone number in XXX-XXX-XXXX format"><br>

                <label for="paymentType">Payment Type:</label>
                <select id="paymentType" name="paymentType" required>
                    <option value="" disabled selected>Select Payment Type</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                </select><br>

                <button type="submit">Submit</button>
            </form>
            <script>
                async function fetchPlans() {
                    try {
                        const response = await fetch('/getPlans');
                        const data = await response.json();
        
                        const planTypeDropdown = document.getElementById("planType");
                        const planOptionsDropdown = document.getElementById("planOptions");
        
                        // Clear existing options
                        planOptionsDropdown.innerHTML = '<option value="" disabled selected>Select a Plan</option>';
        
                        // Populate plan options based on the selected plan type
                        if (planTypeDropdown.value === "prepaid") {
                            for (const plan of data.prepaidPlans) {
                                const option = document.createElement("option");
                                option.text = plan;
                                option.value = "prepaid_" + plan; // You may need to adjust the value as per your needs
                                planOptionsDropdown.appendChild(option);
                            }
                        } else if (planTypeDropdown.value === "postpaid") {
                            for (const plan of data.postpaidPlans) {
                                const option = document.createElement("option");
                                option.text = plan;
                                option.value = "postpaid_" + plan; // You may need to adjust the value as per your needs
                                planOptionsDropdown.appendChild(option);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching plans:', error);
                    }
                }
        
                function showPlanOptions() {
                    fetchPlans();
                    var planType = document.getElementById("planType").value;
                    var planOptionsContainer = document.getElementById("planOptionsContainer");
        
                    // Show the planOptionsContainer
                    planOptionsContainer.style.display = "block";
                }
            </script>        
        </body>
        </html>
    `;
    res.send(transactionForm);
});

// Handle the POST request for adding a customer
app.post('/addCustomer', async (req, res) => {
        const { firstName, lastName, customerAddress, customerPhoneNumber, planType, planOptions, paymentType} = req.body;
        const sqlStatements = []; // Array to store SQL statements

        // Combine first name and last name into the desired format
        const customerName = `${firstName} ${lastName}`;

        const randomNumber = Math.floor(Math.random() * 90000000) + 10000000;

        const startTime = new Date();


        let planCost;

        if (planType === 'prepaid') {
            const planInfo = planOptions.split('_'); // Split the planOptions to get plan type and plan name
            const prepaidPlanName = planInfo[1];

            // Fetch the prepaid plan ID dynamically from the database
            const prepaidPlanIdQuery = await pool.query('SELECT plan_name, upfront_cost FROM prepaidplan WHERE plan_name = $1', [prepaidPlanName]);
            sqlStatements.push(`SELECT plan_name, upfront_cost FROM prepaidplan WHERE plan_name = ${prepaidPlanName};`)

            if (prepaidPlanIdQuery.rows.length > 0) {
                const prepaidPlanId = prepaidPlanIdQuery.rows[0].plan_name;
                planCost = prepaidPlanIdQuery.rows[0].upfront_cost;

                try{
                    await pool.query(`BEGIN;
                                    INSERT INTO customer (prepaid_plan, customer_name, customer_address, customer_phone_number, amount_due, payment_type, payment_method) 
                                    VALUES ('${prepaidPlanId}', '${customerName}', '${customerAddress}', '${customerPhoneNumber}', ${planCost}, '${paymentType}', 'Card');
                                    INSERT INTO bankaccount (customer_phone_number, account_number, balance) VALUES ('${customerPhoneNumber}', ${randomNumber}, 1000);
                                    COMMIT;`);
                                    
                    sqlStatements.push(`BEGIN;`)
                
                    sqlStatements.push(`INSERT INTO customer (prepaid_plan, customer_name, customer_address, customer_phone_number, amount_due, payment_type, payment_method) VALUES (${prepaidPlanId}, '${customerName}', '${customerAddress}', '${customerPhoneNumber}', ${planCost}, '${paymentType}', 'Card')`);

                    sqlStatements.push(`INSERT INTO bankaccount (customer_phone_number, account_number, balance) VALUES (${customerPhoneNumber}, ${randomNumber}, 1000);`);

                    sqlStatements.push(`COMMIT;`)
                }

                catch (error) {
                    await pool.query('ROLLBACK;'); // Rollback the transaction in case of an error
                    sqlStatements.push('ROLLBACK;')
                    res.status(500).send("Error: " + error.message);
                }

            } 
            
            else {
                // Invalid prepaid plan option
                throw new Error('Invalid prepaid plan option selected.');
            }
        } 

        else if (planType === 'postpaid') {
            const planInfo = planOptions.split('_'); // Split the planOptions to get plan type and plan name
            const postpaidPlanName = planInfo[1];

            // Fetch the postpaid plan ID dynamically from the database
            const postpaidPlanIdQuery = await pool.query('SELECT plan_name, monthly_fee FROM postpaidplan WHERE plan_name = $1', [postpaidPlanName]);
            sqlStatements.push(`SELECT plan_name, monthly_fee FROM postpaidplan WHERE plan_name = ${postpaidPlanName};`)

            if (postpaidPlanIdQuery.rows.length > 0) {
                const postpaidPlanId = postpaidPlanIdQuery.rows[0].plan_name;
                planCost = postpaidPlanIdQuery.rows[0].monthly_fee;

                try{
                    await pool.query(`BEGIN;
                                    INSERT INTO customer (postpaid_plan, customer_name, customer_address, customer_phone_number, amount_due, payment_type, payment_method) 
                                    VALUES ('${postpaidPlanId}', '${customerName}', '${customerAddress}', '${customerPhoneNumber}', ${planCost}, '${paymentType}', 'Card');
                                    INSERT INTO bankaccount (customer_phone_number, account_number, balance) VALUES ('${customerPhoneNumber}', ${randomNumber}, 1000);
                                    COMMIT;`);
                                    
                    sqlStatements.push(`BEGIN;`)
                
                    sqlStatements.push(`INSERT INTO customer (postpaid_plan, customer_name, customer_address, customer_phone_number, amount_due, payment_type, payment_method) VALUES (${postpaidPlanId}, '${customerName}', '${customerAddress}', '${customerPhoneNumber}', ${planCost}, '${paymentType}', 'Card');`);

                    sqlStatements.push(`INSERT INTO bankaccount (customer_phone_number, account_number, balance) VALUES (${customerPhoneNumber}, ${randomNumber}, 1000);`);

                    sqlStatements.push(`COMMIT;`)
                }
                
                catch (error) {
                    await pool.query('ROLLBACK;'); // Rollback the transaction in case of an error
                    sqlStatements.push('ROLLBACK;')
                    res.status(500).send("Error: " + error.message);
                }
            } else {
                // Invalid postpaid plan option
                throw new Error('Invalid postpaid plan option selected.');
            }
        } else {
            // Invalid plan type
            throw new Error('Invalid plan type selected.');
        }

        const endTime = new Date();
        customerTransactionTimes.push(endTime - startTime);

        // Render the response with SQL statements
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Add Customer Result</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    text-align: center;
                    padding: 50px;
                }
                h1 {
                    color: #333;
                }
                p {
                    color: #333;
                    font-weight: bold;
                    margin-top: 20px;
                }
                pre {
                    background-color: #f2f2f2;
                    padding: 10px;
                    white-space: pre-wrap;
                    text-align: left;
                    margin-top: 10px;
                    overflow-x: auto;
                }
                a {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: bold;
                    margin-top: 20px;
                    display: block;
                }
                a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <h1>Customer Addition Successful</h1>
            <p>SQL Statements:</p>
            <pre>${sqlStatements.join('\n')}</pre>
            <p>Transaction Time: ${endTime - startTime} milliseconds</p>
            <a href="/database">Go back to database</a>
        </body>
        </html>
        
        `);
});

app.get('/calls', (req, res) => {
    const formData = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Call and Payment</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
                text-align: center;
                padding: 50px;
            }
            h1 {
                color: #333;
            }
            form {
                margin-top: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            label, input {
                margin-bottom: 20px;
            }
            button {
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <h1>Add a call</h1>
        <form action="/calls" method="post">
            <label for="callerNumber">Caller Number:</label>
            <input type="tel" id="callerNumber" name="callerNumber" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" required title="Please enter the phone number in XXX-XXX-XXXX format"><br>
            
            <label for="receiverNumber">Receiver Number:</label>
            <input type="tel" id="receiverNumber" name="receiverNumber" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" required title="Please enter the phone number in XXX-XXX-XXXX format"><br>
            
            <label for="callDuration">Call Duration (in minutes):</label>
            <input type="number" id="callDuration" name="callDuration" required min="0"><br>
            
            <label for="dataUsage">Data Usage (in MB):</label>
            <input type="number" id="dataUsage" name="dataUsage" step="0.01" required min="0"><br>            
            
            <button type="submit">Submit</button>
        </form>
    </body>
    </html>        
    `;
    res.send(formData);
});

app.get('/calls', (req, res) => {
    const formData = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Call and Payment</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
                text-align: center;
                padding: 50px;
            }
            h1 {
                color: #333;
            }
            form {
                margin-top: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            label, input {
                margin-bottom: 20px;
            }
            button {
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <h1>Call and Payment</h1>
        <form action="/calls" method="post">
            <label for="callerNumber">Caller Number:</label>
            <input type="tel" id="callerNumber" name="callerNumber" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" required title="Please enter the phone number in XXX-XXX-XXXX format"><br>
            
            <label for="receiverNumber">Receiver Number:</label>
            <input type="tel" id="receiverNumber" name="receiverNumber" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" required title="Please enter the phone number in XXX-XXX-XXXX format"><br>
            
            <label for="callDuration">Call Duration (in minutes):</label>
            <input type="number" id="callDuration" name="callDuration" required min="0"><br>
            
            <label for="dataUsage">Data Usage (in MB):</label>
            <input type="number" id="dataUsage" name="dataUsage" step="0.01" required min="0"><br>            
            
            <button type="submit">Submit</button>
        </form>
    </body>
    </html>        
    `;
    res.send(formData);
});

app.post('/calls', async (req, res) => {
    // Extract call details from the form data
    const { callerNumber, receiverNumber, callDuration, dataUsage } = req.body;
    const sqlStatements = []; // Array to store SQL statements

    try {
        // Check if the caller's phone number exists in the database
        const callerExistsQuery = await pool.query('SELECT customer_phone_number, Total_Data_Usage, Total_Minutes FROM customer WHERE customer_phone_number = $1 ORDER BY customer_phone_number', [callerNumber]);
        sqlStatements.push(`SELECT customer_phone_number, Total_Data_Usage, Total_Minutes FROM customer WHERE customer_phone_number = ${callerNumber} ORDER BY customer_phone_number;`);

        if (callerExistsQuery.rows.length > 0) {
            // Check if the receiver's phone number exists in the database
            const receiverExistsQuery = await pool.query('SELECT customer_phone_number, Total_Data_Usage, Total_Minutes FROM customer WHERE customer_phone_number = $1 ORDER BY customer_phone_number', [receiverNumber]);
            sqlStatements.push(`SELECT customer_phone_number, Total_Data_Usage, Total_Minutes FROM customer WHERE customer_phone_number = ${receiverNumber} ORDER BY customer_phone_number;`);        

            const startTime = new Date();

            // Update caller's and receiver's information within a single transaction
            await pool.query(`
            BEGIN;

            INSERT INTO callrecord (customer_phone_number, call_duration, data_usage, call_cost) 
            VALUES ('${callerNumber}', ${parseInt(callDuration)}, ${parseFloat(dataUsage)}, 0);

            ${receiverExistsQuery.rows.length > 0 ? `
                UPDATE customer 
                SET Total_Data_Usage = Total_Data_Usage + ${parseFloat(dataUsage)},
                    Total_Minutes = Total_Minutes + ${parseInt(callDuration)}
                WHERE customer_phone_number = '${receiverNumber}';
            ` : ''}

            UPDATE customer 
            SET Total_Data_Usage = Total_Data_Usage + ${parseFloat(dataUsage)},
                Total_Minutes = Total_Minutes + ${parseInt(callDuration)}
            WHERE customer_phone_number = '${callerNumber}';

            COMMIT;
            `);

            const endTime = new Date();
            callTransactionTimes.push(endTime - startTime);

            // Render the response with SQL statements
            return res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f5f5f5;
                        text-align: center;
                        padding: 50px;
                    }
                    h1 {
                        color: #333;
                    }
                    p {
                        color: #333;
                        font-weight: bold;
                        margin-top: 20px;
                    }
                    pre {
                        background-color: #f2f2f2;
                        padding: 10px;
                        white-space: pre-wrap;
                        text-align: left;
                        margin-top: 10px;
                        overflow-x: auto;
                    }
                    a {
                        color: #007bff;
                        text-decoration: none;
                        font-weight: bold;
                        margin-top: 20px;
                        display: block;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                    </style>
                </head>
                <body>
                    <h1>Call Record Addition Successful</h1>
                    <p>SQL Statements:</p>
                    <pre>${sqlStatements.join('\n')}</pre>
                    <p>Transaction Time: ${endTime - startTime} milliseconds</p>
                    <a href="/database">Go back to database</a>
                </body>
                </html>
            `);
        } else {
            // Caller number does not exist in the customer database
            const errorMessage = `
                <html>
                <head>
                    <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f5f5f5;
                        text-align: center;
                        padding: 50px;
                    }
                    h1 {
                        color: #333;
                    }
                    form {
                        margin-top: 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    label, input {
                        margin-bottom: 20px;
                    }
                    button {
                        margin-top: 20px;
                    }
                    a {
                        color: #007bff;
                        text-decoration: none;
                        font-weight: bold;
                        margin-right: 20px;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                    </style>
                </head>
                <body>
                    <h1>Caller Number does not exist in the database.</h1>
                    <p>Please make sure you add the customer first.</p>
                    <a href='/'>Go back to Main Page</a>
                </body>
                </html>
            `;
            return res.status(400).send(errorMessage);
        }
    } catch (error) {
        await pool.query('ROLLBACK;'); // Rollback the transaction in case of an error
        return res.status(500).send("Error: " + error.message);
    }
});

app.get('/existingcustomer', (req, res) => {
    const existingcustomerform = `
        <!DOCTYPE html>
        <html lang ="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Existing Customer</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    text-align: center;
                    padding: 50px;
                }
                h1 {
                    color: #333;
                }
                form {
                    margin-top: 20px;
                }
                input {
                    margin-bottom: 20px;
                    padding: 5px;
                }
                button {
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    padding: 10px 20px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #0056b3;
                }
                table {
                    width: 80%;
                    margin: 20px auto;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 10px;
                    border: 1px solid #ddd;
                }
                th {
                    background-color: #f2f2f2;
                }
                a {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: bold;
                    margin-right: 20px;
                }
                a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <h1>Existing Customer</h1>
            <form action="/existingcustomer" method="post">
                <label for="customerPhone">Customer Phone Number:</label>
                <input type="text" id="customerPhone" name="customerPhone" required>
                <button type="submit">Search</button>
            </form>
        </body>
        </html>
    `;
    res.send(existingcustomerform);
});

app.post('/existingcustomer', async (req, res) => {
    try {
        const { customerPhone } = req.body;

        // Use SQL query to retrieve customer details, call records, and payment history
        const customerDetails = await pool.query(`
        SELECT
        c.customer_name, c.customer_address,c.customer_phone_number,
        coalesce(pp.allotted_minutes, pop.allotted_minutes) as allotted_minutes,
        coalesce(pp.allotted_data, pop.allotted_data) as allotted_data,
        coalesce(pp.upfront_cost, pop.monthly_fee) as plan_cost,
        cr.call_duration,
        cr.data_usage,
        cr.call_cost,
        p.payment_amount,
        p.payment_date,
        p.payment_time
        FROM
            customer c
        LEFT JOIN
            callrecord cr ON c.customer_phone_number = cr.customer_phone_number
        LEFT JOIN
            payment p ON c.customer_phone_number = p.customer_phone_number
        LEFT JOIN
            prepaidplan pp ON c.prepaid_plan = pp.plan_name
        LEFT JOIN
            postpaidplan pop ON c.postpaid_plan = pop.plan_name
        WHERE
            c.customer_phone_number = $1;
        `, [customerPhone]);

        if (customerDetails.rows.length === 0) {
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Existing Customer</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    text-align: center;
                    padding: 50px;
                }
            
                h1 {
                    color: #333;
                }
            
                p {
                    color: #666;
                    font-size: 18px;
                }
            
                a {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: bold;
                    margin-right: 20px;
                }
            
                a:hover {
                    text-decoration: underline;
                }
            
                table {
                    width: 80%;
                    margin: 20px auto;
                    border-collapse: collapse;
                }
            
                th, td {
                    padding: 10px;
                    border: 1px solid #ddd;
                }
            
                th {
                    background-color: #f2f2f2;
                }
            
                form {
                    margin-top: 20px;
                }
            
                input, button {
                    margin-bottom: 20px;
                }
            
                button {
                    margin-top: 20px;
                }
            
                #firstName {
                    margin-top: 20px;
                }
            
                #planType {
                    margin-bottom: 20px;
                }
            
                #planOptionsContainer {
                    display: none;
                }
                </style>
            </head>
            <body>
                <h1>Existing Customer</h1>
                <p>Customer not found.</p>
                <a href="/">Back to Main Page</a>
            </body>
            </html>
            `;
            res.send(htmlContent);
        } else {
            const customer = customerDetails.rows[0];
            console.log(customer);
            // Generate HTML to display customer details, call records, and payment history
            const customerHtml = generateCustomerDetailsHtml(customer);
            
            const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Existing Customer</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    text-align: center;
                    padding: 50px;
                }
            
                h1 {
                    color: #333;
                }
            
                p {
                    color: #666;
                    font-size: 18px;
                }
            
                a {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: bold;
                    margin-right: 20px;
                }
            
                a:hover {
                    text-decoration: underline;
                }
            
                table {
                    width: 80%;
                    margin: 20px auto;
                    border-collapse: collapse;
                }
            
                th, td {
                    padding: 10px;
                    border: 1px solid #ddd;
                }
            
                th {
                    background-color: #f2f2f2;
                }
            
                form {
                    margin-top: 20px;
                }
            
                input, button {
                    margin-bottom: 20px;
                }
            
                button {
                    margin-top: 20px;
                }
            
                #firstName {
                    margin-top: 20px;
                }
            
                #planType {
                    margin-bottom: 20px;
                }
            
                #planOptionsContainer {
                    display: none;
                }
                </style>
                </head>
                <body>
                    <h1>Existing Customer</h1>
                    ${customerHtml}
                    <a href="/">Back to Main Page</a>
                </body>
                </html>
            `;
            res.send(htmlContent);
        }

    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
});

// Function to generate HTML for customer details, call records, and payment history
function generateCustomerDetailsHtml(customer) {
    // Create HTML content using the 'customer' object
    const htmlContent = `
    <div class="customer-details">
    <h2>Customer Details</h2>
    <p><strong>Name:</strong> ${customer.customer_name}</p>
    <p><strong>Address:</strong> ${customer.customer_address}</p>
    <p><strong>Phone Number:</strong> ${customer.customer_phone_number}</p>
    </div>

    
    <div class="plan-details">
    <h2>Plan Details</h2>
    <p><strong>Allotted Minutes:</strong> ${customer.allotted_minutes} minutes</p>
    <p><strong>Allotted Data:</strong> ${customer.allotted_data} GB</p>
    <p><strong>Plan Cost:</strong> $${customer.plan_cost}</p>
    </div>
    
    <!--
    <div class="call-records">
    <h2>Call Records</h2>
    <table>
        <tr>
            <th>Call Duration (minutes)</th>
            <th>Data Usage (GB)</th>
            <th>Call Cost ($)</th>
        </tr>
        <tr>
            <td>${customer.call_duration}</td>
            <td>${customer.data_usage}</td>
            <td>${customer.call_cost}</td>
        </tr>
    </table>
    </div>

 
    <div class="payment-history">
    <h2>Payment History</h2>
    <table>
        <tr>
            <th>Payment Amount ($)</th>
            <th>Payment Date</th>
            <th>Payment Time</th>
        </tr>
        <tr>
            <td>${customer.payment_amount}</td>
            <td>${customer.payment_date}</td>
            <td>${customer.payment_time}</td> 
        </tr>
    </table>
    </div>
    -->
    `;
    return htmlContent;
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});