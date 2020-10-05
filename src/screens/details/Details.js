import React from 'react';
import './Details.css';
import Header from '../../common/header/Header';
import 'font-awesome/css/font-awesome.min.css';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import ShoppingCart from '@material-ui/icons/ShoppingCart';
import Add from '@material-ui/icons/Add';
import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  card: {
    minWidth: 275,
  }
};

class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      restaurant_name: null,
      photo_URL: null,
      customer_rating: null,
      average_price: null,
      number_customers_rated: null,
      locality: null,
      categories: [],
      snackbarOpen: false,
      cartItems: 0,
      cartItemsList: [],
      snackbarMessage: null,
      cartTotalPrice: 0,
      restaurant_id: null
    }
  };

  componentDidMount() {
    const {
      history: {
        location: {
          pathname,
        } = {},
      } = {},
    } = this.props;
    let id = pathname.split('/')[2];
    this.getRestaurantDetails(id);
  };

  getRestaurantDetails = (id) => {
    let _this = this;
    let url = `${this.props.baseUrl}restaurant/${id}`;
    return fetch(url, {
      method: 'GET',
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
    }).then((responseJson) => {
      _this.setState({
        restaurant_name: responseJson.restaurant_name,
        photo_URL: responseJson.photo_URL,
        customer_rating: responseJson.customer_rating,
        average_price: responseJson.average_price,
        number_customers_rated: responseJson.number_customers_rated,
        locality: responseJson.address.locality,
        categories: responseJson.categories,
        cartItems: 0,
        restaurant_id: id,
      });
    }).catch((error) => {
      console.log('error getting data', error);
    });
  };
  //handle sanckbar
  handleSnackBar = (message) => {
    this.setState({
      snackbarOpen: !this.state.snackbarOpen,
      snackbarMessage: message,
    });
  }
  //handle checkout
  checkoutHandler = () => {
    if (this.state.cartItems === 0) {
      this.handleSnackBar("Please add an item to your cart!");
    } else if (!sessionStorage.getItem("access-token")) {
      this.handleSnackBar("Please login first!");
    } else {
      let customerCart = {
        restaurantDetails: {
          'average_price': this.state.average_price,
          'categories': this.state.categories,
          'customer_rating': this.state.customer_rating,
          'id': this.state.restaurant_id,
          'number_customers_rated': this.state.number_customers_rated,
          'photo_URL': this.state.photo_URL,
          'restaurant_name': this.state.restaurant_name,
        },
        cartItems: this.state.cartItemsList,
        totalPrice: this.state.cartTotalPrice
      };
      this.props.history.push({
        pathname: '/checkout',
        data: customerCart,
      });
    }
  }

  //remove the item from cart by clicking on minus
  removeItemFromCartHandler = (cartItem) => {
    let cartItemsList = this.state.cartItemsList;
    let index = cartItemsList.indexOf(cartItem);
    cartItemsList[index].quantity -= 1;
    if (cartItemsList[index].quantity === 0) {
      cartItemsList.splice(index, 1);
      this.handleSnackBar("Item removed from cart!");
    } else {
      this.handleSnackBar("Item quantity decreased by 1!");
    }
    this.setState({
      cartItems: this.state.cartItems - 1,
      cartItemsList: cartItemsList,
      cartTotalPrice: this.state.cartTotalPrice - cartItem.item.price,
    })
  }

  //add item form plus sign of cart handler
  addItemFromCartHandler = (cartItem) => {
    this.handleSnackBar("Item quantity increased by 1!");
    let cartItemsList = this.state.cartItemsList;
    let index = cartItemsList.indexOf(cartItem);
    cartItemsList[index].quantity += 1;
    this.setState({
      cartItems: this.state.cartItems + 1,
      cartItemsList: cartItemsList,
      cartTotalPrice: this.state.cartTotalPrice + cartItem.item.price,
    });
  }

  //Add item from menu.categories
  addItemHandler = (item) => {
    this.handleSnackBar("Item added to cart!");
    let cartItemsList = this.state.cartItemsList;
    var cartItem;
    let cartItems = cartItemsList.map((el) => el.item);
    let index = cartItems.indexOf(item);
    if (index === -1) {
      cartItem = {
        item: item,
        quantity: 1,
      }
      cartItemsList.push(cartItem);
    } else {
      cartItemsList[index].quantity += 1;
      cartItem = cartItemsList[index]
    }

    this.setState({
      cartItems: this.state.cartItems + 1,
      cartItemsList: cartItemsList,
      cartTotalPrice: this.state.cartTotalPrice + cartItem.item.price,
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        {/* Header */}
        <div >
          <Header showSearch="false" baseUrl={this.props.baseUrl} />
        </div>
        {/* restaurant information */}
        <div className="restaurant-information">
          <div className="restaurant-image">
            <div>
              <img
                src={this.state.photo_URL}
                alt='restaurant'
                width='100%'
              />
            </div>
          </div>
          <div className="restaurant-details">
            <div>
              <Typography variant="h4" gutterBottom> {this.state.restaurant_name} </Typography> <br />
              <Typography variant="h5" gutterBottom> {this.state.locality} </Typography> <br />
              <Typography variant="body1" gutterBottom> {this.state.categories
                && Array.isArray(this.state.categories)
                && this.state.categories.length > 0
                && this.state.categories.map((el) => el.category_name).join(", ")} </Typography>
            </div>
            <div style={{ float: 'left', display: "flex", flexDirection: "row", width: "100%", paddingTop: "5%" }}>
              <div style={{ width: "100%" }}>
                <i className="fa fa-star" aria-hidden="true"> {this.state.customer_rating} </i> <br />
                <Typography variant="caption" gutterBottom> AVERAGE RATING BY <br /> <span style={{ fontWeight: 'bold' }}> {this.state.number_customers_rated} </span> USERS </Typography>
              </div>
              <div style={{ width: "100%" }}>
                <i className="fa fa-inr" aria-hidden="true"> {this.state.average_price} </i> <br />
                <Typography variant="caption" gutterBottom> AVERAGE COST FOR <br /> TWO PEOPLE </Typography>
              </div>
            </div>
          </div>
        </div>
        <div className="menu-cart-section">
          {/* menu-items section */}
          <div className='menu'>
            <div style={{ padding: '3%' }}>
              {this.state.categories.map(categoryItem =>
                <div key={categoryItem.id}>
                  <CategoryItem item={categoryItem} this={this} />
                </div>
              )}
            </div>
          </div>
          {/* cart section */}
          <div className="cart">
            <div style={{ padding: '3%' }}>
              <Card className={classes.card}>
                <CardContent>
                  <div style={{ display: "inline-block", width: "100%" }}>
                    <div style={{ float: "left", width: "10%" }}><Badge badgeContent={this.state.cartItems === null ? 0 : this.state.cartItems} color="primary"><ShoppingCart /></Badge></div>
                    <div style={{ float: "right", width: "90%" }}><Typography variant="h5" gutterBottom style={{ fontWeight: 'bold' }}> My Cart </Typography></div>
                  </div>
                  {/* items in cart */}
                  {this.state.cartItemsList.map(cartItem =>
                    <div key={cartItem.item.id}>
                      <CartItem item={cartItem} this={this} />
                    </div>
                  )}
                  <div style={{ display: "inline-block", width: "100%", paddingTop: "3%" }}>
                    <div style={{ float: "left" }}><Typography variant="body1" gutterBottom style={{ fontWeight: 'bold' }}> TOTAL AMOUNT </Typography></div>
                    <div style={{ float: "right", width: "14%" }}><i className="fa fa-inr" aria-hidden="true"> </i> {this.state.cartTotalPrice.toFixed(2)} </div>
                  </div>
                </CardContent>
                <CardActions>
                  <div style={{ width: "100%" }}>
                    <Button style={{ width: "100%" }} variant="contained" color="primary" onClick={this.checkoutHandler}> CHECKOUT </Button>
                  </div>
                </CardActions>
              </Card>
            </div>
          </div>
        </div>
        {/** SnackBar Section */}
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.snackbarOpen}
          autoHideDuration={700}
          onClose={(e) => this.handleSnackBar("")}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.snackbarMessage}</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={(e) => this.handleSnackBar("")}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </div>
    );
  }
}

