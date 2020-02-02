import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';

function ControlledCarousel(props) {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(null);
  
    const handleSelect = (selectedIndex, e) => {
      setIndex(selectedIndex);
      setDirection(e.direction);
    };
  
    return (

      <Carousel activeIndex={index} direction={direction} onSelect={handleSelect}>
        {props.images.map((image) => {
            return  <Carousel.Item>
                      <img
                        className="d-block w-100 h-100"
                        src={image}
                        alt="item"
                      />
                    </Carousel.Item>
        })}
      </Carousel>
    );
  }

  export default ControlledCarousel;