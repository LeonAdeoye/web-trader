import {Card, CardContent, Typography} from "@mui/material";

export const AlertTypeDetailsCardComponent = ({alertSelection}) =>
{
    return(<Card style={{width: '800px', height: '320px'}}>
        <CardContent>
            <div className="alert-configurations-classification">
                <Typography component="span">
                    {`Classification:   `}
                </Typography>
                <Typography className="alert-configurations-value">
                    {alertSelection?.classification || ''}
                </Typography>
            </div>
            <div className="alert-configurations-explanation">
                <Typography component="span">
                    {`Explanation:   `}
                </Typography>
                <Typography className="alert-configurations-value">
                    {alertSelection?.explanation || ''}
                </Typography>
            </div>
            <div className="alert-configurations-expression">
                <Typography component="span">
                    {`Expression:   `}
                </Typography>
                <Typography className="alert-configurations-value">
                    {alertSelection?.expression || ''}
                </Typography>
            </div>
            <div className="alert-configurations-message-template">
                <Typography component="span">
                    {`Message Template:   `}
                </Typography>
                <Typography className="alert-configurations-value">
                    {alertSelection?.messageTemplate || ''}
                </Typography>
            </div>
        </CardContent>
    </Card>);
}
