import React, { useState, Fragment } from 'react';
import { Route, Redirect } from 'react-router-dom';
import Button from './Button';
import Authentication from '../services/Authentication';
import '../static/styles/listitem.css';

function ListItem() {
    const [name, setName] = useState("");
    const [category, setcategory] = useState("");
    const [imageOne, setImageOne] = useState("");
    const [imageTwo, setImageTwo] = useState("");
    const [imageThree, setImageThree] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [complete, setComplete] = useState(false);

    const changeField = (e, type) => {
        if(type === "name"){ setName(e.target.value);}
        if(type === "category"){ setcategory(e.target.value); }
        if(type === "imageOne"){ 
            setImageOne(e.target.files[0]);
        }
        if(type === "imageTwo"){
            setImageTwo(e.target.files[0]);
         }
        if(type === "imageThree"){ 
            setImageThree(e.target.files[0]);
        }
        if(type === "description"){ setDescription(e.target.value); }
        if(type === "location"){ setLocation(e.target.value); }
        if(type === "value"){ setValue(e.target.value); }
    }

    const createItem = () => {
        const token = Authentication.getToken();
        const formData = new FormData();
        formData.append('itemname', name);
        formData.append('category', category);
        formData.append('images', imageOne);
        formData.append('images', imageTwo);
        formData.append('images', imageThree);
        formData.append('description', description);
        formData.append('location', location);
        formData.append('value', value);
        
        fetch('/api/item/listitem', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            },
            body: formData
        })
        .then((response) => response.json())
        .then((response) => {
            setLoading(false);
            setComplete(true);
        })
        .catch((err) => console.log(err));
    }

    if(loading){
        return(
            <div className="list-item-form">
                    <div className="loader"></div> 
            </div>
        )
    }

    if(complete){
        return(
            <Redirect to="/" />
        )
    }

    return (
        <Route>
            <div className="list-item-form">
                <form encType="multipart/form-data" method="POST" onSubmit={(e) => {
                    e.preventDefault();
                    setLoading(true);
                    createItem();
                }}>
                    <ul>
                        <li className="item-name">
                            <label htmlFor="item-name">Item Name *</label>
                            <input className="form-input" type="text" value={name} onChange={(e) => { changeField(e, "name"); }} name="item-name" minLength="1" maxLength="30" required/>
                        </li>
                        <li>
                            <label htmlFor="category_chosen">Category *</label>
                            <br />
                            <select name="category" required onChange={(e) => { changeField(e, "category"); }}>
                            <option>Select a category</option>
                            <option>Electronics/Technology</option>
                            <option>Vehicles/Parts</option>
                            <option>Clothing</option>
                            <option>Houseware</option>
                            <option>Services</option>
                            </select>
                        </li>
                        <li>
                            {imageOne ? <h3>Chosen main image <span role="img" aria-label="confirmation">✅</span></h3> 
                                : 
                                <Fragment>
                                    <label htmlFor="main-img">Add a main image *</label>
                                    <input type="file" name="main-img" onChange={(e) => { changeField(e, "imageOne"); }} required/>
                                </Fragment>}
                        </li>
                        <li>
                            {imageTwo ? <h3>Chosen secondary image <span role="img" aria-label="confirmation">✅</span></h3> 
                                : 
                                <Fragment>
                                    <label htmlFor="second-img">Add a second image</label>
                                    <input type="file" name="second-img" onChange={(e) => { changeField(e, "imageTwo"); }}/>
                                </Fragment>}
                        </li>
                        <li>
                            {imageThree ? <h3>Chosen tertiary image <span role="img" aria-label="confirmation">✅</span></h3> 
                            :
                            <Fragment>
                                <label htmlFor="third-img">Add a third image</label>
                                <input type="file" name="third-img" onChange={(e) => { changeField(e, "imageThree"); }}/>
                            </Fragment>}
                        </li>
                        <li className="item-desc">
                            <label htmlFor="description">Item description *</label>
                            <br />
                            <textarea name="description" rows="3" required value={description} onChange={(e) => { changeField(e, "description"); }}></textarea>
                        </li>
                        <li>
                            <label htmlFor="location">Location *</label>
                            <br />
                            <select name="location" required onChange={(e) => { changeField(e, "location"); }}>
                            <option>Select a Location</option>
                            <option>North London</option>
                            <option>East London</option>
                            <option>West London</option>
                            <option>South London</option>
                            <option>Central London</option>
                            <option>Manchester </option>
                            <option>Liverpool</option>
                            <option>Newcastle</option>
                            <option>Brighton</option>
                            </select>
                        </li>
                        <li className={"est-value"}>
                            <label htmlFor="value">Estimated value (£) *</label>
                            <input type="number" min="1" max="100000" name="value" placeholder="Enter a numeric value" required value={value} onChange={(e) => { changeField(e, "value"); }}/>
                        </li>
                    </ul>
                    <br />
                    <Button className={"list-item-btn outline-green"} name={"List your item"}/>
                </form>
            </div>
        </Route>
    );
}

export default ListItem;
