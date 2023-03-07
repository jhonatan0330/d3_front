export interface User
{
    id: string;
    name: string;
    email: string;
    number?: string;
    company?: string;
    companyName?: string;
    companySlogan?: string;
    companyImage?: string;
    companyCoverageImage?: string[];
    avatar?: string;
    status?: string;
}
