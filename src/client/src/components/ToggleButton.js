import React, { useState } from 'react';
import Button from './Button';

function ToggleButton(props) {
    const [toggled, setToggled] = useState(false);

    if(toggled){
        return <Button className={props.secondaryClass} name={props.secondary} onClick={() => {toggled ? setToggled(false) : setToggled(true);}} />
    }
    return (
       <Button className={props.primaryClass} name={props.primary} onClick={() => {toggled ? setToggled(false) : setToggled(true);}} />
    );
}

export default ToggleButton;
