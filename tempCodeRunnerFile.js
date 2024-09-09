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