import React, { useContext, useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import Card from './Card';
import Button from './Button';
import Loading from './Loading';
import Paginator from './Paginator';
import ItemContext from '../context/ItemContext';
import LoadContext from '../context/LoadContext';
import '../static/styles/homepage.css';

function Home(props) {
    const [originalItems, items, setItems] = useContext(ItemContext);
    const [pages, setPages] = useState(0);
    const [loading] = useContext(LoadContext);

    useEffect(() => {
        setPages(Math.ceil(originalItems.length/6));
    }, [originalItems])

    const filter = (min, max, location, date, category) => {
        let filteredItems = items;
        if(min !== ""){
            filteredItems = filteredItems.filter((item) => { return item.est_cost >= min });
        }
        if(max !== ""){
            filteredItems = filteredItems.filter((item) => { return item.est_cost <= max });
        }
        if(location !== "Select a Location"){
            filteredItems = filteredItems.filter((item) => { return item.item_location === location });
        }
        if(date !== "Select date to sort by"){
            if(date === "Oldest"){
                filteredItems = filteredItems.sort((a, b) => {
                    return new Date(a.date_posted) - new Date(b.date_posted);
                });
            }else{
                filteredItems = filteredItems.sort((a, b) => {
                    return new Date(b.date_posted) - new Date(a.date_posted);
                });
            }
        }
        if(category !== "Select a category"){
            filteredItems = filteredItems.filter((item) => { return item.category === category; });
        }
        setItems(filteredItems);
    };

    const reset = () => {
        setItems([...originalItems]);
    }

    const FilterMenu = () => {
        return (
            <div className="filter-menu">
                <form>
                    <h2>Filter Items</h2>
                    <br />
                    <br />
                    <h4>Price Range</h4>
                    <br />
                    <label htmlFor="min-price">Min (£)</label>
                    <input name="min-price" id="min-price"></input>
                    <label htmlFor="max-price">Max (£)</label>
                    <input name="max-price" id="max-price"></input>
                    <br />
                    <br />
                    <label htmlFor="location-input">Sort by location</label>
                    <br />
                    <select name="location-input" id="location-input">
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
                    <br />
                    <br />
                    <br />
                    <label htmlFor="date-input">Sort by date</label>
                    <br />
                    <select name="date-input" id="date-input">
                            <option>Select date to sort by</option>
                            <option>Oldest</option>
                            <option>Newest</option>
                    </select>
                    <br />
                    <br />
                    <br />
                    <label htmlFor="category-input">Sort by category</label>
                    <br />
                    <select name="category-input" id="category-input">
                            <option>Select a category</option>
                            <option>Electronics/Technology</option>
                            <option>Vehicles/Parts</option>
                            <option>Clothing</option>
                            <option>Houseware</option>
                            <option>Services</option>
                    </select>
                    <br />
                    <br />
                </form>
                <Button name={"Apply"} className={"outline-blue"} onClick={(e) => filter(
                    document.querySelector('#min-price').value,
                    document.querySelector('#max-price').value,
                    document.querySelector('#location-input').options[document.querySelector('#location-input').selectedIndex].value,
                    document.querySelector('#date-input').options[document.querySelector('#date-input').selectedIndex].value,
                    document.querySelector('#category-input').options[document.querySelector('#category-input').selectedIndex].value
                )} />
                <Button name={"Reset"} className={"outline-red"} onClick={(e) => {reset();}} />
            </div>
        );
    }

    if(loading){
        return <Loading />
    }

    return (
        <Route>
            <div className="home">
                <div className="container">
                    <FilterMenu />
                    {/* <div className="items"> */}
                        <Paginator itemsPerPage={9} />
                            {/* {items.map(item => {
                                return <Card key={item.item_id} estCost={item.est_cost} itemName={item.item_name} img={item.key} desc={item.description} itemLocation={item.item_location} datePosted={item.date_posted} userPosted={item.user_posted} itemId={item.item_id}  ></Card>
                            })} */}
                    {/* </div> */}
                </div>
            </div>
        </Route>
    );
};

export default Home;