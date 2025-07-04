import './globals.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';


export const metadata = {
  title: 'Education System',
  description: 'Ananda Collage',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{backgroundColor:'white',margin:'0px'}}>
        {children}
      </body>
    </html>
  );
}