//create the div for the cart item
function CartItem(props) {
  const cartItem = props.item;
  const color = props.item
    && props.item.item.item_type && props.item.item.item_type.toString()
    && props.item.item.item_type.toLowerCase() === "non_veg" ? "red" : "green";
  return (
    <div style={{ display: "flex", flexDirection: "row", width: "100%", padding: "1%" }}>
      <div style={{ width: "10%", display: "flex", alignItems: "center", color: color }}><i className="fa fa-stop-circle-o" aria-hidden="true"></i></div>
      <div style={{ width: "40%", display: "flex", alignItems: "center", textTransform: "capitalize" }}><span style={{ color: "grey" }}> {cartItem.item.item_name} </span></div>
      <div style={{ width: "5%", display: "flex", alignItems: "center" }}>
        <i onClick={(e) => props.this.removeItemFromCartHandler(cartItem)} className="cartButton fa fa-minus" aria-hidden="true" ></i>
      </div>
      <div style={{ width: "5%", display: "flex", alignItems: "center" }}> {cartItem.quantity} </div>
      <div style={{ width: "25%", display: "flex", alignItems: "center" }}>
        <i onClick={(e) => props.this.addItemFromCartHandler(cartItem)} className="cartButton fa fa-plus" aria-hidden="true" ></i>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}><i className="fa fa-inr" aria-hidden="true"><span style={{ color: "grey" }}> {cartItem.item.price.toFixed(2)} </span></i></div>
    </div>
  )
}

//render the category item
function CategoryItem(props) {
  return (
    <div style={{ padding: "3%" }}>
      <Typography variant="caption" gutterBottom style={{ fontWeight: "bold", textTransform: "uppercase" }}> {props.item.category_name} </Typography>
      <Divider />
      {props
        && props.item
        && props.item.item_list
        && Array.isArray(props.item.item_list)
        && props.item.item_list.length > 0
        && props.item.item_list.map(menuItem =>
          <div key={menuItem.id}>
            <MenuItem item={menuItem} this={props.this} />
          </div>
        )}
    </div>
  )
};

function MenuItem(props) {
  const color = props.item.item_type
    && props.item.item_type.toString()
    && props.item.item_type.toLowerCase() === "non_veg" ? "red" : "green";
  return (
    <div style={{ display: "flex", flexDirection: "row", width: "100%", paddingLeft: "1%" }}>
      <div style={{ width: "5%", display: "flex", alignItems: "center", color: color }}><i className="fa fa-circle" ></i></div>
      <div style={{ width: "65%", display: "flex", alignItems: "center", textTransform: "capitalize" }}> {props.item.item_name} </div>
      <div style={{ width: "20%", display: "flex", alignItems: "center" }}><i className="fa fa-inr" aria-hidden="true"> {props.item.price.toFixed(2)} </i></div>
      <div style={{ width: "10%", display: "flex", alignItems: "center" }}>
        <IconButton onClick={(e) => props.this.addItemHandler(props.item)}><Add style={{ height: "100%" }} /></IconButton>
      </div>
    </div>
  )
};

export default withStyles(styles)(Details);