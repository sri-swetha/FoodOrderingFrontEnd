import React, { Component } from "react";
import Header from "../../common/header/Header";
import './Checkout.css';
//Material-ui Components
import Grid from "@material-ui/core/Grid";
import PropTypes from 'prop-types';
import * as Utils from '../../common/Utils';
import * as Constants from '../../common/Constants';
import { withStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from "@material-ui/core/Button";
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';
import GridList from '@material-ui/core/GridList';
import {GridListTile} from '@material-ui/core';
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from '@material-ui/core/CardHeader';
import Divider from "@material-ui/core/Divider";
import { CardActions } from "@material-ui/core";
import { FormControl, InputLabel, Input, Select, AppBar } from "@material-ui/core";
import FormHelperText from '@material-ui/core/FormHelperText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircle from '@material-ui/icons/CheckCircle'


const styles = muiBaseTheme => ({
  root: {
    width: "100%"
  },
  button: {
    marginTop: muiBaseTheme.spacing(),
    marginRight: muiBaseTheme.spacing()
  },
  actionsContainer: {
    marginBottom: muiBaseTheme.spacing(2)
  },
  resetContainer: {
    padding: muiBaseTheme.spacing(3)
  },
  connector: {
    display: "none"
  },
  step: {
    marginBottom: muiBaseTheme.spacing(5)
  },
  iconContainer: {
    transform: "scale(2)",
    marginRight: muiBaseTheme.spacing(5)
  },
  formControl:{
      width:"90%",
      minWidth:120
  },
  saveAddressButton:{
      display:"block",
      marginTop:30
  },
  summaryCard:{
    marginLeft:"-10px;"
  },
  divider:{
    marginTop:"10px",
    marginBottom:"10px",
    marginLeft:"auto",
    width:"15px",
    margin: `${muiBaseTheme.spacing(3)}px 0`
  },
  card: {
    maxWidth: 250,        
    boxShadow: "3px -3px 0px 6px rgba(255,0,102,1)",    
  },
  media: {
    height:0,
    paddingTop: "56.25%"
  },
  content: {
    textAlign: "left",
    width:"10%"
  },
  heading: {
    fontWeight: "bold"
  },
  subheading: {
    lineHeight: 1.8
  },
  CardAction:{
    marginLeft : "auto",
    flex:1
  },
  IconButton:{
    color:"#009999"
  } 
});

//Storing access token to a constant to use throughout the class
const access_token =sessionStorage.getItem("access-token");
//Declaring base API url
const baseURL = "http://localhost:8080/api/";

//Applying Tab display style
function TabContainer(props) {
  return (
      <Typography component={'div'} variant={'body2'} style={{ padding: 8 * 3 }}>
          {props.children}
      </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

//To toggle between steps: Delivery and Payment
function getSteps() {
return ["Delivery", "Payment"];
}


class Checkout extends Component {
  constructor(){
    super();
    this.state = {            
        value:0, 
        activeStep : 0,            
        dataAddress:[], 
        selected:0,
        dataPayments:[],
        paymentMethod:"",
        dataStates:[], 
        flatBldNo : "",
        flatBldNoRequired : 'dispNone',
        locality:"",
        localityRequired : 'dispNone',
        city:"",
        cityRequired : 'dispNone',
        pincode:"",
        pincodeRequired : 'dispNone',
        stateRequired:'dispNone',
        saveAddressSuccess : false,
        saveAddressError : 'dispNone',
        saveAddressErrorMsg : '',
        checkOutAddressRequired : 'dispNone',
        selAddress : "",
        chcartItems:[],
        totalCartItemsValue:"",
        resDetails:null,
        onNewAddress:false,
        changeOption:"dispNone"
    };
}

//Getting all saved addresses for a customer
getAddresses(baseURL, access_token){    
let data = null;
let xhrAddresses = new XMLHttpRequest();
access_token = sessionStorage.getItem("access-token");
let that = this;

xhrAddresses.addEventListener("readystatechange", function () {  
    if (this.readyState === 4) {                                      
          let address = JSON.parse(xhrAddresses.response);
          that.setState({dataAddress: address});
    }
})
xhrAddresses.open("GET", baseURL + "address/customer");
xhrAddresses.setRequestHeader("authorization", "Bearer " + access_token); //sessionStorage.getItem('access-token')
xhrAddresses.setRequestHeader("Cache-Control", "no-cache");
xhrAddresses.send(data);
}

//Get all available payment methods
getPaymentMethods(){
  let data = null;
  let xhrPayments= new XMLHttpRequest();
  let that = this;
  xhrPayments.addEventListener("readystatechange", function () {  
    if (this.readyState === 4) {                                      
          let paymentMethods = JSON.parse(xhrPayments.response);
          that.setState({dataPayments: paymentMethods});
    }
})
xhrPayments.open("GET", baseURL + "payment");
xhrPayments.setRequestHeader("Accept", "application/json;charset=UTF-8");
xhrPayments.send(data);
}

//Get all available state values for the dropdown
getStates(){
const url = baseURL + 'states'
const that = this;

//API call function invoked from Utils.js
Utils.makeApiCall(
  url, 
  null,
  null,
  Constants.ApiRequestTypeEnum.GET,
  null,
  responseText => {
    that.setState({
      dataStates : JSON.parse(responseText).states
    })
  }
)
}


onStateChange = (event) => {
  this.setState({selected:event.target.value})
};

//Invoke the follow GET calls once the component successfully loads
componentDidMount(){
this.mounted = true;
}

//Set component state values from props passed from Details page
componentWillMount(){
  try{
    console.log(this.props.history.location.state.chcartItems.ItemList);
    this.setState({chcartItems:this.props.history.location.state.chcartItems});
    this.setState({totalCartItemsValue:this.props.history.location.state.totalCartItemsValue});
    this.setState({resDetails:JSON.parse(sessionStorage.getItem("restaurantDetails"))});
    this.getAddresses(baseURL, access_token);
    this.getPaymentMethods();
    this.getStates();
  } catch {
    this.mounted = false;
    this.props.history.push({
      pathname: "/"
     });
  }
}

/*
Using this value of State to disable any action on "Next" button
when the control is on the "New Address" tab
*/
onExistingAddressTab=()=>{
  this.setState({onNewAddress:false});
}
onNewAddressTab=()=>{
this.setState({onNewAddress:true});
}

//Handling and storing change of payment method value
handleChange = (event) => {
this.setState({paymentMethod:event.target.value})
sessionStorage.setItem("paymentMethod", event.target.value);
}

//Capturing input field values in state for processing
flatBldNoChangeHandler = (e) => {
   this.setState({ flatBldNo: e.target.value })    
}

localityChangeHandler = (e) => {
   this.setState({locality : e.target.value })
}

cityChangeHandler = (e) => { 
   this.setState({city : e.target.value })
}

pinCodeChangeHandler = (e) => {
   this.setState({pincode : e.target.value })
}

//Called to save new address entered by user
addressClickHandler = () =>    
{

this.setState({saveAddressError:"dispNone"})
  //Validating that no fields are empty
  //If empty, "required" text is displayed
this.state.flatBldNo === "" ? this.setState({ flatBldNoRequired: "dispBlock" }) : this.setState({ flatBldNoRequired: "dispNone" });      
this.state.locality === "" ? this.setState({ localityRequired: "dispBlock" }) : this.setState({ localityRequired: "dispNone"});
this.state.city === "" ? this.setState({ cityRequired: "dispBlock" }) : this.setState({ cityRequired: "dispNone" });
this.state.pincode === "" ? this.setState({ pincodeRequired: "dispBlock" }) : this.setState({ pincodeRequired: "dispNone" });
this.state.selected === 0 ? this.setState({ stateRequired: "dispBlock" }) : this.setState({ stateRequired: "dispNone" });

if(this.state.flatBldNo === "" || this.state.locality === "" || this.state.city === "" || this.state.pincode === ""  || this.state.selected === ""){return}

//Forming parameters to pass in the API Url
let dataAddress = JSON.stringify({
      "city": this.state.city,
      "flat_building_name": this.state.flatBldNo,
      "locality": this.state.locality,
      "pincode": this.state.pincode,
      "state_uuid": this.state.selected
    })

let that = this;
let access_token = sessionStorage.getItem("access-token");
let xhrSaveAddress = new XMLHttpRequest();
xhrSaveAddress.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {              
        let saveAddressResponse = JSON.parse(this.response);
        if(saveAddressResponse.code === 'SAR-002' || saveAddressResponse.code === 'SAR-002'){
          that.setState({saveAddressError : "dispBlock"});
          that.setState({saveAddressErrorMsg:"Pincode must contain only numbers and must be 6 digits long"});            
        }else{
          that.setState({ saveAddressSuccess: true });
          window.location.reload();       
        }
    }
})

xhrSaveAddress.open("POST", this.props.baseUrl + "address");
xhrSaveAddress.setRequestHeader("authorization", "Bearer " + access_token);
xhrSaveAddress.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhrSaveAddress.send (dataAddress);
}

//Called when user selects an address
/*
addressChangeHandler = () => {
  this.setState({selAddress: sessionStorage.getItem("selected")});
}
*/

//Placing order after entering all required values:Delivery and Payment details
//Triggered from "Place Order" button
checkoutHandler = () => {   

if(sessionStorage.getItem("selAddress")==="null" || sessionStorage.getItem("selAddress")===null){
  this.setState({saveOrderResponse : "Please select Address"})        
  this.openMessageHandler();   
  return;
}else if(this.state.paymentMethod === ""){
  this.setState({saveOrderResponse : "Please select payment method"})        
  this.openMessageHandler();                   
  return;
}

//When order is placed,  checkout with order id 
let orders = this.state.chcartItems.itemList;      
let dataCheckout = JSON.stringify({                  
    "address_id": sessionStorage.getItem("selected"),
    "bill": this.state.totalCartItemsValue,
    "coupon_id": "",
    "discount": 0,
    "item_quantities":
      orders.map(item => (
        {
        "item_id":  item.item.id,
        "price" : item.item.price,
        "quantity" : item.quantity
        }))
    ,
    "payment_id": sessionStorage.getItem("paymentMethod"),
    "restaurant_id": JSON.parse(sessionStorage.getItem("restaurantDetails")).id     
})       
let that = this;
let access_token = sessionStorage.getItem("access-token");
let xhrCheckout = new XMLHttpRequest();
xhrCheckout.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {              
        let checkoutResponse = JSON.parse(this.response);  
        let response =   checkoutResponse.status + "! Your order ID is " + checkoutResponse.id;
          that.setState({saveOrderResponse : response});
          that.openMessageHandler();                      
    }
})  

xhrCheckout.open("POST", this.props.baseUrl + "order");
xhrCheckout.setRequestHeader("Authorization", "Bearer " + access_token);
xhrCheckout.setRequestHeader("Content-Type", "application/json");
xhrCheckout.setRequestHeader("Cache-Control", "no-cache");
xhrCheckout.setRequestHeader("Access-Control-Allow-Origin", "*");  
xhrCheckout.send(dataCheckout);
}

