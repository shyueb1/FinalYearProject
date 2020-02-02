import React, { useState, useContext } from 'react'
import FormContext from '../context/FormContext';

function TextInput() {
    const [inputVal, setInputVal] = useState("");
    const setQuery = useContext(FormContext);

    return (
        <input type="text" value={inputVal} onChange={(e) => { setInputVal(e.target.value); setQuery(e.target.value); }}/>
    );
}

export default TextInput;
