DROP TABLE IF EXISTS customer, prepaidplan, postpaidplan, callrecord, payment, bankaccount, competitors;

CREATE TABLE prepaidplan (
    plan_name VARCHAR(255) PRIMARY KEY,
    allotted_minutes FLOAT,
    allotted_data FLOAT,
    upfront_cost DECIMAL(10, 2)
);

INSERT INTO prepaidplan (plan_name, allotted_minutes, allotted_data, upfront_cost) VALUES 
('Basic Plan', 500, 5, 20),
('Simple Plan', 1000, 10, 25),
('Standard Plan', 1500, 20, 30),
('Essential Plan ', 1000, 15, 40),
('Budget Plan', 1500, 20, 45),
('Talk Plan', 1400, 0, 15),
('Everyday Plan', 100, 5, 10),
('Core Plan', 1200, 12, 22),
('Casual Plan', 500, 10, 30),
('Bundle Plan', 2000, 25, 50),
('Premium Plan', 3000, 30, 60),
('Deluxe Plan', 5000, 50, 75);

CREATE TABLE postpaidplan (
    plan_name VARCHAR(255) PRIMARY KEY,
    allotted_minutes FLOAT,
    allotted_data FLOAT,
    monthly_fee DECIMAL(10, 2)
);

INSERT INTO postpaidplan (plan_name, allotted_minutes, allotted_data, monthly_fee) VALUES 
('Basic Plan', 500, 5, 15),
('Simple Plan', 1000, 10, 20),
('Standard Plan', 1500, 20, 25),
('Essential Plan ', 1000, 15, 35),
('Budget Plan', 1500, 20, 40),
('Talk Plan', 1400, 0, 10),
('Everyday Plan', 100, 5, 5),
('Core Plan', 1200, 12, 17),
('Casual Plan', 500, 10, 25),
('Bundle Plan', 2000, 25, 45),
('Premium Plan', 3000, 30, 55),
('Deluxe Plan', 5000, 50, 70);

CREATE TABLE customer (
    customer_phone_number VARCHAR(255) PRIMARY KEY,
    prepaid_plan VARCHAR(255),
    postpaid_plan VARCHAR(255),
    customer_name VARCHAR(255),
    customer_address VARCHAR(255),
    amount_due DECIMAL(10, 2),
    payment_type VARCHAR(20),
    payment_method VARCHAR(20),
    FOREIGN KEY (prepaid_plan) REFERENCES prepaidplan(plan_name),
    FOREIGN KEY (postpaid_plan) REFERENCES postpaidplan(plan_name)
);

