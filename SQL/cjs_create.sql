USE CJSDB;

--tables

CREATE TABLE CUSTOMERS
(
    C_ID INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(C_ID),
    F_NAME VARCHAR(50) NOT NULL,
    L_NAME VARCHAR(50) NOT NULL,
    PHONE VARCHAR(10) NOT NULL,
    ADDR VARCHAR(150) NOT NULL,
    ST VARCHAR(2) NOT NULL,
    ZIPCODE VARCHAR(5) NOT NULL
);

CREATE TABLE TRANSACTIONS
(
    T_ID INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(T_ID),
    C_ID INT NOT NULL,
    FOREIGN KEY(C_ID) REFERENCES CUSTOMERS(C_ID),
    T_DATE_TIME DATETIME NOT NULL,
    T_TOTAL DECIMAL(6, 2) NOT NULL
);

CREATE TABLE CATEGORIES
(
    CAT_ID INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(CAT_ID),
    CAT_NAME VARCHAR(100)
);

CREATE TABLE PRODUCTS
(
    P_ID INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(P_ID),
    P_CODE VARCHAR(10) NOT NULL,
    P_NAME VARCHAR(100) NOT NULL,
    P_SIZE SMALLINT NOT NULL,
    P_PRICE DECIMAL(6, 2),
    P_QNTY INT NOT NULL,
    P_OPENED INT NOT NULL,
    P_DESC VARCHAR(250),
    P_WHOLESALE DECIMAL(6, 2) NOT NULL,
    CAT_ID INT NOT NULL,
    FOREIGN KEY(CAT_ID) REFERENCES CATEGORIES(CAT_ID),
    P_PER_AMNT DECIMAL(6, 2) NOT NULL
);

CREATE TABLE PRODUCTS_SOLD
(
    P_ID INT NOT NULL,
    T_ID INT NOT NULL,
    OPENED INT NOT NULL,
    QUANTITY INT NOT NULL,
    PRIMARY KEY(P_ID, T_ID)
);

CREATE TABLE PAYMENT_METHODS
(
    PM_ID INT NOT NULL AUTO_INCREMENT,
    PM_NAME VARCHAR(100),
    PM_DESC VARCHAR(100),
    PRIMARY KEY(PM_ID)
);

CREATE TABLE PAYMENTS
(
    PAYMENT_ID INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(PAYMENT_ID),
    PM_ID INT NOT NULL,
    FOREIGN KEY(PM_ID) REFERENCES PAYMENT_METHODS(PM_ID),
    T_ID INT NOT NULL,
    FOREIGN KEY(T_ID) REFERENCES TRANSACTIONS(T_ID),
    PAYMENT_AMNT DECIMAL(6, 2) NOT NULL,
    NOTES VARCHAR(250)
);

CREATE TABLE USERS
(
    U_ID INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(U_ID),
    USERNAME VARCHAR(50) NOT NULL,
    PSWD VARCHAR(20) NOT NULL
);

CREATE TABLE CART
(
    ID INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(ID),
    C_ID INT NOT NULL,
    FOREIGN KEY(C_ID) REFERENCES CUSTOMERS(C_ID),
    CART_DATE_TIME DATETIME NOT NULL
);

CREATE TABLE CART_ITEMS
(
    ID INT NOT NULL,
    FOREIGN KEY(ID) REFERENCES CART(ID),
    P_ID INT NOT NULL,
    FOREIGN KEY(P_ID) REFERENCES PRODUCTS(P_ID),
    OPENED INT NOT NULL,
    PRIMARY KEY(ID, P_ID, OPENED),
    QUANTITY INT NOT NULL
);
--views
CREATE VIEW CUSTOMERS_LOOKUP AS 
SELECT C_ID, CONCAT(F_NAME, CONCAT(' ', L_NAME)) AS NAME, PHONE, ADDR
FROM CUSTOMERS;

CREATE VIEW PRODUCTS_LOOKUP AS
SELECT P_ID, P_NAME, P_CODE, P_SIZE, P_PRICE, P_QNTY, P_OPENED, P_DESC, P_WHOLESALE, CAT_NAME, P_PER_AMNT
FROM PRODUCTS, CATEGORIES
WHERE PRODUCTS.CAT_ID = CATEGORIES.CAT_ID;

CREATE VIEW ITEMS_IN_CART AS
SELECT C_ID, COUNT(*) AS NUM_ITEMS
FROM CART_ITEMS, CART
WHERE CART_ITEMS.ID = CART.ID
GROUP BY C_ID;

-- sequences



-- triggers


