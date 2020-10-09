import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import Header from '../../common/header/Header';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import StarIcon from '@material-ui/icons/Star';
import './Home.css';
const styles = theme => ({
    media: {
      height: 140
    },
});

class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            restaurants: null,
            filteredRestaurants: [],
            loggedIn: sessionStorage.getItem("access-token") == null ? false : true
        }
    }

    componentWillMount() {

        // Get restaurant  list  
        let dataUserProfile = null;
        let xhrUserProfile = new XMLHttpRequest();
        let that = this;
        xhrUserProfile.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            const data = JSON.parse(this.responseText).restaurants;
            that.setState({
                restaurants : data,
                filteredRestaurants: data,
            }); 
        }
        });
        xhrUserProfile.open("GET",  this.props.baseUrl +  "restaurant");
        xhrUserProfile.setRequestHeader("Cache-Control", "no-cache");
        xhrUserProfile.send(dataUserProfile);
    }

    restaurantClickHandler = (restaurant_id, e) => {        
        this.props.history.push("/restaurant/"+restaurant_id);       
    };

    applyFilter = (e) => {
        // Getting search filed value and converting to lowercase to match with array
        console.log("Search ",e.target.value);
        const _searchText = (e.target.value).toLowerCase();
        // Stringify and parsing json of restaurant list to avoid reference
        let _restaurants = JSON.parse(JSON.stringify(this.state.restaurants));
        let _filteredRestaurants = [];
        if(_restaurants !== null && _restaurants.length > 0){
            // Filtering restaurants based on name and search text and assign to temp variable
            _filteredRestaurants = _restaurants.filter((restaurant) => 
                 (restaurant.restaurant_name.toLowerCase()).indexOf(_searchText) > -1 
            );

            // Setting filtered  restaurants to our state filteredrestaurant 
            this.setState({
                filteredRestaurants: [..._filteredRestaurants]
            });
        }
    }

    filterRestaurant = (e) => {
        
        let dataSearch=null;
        let xhrSearch = new XMLHttpRequest();
        let that = this;
        let search=(e.target.value).replaceAll(" ","");
        if(e.target.value===""){
            this.setState({
                filteredRestaurants: this.state.restaurants,
            }); 
        }
        else{
                xhrSearch.addEventListener("readystatechange", function () {
                    if (this.readyState === 4) {
                        if (xhrSearch.status === 200 || xhrSearch.status === 201){
                            const data = JSON.parse(this.responseText).restaurants;
                            that.setState({
                                filteredRestaurants: data,
                            }); 
            
                        }
                    }
                });
            
                xhrSearch.open("GET", "http://localhost:8080/api/restaurant/name/"+search);
                xhrSearch.setRequestHeader("Content-Type", "application/json");
                xhrSearch.setRequestHeader("Cache-Control", "no-cache");
                xhrSearch.send(dataSearch);
            }
      };


    render() {
        const { classes } = this.props;
        return (
            <div>
                 <Header baseUrl={this.props.baseUrl} onChange={this.filterRestaurant}/>
                 <Container fixed style={{ 'margin':16}}>
                 {this.state.filteredRestaurants.length > 0 ? (
                    <Grid container spacing={3}>
                        {(this.state.filteredRestaurants ).map((restaurant, index) => (
                            <Grid item xs={6} sm={3} key={restaurant.id} >
                            <Card onClick={this.restaurantClickHandler.bind(this,restaurant.id)} >
                                
                                    <CardMedia
                                    className={classes.media}
                                    image={restaurant.photo_URL}
                                    title={restaurant.restaurant_name}
                                    />
                                    <CardContent>
                                    <Typography gutterBottom variant="h5" color="textPrimary" style={{minHeight:50}}>
                                            {restaurant.restaurant_name}
                                    </Typography>  
                                    <Typography variant="inherit" style={{marginBottom:8,textOverflow:"inherit",overflow:"hidden",width:"300px"}}>
                                        {restaurant.categories}
                                    </Typography> <br/> <br/>                          
                                    <div className="card-footer">
                                        <span className="card-footer-rating">
                                             <StarIcon/>
                                             <span style={{marginLeft:4}}>{restaurant.customer_rating} ({restaurant.number_customers_rated})</span>
                                        </span>                                     
                                        <span id="rupee"> 
                                            <i className="fa fa-inr"></i>{restaurant.average_price} for two
                                        </span>
                                    </div>  
                                    
                                    </CardContent>
                                                    
                            </Card>
                            </Grid>  
                        ))}
                 </Grid> ) : (
                      <Typography variant="h6" color="textPrimary" component="h6" style={{marginBottom:8}}>
                          No restaurant with given name.
                      </Typography>
                 )  }             
                </Container>
            </div>
        )
                 }
                }
                export default withStyles(styles)(Home);