-- Prepaid customers
INSERT INTO customer (prepaid_plan, customer_name, customer_address, customer_phone_number, amount_due, payment_type, payment_method)
VALUES 
('Deluxe Plan', 'Jake', '47B Randall Mill Ave, Chester, PA 19013', '610-295-4583', 0, 'automatic', 'Card'),
('Budget Plan', 'Steve', '86 Glenlake Dr, Beverly, MA 01915', '351-893-3985', 0, 'manual', 'Card'),
('Basic Plan', 'Bob', '9366 Laurel St, Decatur, GA 30030', '404-212-2567', 0, 'automatic', 'Card'),
('Casual Plan', 'Jesse', '8521 Arnold Dr, Clayton, NC 27520', '919-574-5577', 0, 'manual', 'Card'),
('Premium Plan', 'Paul', '7603 Garfield Court, Southampton, PA 18966', '267-979-1112', 0, 'automatic', 'Card'),
('Budget Plan', 'John', '884 East Broad Ave, Webster, NY 14580', '585-845-2130', 0, 'manual', 'Card'),
('Simple Plan', 'Kush', '69 Shirley Street, Detroit, MI 48205', '313-108-7990', 0, 'automatic', 'Card'),
('Deluxe Plan', 'Charlie', '154 Pacific St, Hialeah, FL 33010', '305-320-7754', 0, 'manual', 'Card'),
('Talk Plan', 'Jason', '200 Brickell St, Uniondale, NY 11553', '516-900-3857', 0, 'automatic', 'Card'),
('Standard Plan', 'Tom', '562 Eagle Drive, Dekalb, IL 60115', '779-040-7190', 0, 'manual', 'Card'),
('Casual Plan', 'Ron', '73 Lake Forest Dr, Champlin, MN 55316', '763-605-2395', 0, 'automatic', 'Card'),
('Premium Plan', 'Sam', '388 Fawn Dr, Inman, SC 29349', '846-330-2425', 0, 'manual', 'Card'),
('Basic Plan', 'Morgan', '7056 Manor St, Manahawkin, NJ 08050', '609-885-6349', 0, 'automatic', 'Card'),
('Standard Plan', 'Kylie', '9429 School Drive, Aiken, SC 29803', '803-790-8808', 0, 'manual', 'Card'),
('Everyday Plan', 'Irvin', '9520 W. Canterbury Street, Harlingen, TX 78552', '956-349-2329', 0, 'automatic', 'Card'),
('Simple Plan', 'Curtis', '515 3rd Avenue, Edison, NJ 08817', '300-714-2631', 0, 'manual', 'Card'),
('Casual Plan', 'Jensen', '763 Campfire Lane, Hamilton, OH 45011', '793-318-1641', 0, 'automatic', 'Card'),
('Deluxe Plan', 'Case', '9199 West Overlook Dr, Parsippany, NJ 07054', '288-744-6563', 0, 'manual', 'Card'),
('Talk Plan', 'Kyan', '51 Pine St, Boynton Beach, FL 33435', '625-967-9386', 0, 'automatic', 'Card'),
('Standard Plan', 'Leo', '101 Locust Dr, Anchorage, AK 99504', '870-983-6965', 0, 'manual', 'Card'),
('Everyday Plan', 'Zack', '8823 White St, Brookline, MA 02446', '812-330-9204', 0, 'automatic', 'Card'),
('Basic Plan', 'Dale', '37 East Locust Lane, Albany, NY 12203', '865-785-9705', 0, 'manual', 'Card'),
('Simple Plan', 'Derick', '7930 Lafayette St, Herndon, VA 20170', '218-207-4141', 0, 'automatic', 'Card'),
('Standard Plan', 'Alex', '87 Sutor Rd, Wappingers Falls, NY 12590', '285-226-1420', 0, 'manual', 'Card');

-- Postpaid customers
INSERT INTO customer (postpaid_plan, customer_name, customer_address, customer_phone_number, amount_due, payment_type, payment_method)
VALUES 
('Everyday Plan', 'Brady', '434 Beacon Lane, Ridgewood, NJ 07450', '624-998-3222', 175, 'automatic', 'Card'),
('Premium Plan', 'William', '437 Andover St, Williamsburg, VA 23185', '985-303-8991', 250, 'manual', 'Card'),
('Simple Plan', 'Haylee', '69 Glenholme Street, Mobile, AL 36605', '613-771-9888', 385, 'automatic', 'Card'),
('Casual Plan', 'Karla', '134 Thompson Ave, Munster, IN 46321', '311-551-5896', 45, 'manual', 'Card'),
('Deluxe Plan', 'Jaxon', '18 Green Road, McLean, VA 22101', '743-203-1471', 225, 'automatic', 'Card'),
('Everyday Plan', 'Lydia', '7664 Gulf St, Dallas, TX 75206', '672-863-6742', 200, 'manual', 'Card'),
('Standard Plan', 'Harley', '689 Sherman Rd, Westmont, IL 60559', '823-507-1743', 105, 'automatic', 'Card'),
('Deluxe Plan', 'Thomas', '68 Hudson Dr, Indiana, PA 15701', '928-209-1134', 210, 'manual', 'Card'),
('Casual Plan', 'Shawn', '656 Wall Street, Perrysburg, OH 43551', '671-710-5721', 250, 'automatic', 'Card'),
('Budget Plan', 'Ken', '475 Wood St, Arvada, CO 80003', '819-850-1217', 405, 'manual', 'Card'),
('Everyday Plan', 'Heidi', '170 Eagle Drive, Houston, TX 77035', '909-656-7831', 245, 'automatic', 'Card'),
('Talk Plan', 'Samuel', '305 Fremont Dr, Pikesville, MD 21208', '454-214-6374', 90, 'manual', 'Card'),
('Premium Plan', 'Maria', '44 Race Dr, Franklin, MA 02038', '324-230-5611', 100, 'automatic', 'Card'),
('Simple Plan', 'Kailey', '846 Halifax Rd, Valrico, FL 33594', '821-537-1199', 275, 'manual', 'Card'),
('Casual Plan', 'Jose', '680 Purple Finch Dr, Reston, VA 20191', '908-471-4279', 135, 'automatic', 'Card'),
('Everyday Plan', 'Andrea', '48 Young Road, Ashtabula, OH 44004', '830-411-5899', 105, 'manual', 'Card'),
('Basic Plan', 'Chana', '600 King Street, Bradenton, FL 34203', '604-984-8976', 300, 'automatic', 'Card'),
('Premium Plan', 'Clarissa', '8 Brown Street, Hobart, IN 46342', '672-213-2048', 245, 'manual', 'Card'),
('Standard Plan', 'Nancy', '83 Lakeshore Street, Rockledge, FL 32955', '728-582-4361', 400, 'automatic', 'Card'),
('Casual Plan', 'Russell', '172 East Rd, Chillicothe, OH 45601', '882-782-2738', 130, 'manual', 'Card'),
('Everyday Plan', 'Chandler', '52 Valley St, Littleton, CO 80123', '805-598-1217', 270, 'automatic', 'Card'),
('Budget Plan', 'Weston', '8902 Mammoth Rd, Chaska, MN 55318', '925-980-9230', 75, 'manual', 'Card'),
('Premium Plan', 'Juli', '9039 Belmont Street, Pasadena, MD 21122', '638-443-6666', 155, 'automatic', 'Card');


