import React from 'react';
import { Sparklines, SparklinesBars } from 'react-sparklines';

const SparklineRenderer = (props) =>
{
    const { value } = props;

    return (
        <Sparklines data={value} limit={5} margin={5}>
            <SparklinesBars color="blue" />
        </Sparklines>
    );
};

export default SparklineRenderer;
