import Link from "next/link";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import "./globals.css";
import SiteThemeProvider from './SiteThemeProvider';

export const metadata = {
  title: "Andrew Ritter's Website",
  description: "Full Stack Web Development and Story",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return(
    <html lang="en" suppressHydrationWarning>
      <head>
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
    
      <body className="doodle">
        <SiteThemeProvider>
      
          
      
          {children}
        </SiteThemeProvider>
      </body>
    </html>

  )
}