CREATE TABLE competitors (
    competitor_name VARCHAR,
    competitor_address VARCHAR,
    competitor_num_of_customers INT,
    PRIMARY KEY (competitor_name, competitor_address)
);

INSERT INTO competitors (competitor_name, competitor_address, competitor_num_of_customers) VALUES 
('Cellular Solutions', '25 Mayflower Street, Southfield, MI 48076', 25),
('Tech Talk Mobile', '7516 Summit St, North Attleboro, MA 02760', 35),
('ConnectX Mobile', '7233 Sulphur St, North Olmsted, OH 44070', 19),
('Swift Mobile', '7027 High Ridge Street, Murrells Inlet, SC 29576', 34),
('Infinite Connections', '816 Lakeview Drive, Lakewood, NJ 08701', 57),
('Digital Mobile Co.', '60 Arlington Court, Redondo Beach, CA 90278', 45),
('Quantum Mobile', '23 Kirkland Rd, Rockford, MI 49341', 27),
('NebulaConnect', '841 Trusel Street, Merrick, NY 11566', 36),
('Pinnacle Mobile', '9728 Philmont Ave, Fort Lauderdale, FL 33308', 48),
('HorizonLink', '9571 Mill Rd, Bayonne, NJ 07002', 52),
('NexusCell', '8035 Wild Road, South El Monte, CA 91733', 23),
('PrimeWave Wireless', '3 Center Drive, Davenport, IA 52804', 42);

CREATE TABLE callrecord (
    call_id SERIAL PRIMARY KEY,
    customer_phone_number VARCHAR(20),
    FOREIGN KEY (customer_phone_number) REFERENCES customer(customer_phone_number),
    call_duration INT,
    data_usage DECIMAL(10, 2),
    call_cost DECIMAL(10, 2)
);

