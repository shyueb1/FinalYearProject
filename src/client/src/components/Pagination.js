import React from 'react';

function Pagination(props) {
    return (
        <div>
            {[...Array(props.numberOfPages)].map((i) => {
                return props.item;
            })}
            <li>
                {[...Array(props.numberOfPages)].reduce((acc, val) => {
                    return <ul>{acc}</ul>;
                })}
            </li>
        </div>
    );
};

export default Pagination; 