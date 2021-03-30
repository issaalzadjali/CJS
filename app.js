const express = require('express');
const mysql = require('mysql2');
const app = express();
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const path = require('path');
const { connect } = require('http2');
const { query } = require('express');
const methodOverride = require('method-override');
const ejsLint = require('ejs-lint');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'z1x2c3v4b5',
    database: 'CJSDB'
});

connection.query(
    'SELECT * FROM CATEGORIES',
    function(err, results, fields) {
        if(err)
            throw err;
        else
            console.log("Succesfully connected!");
    });

app.get('/', (req, res) => {
    var pagename = 'Home';
    res.render('home', {pagename});
});

//search for and select customer

app.get('/checkout', (req, res) => {
    var pagename = 'Checkout';
    var len = 0;
    var searchField = req.query.searchedBy;
    var customerInfo = req.query.searchedFor;
    var valEntered = false;
    console.log(customerInfo);
    if (customerInfo) 
    {
        var sendThis = "%" + customerInfo + "%";
        valEntered = true;

        if(searchField === 'Name')  
        {
            connection.query(
                'SELECT * FROM `CUSTOMERS_LOOKUP` WHERE `NAME` LIKE ?',
                sendThis,
                function(err, results, fields) 
                {
                    if (err)
                        console.log(err);
                    else
                    {
                        len = results.length;
                        res.render('checkout/cust-post-search.ejs', {pagename, leng: len, results, valEntered});
                    }
        
                }
            )
        }
        else if(searchField === "Phone Number")
        {
            connection.query(
                'SELECT * FROM `CUSTOMERS_LOOKUP` WHERE `PHONE` LIKE ?',
                sendThis,
                function(err, results, fields) 
                {
                    if (err)
                        console.log(err);
                    else
                    {
                        len = results.length;
                        res.render('checkout/cust-post-search.ejs', {pagename, leng: len, results, valEntered});
                    }
                }
            )
        }
    }
    else
    {
        res.render('checkout/cust-post-search.ejs', {pagename, valEntered});
    }
});

//check if cart exists
app.get('/checkout/:customer_id', (req, res) => {
    const { customer_id } = req.params;
    connection.query(
        'SELECT * FROM `CUSTOMERS_LOOKUP` WHERE `C_ID` = ?',
        customer_id,
        function(err, results)
        {
            if (err)
                console.log(err);
            else if (results.length > 0)
            {
                connection.query(
                    'SELECT * FROM `CART` WHERE `C_ID` = ?',
                    customer_id,
                    function(err, results)
                    {
                        var cart = results;
                        if (err)
                            console.log(err);
                        //cart exists!
                        else if (cart.length > 0)
                        {
                            console.log("cart exists");
                            res.redirect('/checkout/' + customer_id + '/' + cart[0].ID);
                        }
                        //cart doesnt exist
                        else
                        {
                            connection.query(
                                'INSERT INTO CART (C_ID, CART_DATE_TIME) VALUES (?, NOW())',
                                customer_id,
                                function(err, results)
                                {
                                    if(err)
                                        console.log(err);
                                    else
                                    {
                                        console.log("Cart created");
                                        connection.query(
                                            'SELECT * FROM `CART` WHERE `C_ID` = ?',
                                            customer_id,
                                            function(err, results)
                                            {
                                                cart = results;
                                                if (err)
                                                    console.log(err);
                                                else if (cart.length > 0)
                                                {
                                                    console.log("cart exists");
                                                    res.redirect('/checkout/' + customer_id + '/' + cart[0].ID);
                                                }
                                                else
                                                    console.log("Something went wrong");
                                            })
                                    }
                            
                                })
                        }
                    }
                )
            }
        }
    )
})

//search for products

app.get('/checkout/:customer_id/:cart_id', (req, res) => {
    var pagename = "Checkout";
    const { customer_id } = req.params;
    const { cart_id } = req.params;
    var len;
    var searchField = req.query.searchedBy;
    var productInfo = req.query.searchedFor;
    var numItemsInCart = 0;
    var valEntered = false;

    connection.query(
        'SELECT * FROM ITEMS_IN_CART WHERE C_ID = ?',
        customer_id,
        function(err, results){
            if(err)
                console.log(err);
            else if(results.length > 0)
            {
                numItemsInCart = results[0].NUM_ITEMS;
            }
                
        }
    )
    
    connection.query(
        'SELECT * FROM `CUSTOMERS_LOOKUP` WHERE `C_ID` = ?',
        customer_id,
        function(err, results, fields)
        {
            
            if (err)
                console.log(err);
            else if (results.length === 0)
            {
                res.redirect('/checkout');
            }
            else
            {
                
                if (productInfo)
                {
                    
                    console.log('product search: ' + numItemsInCart);
                    var sendThis = "%" + productInfo + "%";
                    valEntered = true;
                    if(searchField === 'Name')
                    {
                        connection.query(
                            'SELECT * FROM `PRODUCTS_LOOKUP` WHERE `P_NAME` LIKE ?',
                            sendThis,
                            function(err, results)
                            {
                                len = results.length;
                                res.render('checkout/prod-post-search.ejs', {pagename, results, customer_id, len, valEntered, cart_id, numItemsInCart});
                            }
                        )
                    }
                    if(searchField === 'Code')
                    {
                        connection.query(
                            'SELECT * FROM PRODUCTS_LOOKUP WHERE P_CODE LIKE ?',
                            sendThis,
                            function(err, results)
                            {
                                len = results.length;
                                res.render('checkout/prod-post-search.ejs', {pagename, results, customer_id, len, valEntered, cart_id, numItemsInCart});
                            }
                        )
                    }
                    if(searchField === 'Category')
                    {
                        connection.query(
                            'SELECT * FROM PRODUCTS_LOOKUP WHERE CAT_NAME LIKE ?',
                            sendThis,
                            function(err, results)
                            {
                                len = results.length;
                                res.render('checkout/prod-post-search.ejs', {pagename, results, customer_id, len, valEntered, cart_id, numItemsInCart});
                            }
                        )
                    }
                } 
                else 
                {
                    res.render('checkout/prod-post-search.ejs', {pagename, results, customer_id, len, valEntered, cart_id, numItemsInCart});
                }
                
            }
                
        }
    )
    
})



