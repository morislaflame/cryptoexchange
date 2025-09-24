import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { observer } from 'mobx-react-lite';

interface MainCardProps {
    data: {
        title: string;
        description: string;
        label: string;
    };
}

const MainCard = observer(({ data }: MainCardProps) => {
    return (
        <Card className='h-full min-h-[200px] hover:shadow-lg transition-all duration-300 hover:scale-105'>
            <CardHeader className='h-full flex flex-col justify-between'>
                <div>
                    <div className='text-sm text-muted-foreground mb-2 font-medium'>
                        {data.label}
                    </div>
                    <CardTitle className='text-xl font-bold mb-3'>
                        {data.title}
                    </CardTitle>
                </div>
                <CardDescription className='text-base leading-relaxed'>
                    {data.description}
                </CardDescription>
            </CardHeader>
        </Card>
    );
});

export default MainCard;  