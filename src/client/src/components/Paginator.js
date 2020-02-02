import React, { useState, useEffect, useContext } from 'react';
import Button from './Button';
import Card from './Card';
import ItemContext from '../context/ItemContext';
import '../static/styles/paginator.css'

function Paginator(props) {
    const [originalItems, items, setItems] = useContext(ItemContext);
    const [currentPage, setCurrentPage] = useState(0);
    const maxPages = items ? items.length/props.itemsPerPage : 0;

    useEffect(() => {
        setCurrentPage(0);
    }, [items]);

    return (
        <div className="item-container">
            <div className="items">
                {items.map((item, i, a) => {
                    if(i >= currentPage*props.itemsPerPage && i <= (currentPage*props.itemsPerPage+props.itemsPerPage) - 1){
                        return <Card key={item.item_id} estCost={item.est_cost} itemName={item.item_name} img={item.key} desc={item.description} itemLocation={item.item_location} datePosted={item.date_posted} userPosted={item.user_posted} itemId={item.item_id}  ></Card>;
                    }
                })} 
            </div>
            <div className="controls">
                <Button name="Previous" className="outline-blue" onClick={() => {
                    if(currentPage > 0){
                        setCurrentPage(currentPage-1);
                    }
                }}/>
                {[...Array(Math.ceil(items.length/props.itemsPerPage))].map((v, i, a) => {
                    return currentPage == i ?  <Button key={i} name={i+1} onClick={() => {
                        setCurrentPage(i);
                    }} /> : <Button key={i} className="outline-blue" name={i+1} onClick={() => {
                        setCurrentPage(i);
                    }} />
                })}
                <Button name="Next" className="outline-blue" onClick={() => {
                    if(currentPage+1 < maxPages){
                        setCurrentPage(currentPage+1);
                    }
                }}/>
            </div>
        </div>
    )
}

export default Paginator;
