import * as React from 'react';

const BlastContentRenderer = (params) =>
{
    const {contents} = params.data;
    const colours = {News: '#4F81BD', Holdings: '#528c74', Flows: 'purple'};
    return (contents.map((content, index) => (<span key={index} style={{backgroundColor: `${colours[content]}`, color:'white', marginRight:'4px', padding: '3px'}}>{content}</span>)));
};

export default BlastContentRenderer;
