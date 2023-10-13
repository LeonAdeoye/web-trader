import {Card, CardContent, Typography} from "@mui/material";

export const AlertTypeCardComponent = (alertType) =>
{
    return(
    <Card>
        <CardContent>
            <div className="alert-configurations-classification">
                <Typography component="span">
                    {`Classification:   `}
                </Typography>
                <Typography className="alert-configurations-value">
                    {alertType?.classification || ''}
                </Typography>
            </div>
            <div className="alert-configurations-explanation">
                <Typography component="span">
                    {`Explanation:   `}
                </Typography>
                <Typography className="alert-configurations-value">
                    {alertType?.explanation || ''}
                </Typography>
            </div>
            <div className="alert-configurations-expression">
                <Typography component="span">
                    {`Expression:   `}
                </Typography>
                <Typography className="alert-configurations-value">
                    {alertType?.expression || ''}
                </Typography>
            </div>
            <div className="alert-configurations-message-template">
                <Typography component="span">
                    {`Message Template:   `}
                </Typography>
                <Typography className="alert-configurations-value">
                    {alertType?.messageTemplate || ''}
                </Typography>
            </div>
        </CardContent>
    </Card>);
}
