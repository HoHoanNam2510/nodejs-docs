import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Nav from './components/Nav';
import Index from './pages/Index';
import NenTang from './pages/NenTang';
import ExpressCore from './pages/ExpressCore';
import ExpressNangCao from './pages/ExpressNangCao';
import MongoDBCore from './pages/MongoDBCore';
import MongoDBNangCao from './pages/MongoDBNangCao';
import Authentication from './pages/Authentication';
import ThucChien from './pages/ThucChien';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <Nav />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/01-nen-tang" element={<NenTang />} />
        <Route path="/02-express-core" element={<ExpressCore />} />
        <Route path="/03-express-nangcao" element={<ExpressNangCao />} />
        <Route path="/04-mongodb-core" element={<MongoDBCore />} />
        <Route path="/05-mongodb-nangcao" element={<MongoDBNangCao />} />
        <Route path="/06-authentication" element={<Authentication />} />
        <Route path="/07-thucchien" element={<ThucChien />} />
      </Routes>
    </>
  );
}