//add product to cart

app.post('/checkout/:customer_id/:cart_id', (req, res)  => {
    const { customer_id } = req.params;
    const { cart_id } = req.params;
    var closed = parseInt(req.body.closedQnty);
    var opened = parseInt(req.body.openedQnty);
    var product_id = parseInt(req.body.prodId);
    
    var products = [];
    var cart = [];
    
    if(closed == null)
        closed = 0;
    if(opened == null)
        closed = 0;
    console.log(product_id);
    console.log("is this nan? " + closed + opened);
    //CHECK IF PRODUCT IS VALID
    if(product_id != null)
    {
        connection.query(
            'SELECT * FROM `PRODUCTS` WHERE `P_ID` = ?',
            product_id,
            function(errP, results)
            {
                console.log("Way out here");
                products = results;
                if (errP)
                    console.log(errP);
                else if (products.length === 0)
                {
                    console.log("No products found");
                }
                else
                {
                    console.log("out here");
                    //CHECK IF CART ALREADY EXISTS FOR CUSTOMER
                    connection.query(
                        'SELECT * FROM CART WHERE C_ID = ?',
                        customer_id,
                        function(errC, results)
                        {
                            console.log("here");
                            cart = results;
                            console.log("id: " + cart.ID);
                            if (errC)
                                console.log(errC);
                            else
                            {
                                
                                //CART DOES EXIST
                                if(cart.length > 0)
                                {
                                    if(closed > 0 && closed <= products[0].P_QNTY)
                                    {
                                        console.log("in closed");
                                        connection.query(
                                            'INSERT INTO `CART_ITEMS` (`ID`, `P_ID`, `OPENED`, `QUANTITY`) VALUES (?, ?, ?, ?)',
                                            [cart[0].ID, product_id, 0, closed],
                                            function(err, results)
                                            {
                                                if (err && err.code === 'ER_DUP_ENTRY')
                                                    console.log(err);
    
                                                else
                                                    console.log("added to cart");
                                            
                                                    
                                            }
                                        )
                                    }
                                    if(opened > 0 && products[0].P_OPENED >= 1)
                                    {
                                        console.log("in opened");
                                        connection.query(
                                            'INSERT INTO `CART_ITEMS` (`ID`, `P_ID`, `OPENED`, `QUANTITY`) VALUES (?, ?, ?, ?)',
                                            [cart[0].ID, product_id, 1, opened],
                                            function(err, results)
                                            {
                                                if (err)
                                                    console.log(err);
                                                else
                                                    console.log("added to cart");
                                            }
                                        )   
                                    }
                                    
                                    
                                }
                                //CART DOESNT EXIST
                                else
                                {
                                   console.log("nothing happened");
                                }
                            }
                        })
                }
            })
    }
    res.redirect(`/checkout/${customer_id}/${cart_id}`);
})

//helper async function for view cart
async function getProds(cart) {
    if(cart) {
        var prods = {};
        for(let i = 0; i < cart.length; i++)
            {
                connection.query(
                    'SELECT * FROM PRODUCTS_LOOKUP WHERE P_ID = ?',
                    parseInt(cart[i].P_ID),
                    function(err, results){
                        if(err)
                            throw new Error(err);
                        else if(results.length > 0)
                        {
                            prods[i] = results;
                            console.log("in here:", prods);
                        }

                    }
                )
            }
            return prods;
    }
      
}
//view cart

app.get('/checkout/:customer_id/:cart_id/cart', (req, res) => {
    var pagename = "Checkout";
    const { customer_id } = req.params;
    const { cart_id } = req.params;
    var cust;
    var cart;
    var prods = [];
    var success = false;

    connection.query(
        'SELECT * FROM CUSTOMERS_LOOKUP WHERE C_ID = ?',
        customer_id,
        function(err, resultsC){
            if (err)
                console.log(err)
            else if (resultsC.length > 0)
            {
                cust = resultsC;
                connection.query(
                    'SELECT * FROM CART_ITEMS WHERE ID = ?',
                    cart_id,
                    function(err, results){
                        if(err)
                            console.log(err);
                        else if(results.length > 0)
                        {
                            cart = results;
                            async () => {
                                prods = await getProds(cart);
                                
                            }
                            
                            console.log("out here:", prods);
                            res.render('checkout/checkout.ejs', {pagename, cust, cart, prods, customer_id, cart_id}); 
                            
                        }
                        else
                            res.redirect(`/checkout/${customer_id}`);
                    }
                )
            }
            else
                res.redirect(`/checkout/${customer_id}`);
        }
    )  
})

app.delete('/checkout/:customer_id/:cart_id/cart', (req, res) => {
    const { customer_id } = req.params;
    const { cart_id } = req.params;
    var product_id = parseInt(req.body.prodId);
    connection.query('DELETE FROM CART_ITEMS WHERE ID = ? AND P_ID = ?',
    [parseInt(cart_id), product_id],
    function(err, results){
        if (err)
            throw err;
        else {
            console.log("Succesfully deleted");
            res.redirect(`/checkout/${customer_id}/${cart_id}/cart`);
        }
    })
})

app.listen(8080, () => {
    console.log("Listening ...");
})
