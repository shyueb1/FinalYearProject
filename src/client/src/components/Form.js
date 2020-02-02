import React, { useState, useContext } from 'react';
import TextInput from './TextInput';
import Button from './Button';
import ItemContext from '../context/ItemContext';
import FormContext from '../context/FormContext';
import '../static/styles/form.css';

function Form() {
    const [query, setQuery] = useState("");
    const [items, setItems] = useContext(ItemContext);
    const [original, setOriginal] = useState([]);
    const [setted, setSetted] = useState(false)

    if(items.length > 0 && !setted){
        setOriginal([...items]);
        setSetted(true);
    }

    return (
        <FormContext.Provider value={setQuery}>
            <form className="search-form" onSubmit={(e) => { 
                e.preventDefault();
                setItems(items.filter((item) => { return item.item_name.toLowerCase().includes(query.toLowerCase()); }));
             }}>
                 <Button name={"Reset search"} className={"outline-red"} onClick={(e) => { e.preventDefault(); setItems([...original]); console.log(original)}} />
                <TextInput />
                <Button className={"find-item-btn outline-blue"} name={"Find item"} />
                {/* <input className={"find-item-btn"} type="submit" value="Find item"></input> */}
            </form>
        </FormContext.Provider>
    );
}

export default Form;
