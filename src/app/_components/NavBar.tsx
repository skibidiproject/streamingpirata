import NavBarClient from "./NavBarClient";

export default function NavBar()
{
    const accountCenterBaseUrl: string = process.env.ACCOUNT_CENTER_BASE_URL || "";
    return <NavBarClient accountCenterBaseUrl={accountCenterBaseUrl}/>
}