//Opening snack bar
openMessageHandler = () => {
this.setState({snackBarOpen:true})  
}
//Closing snack bar
handleClose = (event, reason) => {
if (reason === 'clickaway') {
  return;
}
this.setState({snackBarOpen:false})
}
getStepContent= (step) => {       

  switch (step) {
    case 0:
      return (
          <div>
              <AppBar position={"static"}>
              <Tabs className={this.props.tabs} value={this.state.value} onChange={this.tabChangeHandler}>
                  <Tab onClick={this.onExistingAddressTab} label="Existing Address" />
                  <Tab onClick={this.onNewAddressTab} label="New Address" />
              </Tabs>
              </AppBar>
              {this.state.value === 0 && 
              
                  <TabContainer>
                    {this.state.dataAddress.addresses===null?
                    <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                    className={this.props.root}
                    >
                      <Grid container spacing={5}>
                        <GridList cellHeight={"auto"} className="gridListMain">
                           <GridListTile style={{width:"100%",marginTop:"4%"}} >
                              <span style={{fontSize:"20px"}}>There are no saved addresses! You can save an address using the "New Address" tab or using your "Profile" Menu</span>
                           </GridListTile>
                        </GridList>  
                       </Grid>
                    </Grid>
                    
                    :
                   <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                    className={this.props.root}
                    >
                      <Grid container spacing={5}>
                      <GridList cellHeight={"auto"} className="gridListMain">
                      {(this.state.dataAddress.addresses || []).map((exisAddress,index) => {
                      return (<GridListTile className={exisAddress.id===this.state.selected?"selectedAddress":"gridListTile"} key={exisAddress.id} id={exisAddress.id} style={{padding: '5px'}}>
                       <div className="App">
                       <Card className={this.props.card} key={exisAddress.id} >
                          <CardContent className="addressCard">
                            <Typography
                               style={{width:"100%",textTransform:"capitalize"}}
                               variant={"h6"}
                               gutterBottom
                            >
                          {exisAddress.flat_building_name} <br /> {exisAddress.locality} <br />
                          {exisAddress.city} <br />
                          {exisAddress.state.state_name} <br />
                          {exisAddress.pincode} <br />
                           </Typography>          
                          <IconButton className="selectAddresscircle" aria-label="Select Address" onClick={()=>this.onAddressClick(exisAddress)}>            
                          {exisAddress.id===this.state.selected ? <CheckCircle style={{color:"green"}} />:<CheckCircle style={{color:"#999999"}} />}      
                          </IconButton>          
                          </CardContent>
               </Card>
            </div>
           </GridListTile>
          );
          })}
                  </GridList>  
                </Grid>
               </Grid>}
              </TabContainer>
          },
               {this.state.value === 1 && 
                  <TabContainer>
                      <div className="login">                            
                          <FormControl required className={this.props.formControl}>
                              <InputLabel htmlFor="FltBldNo">Flat/Build No.</InputLabel>
                              <Input 
                                  id="FlatBldNo"
                                  type="text"
                                  onChange={this.flatBldNoChangeHandler}  
                              />
                              <FormHelperText className={this.state.flatBldNoRequired}><span className="red">required</span></FormHelperText>
                          </FormControl><br/><br />
                          <FormControl required className={this.props.formControl}>
                              <InputLabel htmlFor="Locality">Locality</InputLabel>
                              <Input 
                                  id="Locality"
                                  type="text"
                                  onChange={this.localityChangeHandler}  
                              />
                              <FormHelperText className={this.state.localityRequired}><span className="red">required</span></FormHelperText>
                          </FormControl><br/><br/>
                          <FormControl required className={this.props.formControl}>
                              <InputLabel htmlFor="city">City</InputLabel>
                              <Input 
                                  id="City"
                                  type="text"
                                  onChange={this.cityChangeHandler}  
                              />
                              <FormHelperText className={this.state.cityRequired}><span className="red">required</span></FormHelperText>
                          </FormControl><br/><br/>                                
                          <FormControl required className={this.props.formControl}>
                              <InputLabel htmlFor="State" shrink>State</InputLabel>
                              <Select 
                                  value={this.state.selected}
                                  onChange={this.onStateChange}                                        
                                  input={<Input name="state" id="state" />} 
                                  style={{width:'200px'}} 
                                  placeholder="Select State"                                      
                                  >
                                      <MenuItem selected value="0">
                                          Select State
                                      </MenuItem>                                   
                                      {this.state.dataStates.map((state,i) => (                                                
                                      <MenuItem key={"state_" + state.id + "_" + i} value={state.id}>
                                          {state.state_name}
                                      </MenuItem>
                                      ))}
                                  </Select>
                                  <FormHelperText className={this.state.stateRequired}><span className="red">required</span></FormHelperText>
                            </FormControl><br/><br/>
                          <FormControl required className={this.props.formControl}>
                              <InputLabel htmlFor="Pincode">Pin Code</InputLabel>
                              <Input 
                                  id="Pincode"
                                  type="text"
                                  onChange={this.pinCodeChangeHandler}  
                              />
                              <FormHelperText className={this.state.pincodeRequired}><span className="red">required</span></FormHelperText>
                          </FormControl><br/><br/>
                          <FormControl className={this.props.formControl}>
                            <Typography variant="subtitle1" color="error" className={this.state.saveAddressError} align="left">{this.state.saveAddressErrorMsg}</Typography>                                                              
                          </FormControl><br /><br />
                          <Button variant="contained" style={{width:"20%",height:"40px"}} color="secondary" onClick={this.addressClickHandler} className="saveAddressButton">
                            SAVE ADDRESS
                          </Button>                                                        
                      </div>
                  </TabContainer>
              }
          </div>
        );
    case 1:
      return (
        <div>
         <FormControl component="fieldset" className={this.props.formControl}>
         <FormLabel component="legend">Select Mode of Payment</FormLabel>
         <RadioGroup
            aria-label="Payment Method"
            name="payment"
            className={this.props.group}
            value={this.state.paymentMethod}
            onChange={this.handleChange}
          >
        {this.state.dataPayments.paymentMethods.map((payMethod,index) => (                
          <FormControlLabel value={payMethod.id} control={<Radio />} label={payMethod.payment_name} key={index}/>                
        ))}
        </RadioGroup>
        </FormControl>
        </div>
      )
    default:
      return "Unknown step";
  }
}

