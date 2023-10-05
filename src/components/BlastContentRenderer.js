import * as React from 'react';

const BlastContentRenderer = (params) =>
{
    const {contents} = params.data;
    const colours = {NEWS: '#4F81BD', FLOWS: 'purple', IOIs: 'darkred'};
    return (contents.map((content, index) => (<span key={index} style={{backgroundColor: `${colours[content]}`, color:'white', marginRight:'4px', padding: '3px'}}>{content}</span>)));
};

export default BlastContentRenderer;