INSERT INTO callrecord (customer_phone_number, call_duration, data_usage, call_cost) VALUES 
('610-295-4583', 11, 1.2, 0.22),
('351-893-3985', 23, 5.6, 0.46),
('404-212-2567', 50, 8.9, 1.00),
('919-574-5577', 120, 5.8, 2.40),
('267-979-1112', 250, 4.0, 5.00),
('585-845-2130', 30, 6.7, 0.60),
('313-108-7990', 61, 9.8, 1.22),
('305-320-7754', 20, 4.5, 0.40),
('516-900-3857', 300, 2.3, 6.00),
('779-040-7190', 212, 1.8, 4.24),
('763-605-2395', 412, 7.8, 8.24),
('846-330-2425', 488, 5.3, 9.76),
('609-885-6349', 186, 9.4, 3.72),
('803-790-8808', 90, 10.0, 1.8),
('956-349-2329', 136, 5.6, 2.72),
('300-714-2631', 256, 7.8, 5.12),
('793-318-1641', 334, 6.4, 6.68),
('288-744-6563', 400, 3.7, 8.00),
('625-967-9386', 362, 9.1, 7.24),
('870-983-6965', 230, 3.4, 4.6),
('812-330-9204', 306, 8.4, 6.12),
('865-785-9705', 267, 2.3, 5.34),
('218-207-4141', 67, 1.9, 1.34),
('624-998-3222', 456, 3.9, 9.12),
('985-303-8991', 483, 6.3, 9.66),
('613-771-9888', 396, 2.1, 7.92),
('311-551-5896', 230, 0.2, 4.6),
('743-203-1471', 50, 3.9, 1.00),
('672-863-6742', 40, 5.1, 0.80),
('823-507-1743', 450, 6.0, 9.00),
('928-209-1134', 11, 1.4, 0.22),
('671-710-5721', 23, 6.6, 0.46),
('819-850-1217', 51, 8.7, 1.02),
('909-656-7831', 123, 5.0, 2.46),
('454-214-6374', 256, 4.1, 5.12),
('324-230-5611', 38, 5.7, 0.76),
('821-537-1199', 62, 9.4, 1.24),
('908-471-4279', 28, 6.5, 0.56),
('830-411-5899', 304, 2.6, 6.08),
('604-984-8976', 216, 1.9, 4.32),
('672-213-2048', 414, 4.8, 8.28),
('728-582-4361', 468, 5.2, 9.36),
('882-782-2738', 16, 9.7, 0.32),
('805-598-1217', 99, 9.0, 1.98),
('925-980-9230', 16, 7.6, 0.32),
('638-443-6666', 254, 7.9, 5.08);

CREATE TABLE payment (
    payment_id SERIAL PRIMARY KEY,
    customer_phone_number VARCHAR(255),
    FOREIGN KEY (customer_phone_number) REFERENCES customer(customer_phone_number),
    payment_amount DECIMAL(10, 2),
    payment_time VARCHAR(20),
    payment_date VARCHAR(20)
);

INSERT INTO payment (customer_phone_number, payment_amount, payment_time, payment_date) 
VALUES 
('610-295-4583', 10, '18:33', '10-05-2023'),
('351-893-3985', 7, '12:02', '10-14-2023'),
('404-212-2567', 15, '09:45', '10-12-2023'),
('919-574-5577', 5, '04:00', '10-01-2023'),
('267-979-1112', 56, '16:55', '10-09-2023'),
('585-845-2130', 33, '09:38', '10-23-2023'),
('313-108-7990', 40, '03:49', '10-21-2023'),
('305-320-7754', 22, '07:50', '10-30-2023'),
('516-900-3857', 45, '15:38', '10-09-2023'),
('779-040-7190', 23, '21:23', '10-10-2023'),
('763-605-2395', 12, '22:18', '10-02-2023'),
('846-330-2425', 10, '18:06', '10-01-2023'),
('609-885-6349', 27, '19:12', '10-23-2023'),
('803-790-8808', 18, '13:56', '10-29-2023'),
('956-349-2329', 38, '11:22', '10-24-2023'),
('300-714-2631', 45, '08:35', '10-01-2023'),
('870-983-6965', 67, '20:08', '10-23-2023'),
('812-330-9204', 89, '21:56', '10-03-2023'),
('865-785-9705', 33, '17:00', '10-05-2023'),
('218-207-4141', 89, '12:32', '10-10-2023'),
('624-998-3222', 45, '11:49', '10-14-2023'),
('985-303-8991', 5, '18:20', '10-17-2023'),
('613-771-9888', 12, '14:11', '10-18-2023'),
('311-551-5896', 11, '17:05', '10-20-2023'),
('743-203-1471', 8, '13:10', '10-01-2023'),
('672-863-6742', 67, '18:29', '10-11-2023'),
('823-507-1743', 35, '19:30', '10-25-2023'),
('928-209-1134', 6, '12:10', '10-07-2023'),
('671-710-5721', 8, '19:11', '10-09-2023'),
('819-850-1217', 20, '17:45', '10-21-2023'),
('909-656-7831', 21, '12:00', '10-08-2023'),
('454-214-6374', 45, '12:49', '10-23-2023'),
('324-230-5611', 23, '09:09', '10-27-2023'),
('821-537-1199', 56, '20:20', '10-12-2023'),
('908-471-4279', 14, '14:34', '10-17-2023'),
('830-411-5899', 22, '17:09', '10-21-2023'),
('604-984-8976', 27, '13:40', '10-09-2023'),
('672-213-2048', 20, '10:39', '10-01-2023'),
('728-582-4361', 6, '11:40', '10-23-2023'),
('882-782-2738', 7, '08:40', '10-16-2023'),
('805-598-1217', 10, '13:09', '10-24-2023'),
('925-980-9230', 34, '21:05', '10-30-2023'),
('638-443-6666', 25, '13:05', '10-02-2023');