//Called when user clicks on "Next" to go to next step
//Also called when user clicks on "Finish" after completing payment. This displays "Change" option and text
handleNext = () => {
  if(this.state.onNewAddress===true){
    //do nothing
  } else {
    if(this.state.activeStep===1){
      this.setState(state => ({
        activeStep: this.state.activeStep + 1,
        changeOption:"dispText"
        }));
    } else {
  this.setState(state => ({
    activeStep: this.state.activeStep + 1,
    changeOption:"dispNone"
    }));}
}
};

//Called when an addres is selected in "Delivery step"
//Also when user clicks on the same address - This deselects the address
onAddressClick=(address)=>{
  if(address.id===this.state.selected){
    sessionStorage.setItem("selected",null);
    sessionStorage.setItem("selAddress",null);
    this.setState(state=>({
      selected:null,
      selAddress:null
    }));
  } else {
    sessionStorage.setItem("selected",address.id);
    sessionStorage.setItem("selAddress",JSON.stringify(address));
    this.setState(state=>({
      selected:address.id,
      selAddress:address
    }));

  }

  };

//Called to back one step Payment to Delivery
handleBack = () => {
  this.setState(state => ({
  activeStep: this.state.activeStep - 1
  }));
  };

//Called when "CHANGE" button is clicked
//Goes to Delivery step and retains all data entered by user
handleReset = () => {
this.setState({
activeStep: 0
});
};

 //Logout action from drop down menu on profile icon
 loginredirect = () => {
    sessionStorage.clear();
    this.props.history.push({
    pathname: "/"
    });
  }

