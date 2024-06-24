import { Layout } from "app/layout/layout.types";

export interface User
{
    id?: string;
    name?: string;
    email?: string;
    number?: string;
    avatar?: string;
}

export interface Company
{
    company?: string;
    companyName?: string;
    companySlogan?: string;
    companyImage?: string;
    companyLayout?: Layout;
    companyCoverageImage?: string[];
    companyCoverageTemplate?: string;
}