CREATE TABLE bankaccount (
    account_number INT,
    customer_phone_number VARCHAR(255),
    FOREIGN KEY (customer_phone_number) REFERENCES customer(customer_phone_number),
    balance DECIMAL(10, 2)
);

INSERT INTO bankaccount (customer_phone_number, account_number, balance) VALUES 
('610-295-4583', 38472651, 1000),
('351-893-3985', 91254873, 150),
('404-212-2567', 67521984, 200),
('919-574-5577', 14589237, 405),
('267-979-1112', 50963428, 314),
('585-845-2130', 12345678, 765),
('313-108-7990', 23456789, 654),
('305-320-7754', 34567890, 888),
('516-900-3857', 45678901, 980),
('779-040-7190', 56789012, 1200),
('763-605-2395', 58672251, 342),
('846-330-2425', 11256477, 101),
('609-885-6349', 37921981, 89),
('803-790-8808', 64959943, 1256),
('956-349-2329', 45993428, 1117),
('300-714-2631', 82345678, 567),
('793-318-1641', 43456488, 349),
('288-744-6563', 34666891, 670),
('625-967-9386', 35668919, 430),
('870-983-6965', 56373010, 403),
('812-330-9204', 98172152, 234),
('865-785-9705', 01554578, 890),
('218-207-4141', 14541988, 232),
('624-998-3222', 44544238, 758),
('985-303-8991', 60912429, 1101),
('613-771-9888', 82343676, 1096),
('311-551-5896', 63456683, 1123),
('743-203-1471', 44564494, 1234),
('672-863-6742', 85638931, 560),
('823-507-1743', 36789313, 1232),
('928-209-1134', 25638959, 290),
('671-710-5721', 66343000, 309),
('819-850-1217', 58174153, 244),
('909-656-7831', 41656579, 570),
('454-214-6374', 84844984, 265),
('324-230-5611', 47574738, 668),
('821-537-1199', 30513426, 291),
('908-471-4279', 52343553, 196),
('830-411-5899', 53356662, 323),
('604-984-8976', 24264294, 963),
('672-213-2048', 88638932, 180),
('728-582-4361', 98789315, 142),
('882-782-2738', 94544530, 358),
('805-598-1217', 68917426, 196),
('925-980-9230', 92333673, 459),
('638-443-6666', 66456683, 130);

--Initializing Amount Due for the customers
--Amount Due = Plan price + call costs
UPDATE customer AS c
SET amount_due = 
    COALESCE((
        SELECT SUM(cr.call_cost)
        FROM callrecord AS cr
        WHERE cr.customer_phone_number = c.customer_phone_number
    ), 0) +
    COALESCE((
        SELECT SUM(
            CASE
                WHEN c.prepaid_plan IS NOT NULL THEN p.upfront_cost
                WHEN c.postpaid_plan IS NOT NULL THEN pp.monthly_fee
                ELSE 0
            END
        )
        FROM customer AS cust
        LEFT JOIN prepaidplan AS p ON c.prepaid_plan = p.plan_name
        LEFT JOIN postpaidplan AS pp ON c.postpaid_plan = pp.plan_name
        WHERE cust.customer_phone_number = c.customer_phone_number
    ), 0);

-- Add new columns to the customer table
ALTER TABLE customer
ADD COLUMN Total_Data_Usage DECIMAL(10, 2),
ADD COLUMN Total_Minutes INT;

-- Update TotalDataUsage and TotalMinutes columns
UPDATE customer AS c
SET
    Total_Data_Usage = COALESCE((
        SELECT SUM(cr.data_usage)
        FROM callrecord AS cr
        WHERE cr.customer_phone_number = c.customer_phone_number
    ), 0),
    Total_Minutes = COALESCE((
        SELECT SUM(cr.call_duration)
        FROM callrecord AS cr
        WHERE cr.customer_phone_number = c.customer_phone_number
    ), 0);