//To toggle between "Existing Address" and "New Address" tabs
tabChangeHandler = (event, value) => {
this.setState({value})
};

render(){
  const { classes } = this.props;
  const steps = getSteps();
  const { activeStep } = this.state;   
  return (this.mounted === true ?      

    <div>
      <Header logoutHandler={this.loginredirect} showSearch = {false} searchRestaurantsByName = {this.searchRestaurantsByName}/>
      <Grid container spacing={1}>
        <Grid item xs={12} md={8}>
          <div className={classes.root}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map(label => {
                return (
                  <Step key={label} className={classes.step}>
                    <StepLabel classes={{iconContainer: classes.iconContainer}}>
                      <Typography component={'div'} variant={"h5"}>
                        {label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography component={'div'}>{this.getStepContent(activeStep)}</Typography>
                      <div>
                          <div>
                          <Button style={{fontSize:"20px"}}disabled={activeStep === 0} onClick={this.handleBack} className={classes.button}>
                              Back
                          </Button>
                          <Button variant="contained" color="primary" onClick={this.handleNext} className={classes.button}>
                              {activeStep === steps.length - 1 ? "Finish" : "Next"}
                          </Button>
                          </div>
                      </div>               
                    </StepContent>
                  </Step>
                );
              })}
            </Stepper><div className={this.state.changeOption}>View the summary and place your order now!<br/>
            <div ><Button style={{fontSize:"20px",marginLeft:"2%"}} onClick={this.handleReset} className={classes.button}>
                              CHANGE
                          </Button></div></div>                           
          </div>
        </Grid>
        <Grid  item xs={8} md={3}>
        <Card >        
            <CardHeader style={{fontWeight:"bolder"}} title="Summary" titleTypographyProps={{ variant: 'h4' }} />
            <div style={{marginLeft:"3%",fontSize:"200%", color:"grey",fontWeight:"bold"}}>{this.state.resDetails.restaurant_name}</div>
            <CardContent>
            <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
             >
        {this.props.history.location.state.chcartItems.itemList.map((item, index) => {
        return(
               <Grid style={{marginLeft:"3%", color:"grey", fontSize:"18px"}}container item xs={12} spacing={1} key={index}>
               <Grid item xs={1}>
                   {item.item.item_type === 'VEG' ?  <FiberManualRecord style={{ color: "#008000" }}/> : <FiberManualRecord style={{ color: "#b20505" }}/>}
               </Grid>
               <Grid item xs={6}>
                   <span style={{color:"grey", textTransform:"capitalize", fontSize:20, marginLeft:8}}>{item.item.item_name}</span>                        
               </Grid>
               <Grid item xs={1}>
                   {item.quantity}                      
               </Grid>
               <Grid item xs={1}>               
               </Grid>
               <Grid  item xs={2}>
               <i className="fa fa-inr"></i><span>  {item.item.price}</span>                        
               </Grid>
               </Grid>);
               })
               }
                 <Grid container item xs={12}>
                 <Grid className="tileContainer" item xs={11} >                  
                 <Divider className={this.props.divider} variant="middle" /> 
                 <br/>
                 </Grid>                                           
                 </Grid>
                    <Grid container item xs={12} >
                        <Grid item xs={5}>
                            <Typography style={{marginLeft:"14%",fontSize:"140%",fontWeight:"bold"}} >
                            Net Amount
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>                            
                        </Grid>
                        <Grid item xs={3}>
                        <Typography style={{marginLeft:"3%",fontSize:"140%",fontWeight:"bold"}}>                                                       
                        <i style={{color:"grey"}}className="fa fa-inr"></i><span>  {this.props.history.location.state.totalCartItemsValue}</span>
                        </Typography>
                        </Grid>
                    </Grid>
                </Grid>                
            </CardContent>
            <CardActions >
                <Button style={{fontSize:"120%", width:"90%", height:"40px", marginLeft:"5%"}} variant="contained" color="primary" className={this.props.classes.orderButton} onClick={this.checkoutHandler}>
                    Place Order
                </Button>
            </CardActions>
        </Card>
        </Grid>
      </Grid>
      <Snackbar
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                open={this.state.snackBarOpen}
                autoHideDuration={3000}
                onClose={this.handleClose}
                ContentProps={{
                  'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">{this.state.saveOrderResponse}</span>}
                action={[              
                  <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    className={classes.close}
                    onClick={this.handleClose}
                  >
                    <CloseIcon />
                  </IconButton>,
                ]}
              />
    </div>
    :
    ""
  );
}
}

Checkout.propTypes = {
  classes: PropTypes.object,
};
export default withStyles(styles)(Checkout);
